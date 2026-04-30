import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { backfillProfile, emptyProfile, type HistoryEntry, type Profile } from "./profile";

const HISTORY_CAP = 200;

/** True when running on Vercel (or anywhere) with Upstash REST credentials configured. */
function hasRedis(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let _redis: Redis | null = null;
function redis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
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
    return { profile: emptyProfile(), history: [] };
  }
  return { profile: backfillProfile(blob.profile), history: blob.history ?? [] };
}

async function kvWriteBlob(uid: string, blob: UserBlob): Promise<void> {
  blob.profile.updatedAt = Date.now();
  await redis().set(userKey(uid), blob);
}

// ---------- Public API ----------

export async function getProfile(uid: string): Promise<Profile> {
  if (hasRedis()) {
    return (await kvReadBlob(uid)).profile;
  }
  return fsReadProfile();
}

export async function saveProfile(uid: string, p: Profile): Promise<void> {
  if (hasRedis()) {
    const blob = await kvReadBlob(uid);
    blob.profile = p;
    await kvWriteBlob(uid, blob);
    return;
  }
  await fsWriteProfile(p);
}

export async function getHistory(uid: string): Promise<HistoryEntry[]> {
  if (hasRedis()) {
    return (await kvReadBlob(uid)).history;
  }
  return fsReadHistory();
}

export async function appendHistory(uid: string, entry: HistoryEntry): Promise<void> {
  if (hasRedis()) {
    const blob = await kvReadBlob(uid);
    blob.history = [entry, ...blob.history].slice(0, HISTORY_CAP);
    await kvWriteBlob(uid, blob);
    return;
  }
  await fsAppendHistory(entry);
}

// ---------- Rate limiting ----------

let _limiter: Ratelimit | null = null;

/**
 * Returns a per-user sliding-window limiter (30 req / 10 sec) when Redis is
 * configured; returns null in dev (no limit). Call `limiter.limit(uid)` and
 * check `success` in the API route.
 */
export function getRateLimiter(): Ratelimit | null {
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
