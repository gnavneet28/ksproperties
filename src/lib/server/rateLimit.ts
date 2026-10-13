import "server-only";

/**
 * In-memory rate limit + duplicate detection.
 * Serverless instances don't share memory, so this is best-effort; swap for
 * Upstash/Vercel KV if abuse becomes a problem. The Sheet remains the source of truth.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const ipHits = new Map<string, number[]>();
const phoneSeen = new Map<string, number>();

function prune() {
  if (ipHits.size + phoneSeen.size < 5000) return;
  const now = Date.now();
  for (const [k, v] of ipHits) if (v.every((t) => now - t > HOUR)) ipHits.delete(k);
  for (const [k, t] of phoneSeen) if (now - t > DAY) phoneSeen.delete(k);
}

export function rateLimited(ip: string, limit = 5) {
  if (!ip) return false;
  prune();
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < HOUR);
  if (hits.length >= limit) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

/** Returns true if this phone already submitted in the last 24 h; records the submission. */
export function isDuplicatePhone(phone: string) {
  const now = Date.now();
  const last = phoneSeen.get(phone);
  phoneSeen.set(phone, now);
  return last !== undefined && now - last < DAY;
}
