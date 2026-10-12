import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateSync, inflateSync } from "node:zlib";
import { cookies } from "next/headers";
import type { HistoryEntry, Profile } from "./profile";

// Signed, httpOnly snapshots survive function restarts without a writable disk.
// Redis remains the primary store; browser backups retain a smaller mistake log.
const MAX_COOKIE_BYTES = 3500;
const OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api",
  maxAge: 60 * 60 * 24 * 365,
};

function secret(): string {
  const key = process.env.PROFILE_COOKIE_SECRET ?? process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!key) throw new Error("Configure PROFILE_COOKIE_SECRET for browser progress backups.");
  return key;
}

function encode(uid: string, value: unknown): string {
  const payload = deflateSync(JSON.stringify({ v: 1, uid, value })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

async function read<T>(name: string, uid: string): Promise<T | null> {
  const raw = (await cookies()).get(name)?.value;
  if (!raw || raw.length > MAX_COOKIE_BYTES) return null;
  try {
    const [payload, signature] = raw.split(".");
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const decoded = JSON.parse(inflateSync(Buffer.from(payload, "base64url"), { maxOutputLength: 65536 }).toString());
    return decoded.v === 1 && decoded.uid === uid ? decoded.value as T : null;
  } catch {
    return null;
  }
}

export const readProfileBackup = (uid: string) => read<Profile>("m220_profile", uid);
export const readHistoryBackup = (uid: string) => read<HistoryEntry[]>("m220_history", uid);

export async function writeProfileBackup(uid: string, profile: Profile): Promise<void> {
  const snapshot = { ...profile, srs: profile.srs.slice(0, 30) };
  let value = encode(uid, snapshot);
  // Preserve totals, mastery and today's challenge; trim only review scheduling.
  while (value.length > MAX_COOKIE_BYTES && snapshot.srs.length) {
    snapshot.srs.pop();
    value = encode(uid, snapshot);
  }
  if (value.length > MAX_COOKIE_BYTES) throw new Error("Progress backup exceeds cookie size limit.");
  (await cookies()).set("m220_profile", value, OPTIONS);
}

export async function writeHistoryBackup(uid: string, entries: HistoryEntry[]): Promise<void> {
  const snapshot = entries.slice(0, 10);
  let value = encode(uid, snapshot);
  while (value.length > MAX_COOKIE_BYTES && snapshot.length) {
    snapshot.pop();
    value = encode(uid, snapshot);
  }
  (await cookies()).set("m220_history", value, OPTIONS);
}
