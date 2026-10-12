import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { backfillProfile, emptyProfile, type HistoryEntry, type Profile } from "./profile";
import { readProfileBackup, writeProfileBackup, readHistoryBackup, writeHistoryBackup } from "./browserBackup";

const HISTORY_CAP = 200;

/** True when running on Vercel (or anywhere) with Upstash REST credentials configured. */
function hasRedis(): boolean {
  return !!((process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN));
}

function hasBrowserBackup(): boolean {
  return hasRedis() || process.env.VERCEL === "1" || !!process.env.PROFILE_COOKIE_SECRET;
}

let redisUnavailableUntil = 0;
async function tryRedis<T>(operation: () => Promise<T>): Promise<T | null> {
  if (!hasRedis() || Date.now() < redisUnavailableUntil) return null;
  try {
    return await operation();
  } catch {
    // A deleted/paused database must not prevent questions or grading.
    redisUnavailableUntil = Date.now() + 60_000;
    console.warn("Redis unavailable; using signed browser progress backups for 60 seconds.");
    return null;
  }
}

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)!,
      token: (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)!,
      retry: false,
      signal: () => AbortSignal.timeout(1500),
    });
  }
  return _redis;
}

/** Per-user blob in Redis: profile + capped history together. */
type UserBlob = {
  profile: Profile;
  history: HistoryEntry[];
};

function userKey(uid: string): string {
  return `m220:user:${uid}`;
}

// ---------- Filesystem dev fallback ----------
// Local development reads/writes the same data/* files as before, ignoring uid.
// This keeps `npm run dev` zero-config while production uses Redis.

const DATA_DIR = path.join(process.cwd(), "data");
const PROFILE_PATH = path.join(DATA_DIR, "profile.json");
const HISTORY_PATH = path.join(DATA_DIR, "question-history.jsonl");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function fsReadProfile(): Promise<Profile> {
  try {
    const raw = await fs.readFile(PROFILE_PATH, "utf8");
    return backfillProfile(JSON.parse(raw) as Profile);
  } catch {
    const p = emptyProfile();
    await fsWriteProfile(p);
    return p;
  }
}

async function fsWriteProfile(p: Profile): Promise<void> {
  await ensureDataDir();
  p.updatedAt = Date.now();
  await fs.writeFile(PROFILE_PATH, JSON.stringify(p, null, 2));
}

async function fsAppendHistory(entry: HistoryEntry): Promise<void> {
  await ensureDataDir();
  await fs.appendFile(HISTORY_PATH, JSON.stringify(entry) + "\n");
}

async function fsReadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await fs.readFile(HISTORY_PATH, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as HistoryEntry);
  } catch {
    return [];
  }
}

// ---------- Redis production path ----------

async function kvReadBlob(uid: string): Promise<UserBlob> {
  const blob = await redis().get<UserBlob>(userKey(uid));
  if (!blob) {
    const profile = emptyProfile();
    profile.updatedAt = 0;
    return { profile, history: [] };
  }
  return { profile: backfillProfile(blob.profile), history: blob.history ?? [] };
}

async function kvWriteBlob(uid: string, blob: UserBlob): Promise<void> {
  blob.profile.updatedAt = Date.now();
  await redis().set(userKey(uid), blob);
}

// ---------- Public API ----------

export async function getProfile(uid: string): Promise<Profile> {
  if (!hasBrowserBackup()) return fsReadProfile();
  const backup = await readProfileBackup(uid);
  const blob = await tryRedis(() => kvReadBlob(uid));
  // Keep progress earned during an outage when Redis comes back online.
  const profile = backup && (!blob || backup.updatedAt > blob.profile.updatedAt)
    ? backfillProfile(backup) : blob?.profile ?? emptyProfile();
  await writeProfileBackup(uid, profile);
  return profile;
}

export async function saveProfile(uid: string, p: Profile): Promise<void> {
  if (!hasBrowserBackup()) return fsWriteProfile(p);
  p.updatedAt = Date.now();
  await writeProfileBackup(uid, p);
  await tryRedis(async () => {
    const blob = await kvReadBlob(uid);
    blob.profile = p;
    await kvWriteBlob(uid, blob);
    return true;
  });
}

export async function getHistory(uid: string): Promise<HistoryEntry[]> {
  if (!hasBrowserBackup()) return fsReadHistory();
  const backup = await readHistoryBackup(uid) ?? [];
  const blob = await tryRedis(() => kvReadBlob(uid));
  return mergeHistory(backup, blob?.history ?? []);
}

export async function appendHistory(uid: string, entry: HistoryEntry): Promise<void> {
  if (!hasBrowserBackup()) return fsAppendHistory(entry);
  const history = mergeHistory([entry], await getHistory(uid));
  await writeHistoryBackup(uid, history);
  await tryRedis(async () => {
    const blob = await kvReadBlob(uid);
    blob.history = mergeHistory(history, blob.history);
    await kvWriteBlob(uid, blob);
    return true;
  });
}

function mergeHistory(a: HistoryEntry[], b: HistoryEntry[]): HistoryEntry[] {
  return [...new Map([...a, ...b].map((entry) => [`${entry.questionId}:${entry.ts}`, entry])).values()]
    .sort((a, b) => b.ts - a.ts).slice(0, HISTORY_CAP);
}

// ---------- Rate limiting ----------

let _limiter: Ratelimit | null = null;

/**
 * Returns a per-user sliding-window limiter (30 req / 10 sec) when Redis is
 * configured; returns null in dev (no limit). Call `limiter.limit(uid)` and
 * check `success` in the API route.
 */
function redisRateLimiter(): Ratelimit | null {
  if (!hasRedis()) return null;
  if (!_limiter) {
    _limiter = new Ratelimit({
      redis: redis(),
      limiter: Ratelimit.slidingWindow(30, "10 s"),
      analytics: false,
      prefix: "m220:rl",
    });
  }
  return _limiter;
}

const localRequests = new Map<string, { count: number; reset: number }>();
export function getRateLimiter() {
  if (!hasBrowserBackup()) return null;
  return {
    async limit(key: string): Promise<{ success: boolean }> {
      const result = await tryRedis(async () => redisRateLimiter()!.limit(key));
      if (result) return result;
      // Best-effort protection during outages; bounded per-function memory.
      const now = Date.now();
      for (const [uid, window] of localRequests) {
        if (window.reset <= now) localRequests.delete(uid);
      }
      if (localRequests.size >= 10000 && !localRequests.has(key)) return { success: false };
      const window = localRequests.get(key) ?? { count: 0, reset: now + 10000 };
      window.count += 1;
      localRequests.set(key, window);
      return { success: window.count <= 30 };
    },
  };
}
