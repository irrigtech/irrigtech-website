// Server-side usage limits for the chat assistant, stored in Netlify Blobs.
//
// Three counters, all checked before any paid API call is made:
//   - per visitor, per minute   (burst protection)
//   - per visitor, per day      (abuse protection)
//   - whole site, per day       (hard cost ceiling)
// Visitors are keyed by a salted SHA-256 hash of their IP address, never the raw IP.
// Counters are updated with compare-and-swap (ETag) writes so concurrent requests
// cannot both slip under a limit.

import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const STORE = "irrigtech-chat-limits";

export function limitsFromEnv(env = process.env) {
  const num = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : d);
  return {
    perMinute: num(env.CHAT_LIMIT_PER_MINUTE, 6),
    perDay: num(env.CHAT_LIMIT_PER_IP_PER_DAY, 40),
    globalPerDay: num(env.CHAT_LIMIT_GLOBAL_PER_DAY, 100),
  };
}

export function hashIp(ip, salt) {
  return createHash("sha256").update(`${salt}|${ip || "unknown"}`).digest("hex").slice(0, 32);
}

// Pure decision function (unit-tested): given the stored record for a key and the
// current time, return the updated record or the reason the request is refused.
export function applyVisitor(record, now, limits) {
  const day = new Date(now).toISOString().slice(0, 10);
  const minute = Math.floor(now / 60000);
  let r = record && record.day === day ? { ...record } : { day, dayCount: 0, minute, minuteCount: 0 };
  if (r.minute !== minute) { r.minute = minute; r.minuteCount = 0; }
  if (r.dayCount >= limits.perDay) return { ok: false, reason: "daily" };
  if (r.minuteCount >= limits.perMinute) return { ok: false, reason: "minute", retryAfter: 60 - Math.floor((now / 1000) % 60) };
  r.dayCount += 1; r.minuteCount += 1;
  return { ok: true, record: r };
}

export function applyGlobal(record, now, limits) {
  const day = new Date(now).toISOString().slice(0, 10);
  const r = record && record.day === day ? { ...record } : { day, count: 0 };
  if (r.count >= limits.globalPerDay) return { ok: false, reason: "global" };
  r.count += 1;
  return { ok: true, record: r };
}

async function casUpdate(store, key, apply, attempts = 5) {
  for (let i = 0; i < attempts; i++) {
    const current = await store.getWithMetadata(key, { type: "json" });
    const result = apply(current?.data ?? null);
    if (!result.ok) return result;
    const opts = current ? { onlyIfMatch: current.etag } : { onlyIfNew: true };
    const { modified } = await store.setJSON(key, result.record, opts);
    if (modified) return result;
  }
  return { ok: false, reason: "busy" };
}

export async function purgeOldDays(store, today) {
  const { blobs } = await store.list();
  const old = blobs.filter((b) => !b.key.startsWith(`${today}/`));
  for (let i = 0; i < old.length; i += 20) await Promise.all(old.slice(i, i + 20).map((b) => store.delete(b.key)));
  return old.length;
}

// Returns { ok: true } or { ok: false, reason, retryAfter? }.
// Throws if Blobs is unreachable; the caller treats that as "unavailable" (fail closed).
export async function checkAndCount({ ip, salt, limits, now = Date.now(), store }) {
  store ??= getStore({ name: STORE, consistency: "strong" });
  const day = new Date(now).toISOString().slice(0, 10);
  // All counters live under the current UTC day, so past days can be deleted wholesale.
  const visitorKey = `${day}/visitor/${hashIp(ip, salt)}`;

  const visitor = await casUpdate(store, visitorKey, (rec) => applyVisitor(rec, now, limits));
  if (!visitor.ok) return visitor;

  const global = await casUpdate(store, `${day}/global`, (rec) => applyGlobal(rec, now, limits));
  if (!global.ok) return global;

  // Housekeeping on a small share of requests: delete every counter from previous days.
  if (Math.random() < 0.05) await purgeOldDays(store, day).catch(() => {});
  return { ok: true };
}
