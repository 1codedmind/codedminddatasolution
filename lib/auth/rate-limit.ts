import { getSql, hasDatabaseUrl } from "@/lib/db";

/**
 * Durable rate limiting.
 *
 * The previous implementation kept counters in a process-local Map. On Vercel
 * every serverless instance has its own memory and instances recycle
 * constantly, so a "8 attempts per 15 minutes" limit was really 8 attempts per
 * instance, reset on every cold start — no meaningful protection at all.
 *
 * Counters now live in Postgres so they are shared across instances. The
 * in-memory path is kept only as a fallback for local development without a
 * database, and as a degraded mode if the database is unreachable.
 */

type Entry = {
  count: number;
  expiresAt: number;
};

const memoryStore = new Map<string, Entry>();

function enforceInMemory(key: string, maxAttempts: number, windowMs: number) {
  const now = Date.now();
  const current = memoryStore.get(key);

  if (!current || current.expiresAt <= now) {
    memoryStore.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (current.count >= maxAttempts) {
    return false;
  }

  current.count += 1;
  memoryStore.set(key, current);
  return true;
}

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key        TEXT        PRIMARY KEY,
      count      INTEGER     NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at)`;
  tableReady = true;
}

/** Opportunistic cleanup so the table cannot grow without bound. */
async function maybeSweep() {
  if (Math.random() > 0.01) return;
  try {
    const sql = getSql();
    await sql`DELETE FROM rate_limits WHERE expires_at < NOW() - INTERVAL '1 hour'`;
  } catch {
    // Sweeping is best-effort; never let it affect the caller.
  }
}

/**
 * Consume one unit against `key`. Returns false once the limit is exceeded.
 *
 * The counter is incremented and read in a single atomic statement, so
 * concurrent requests across instances cannot race past the limit.
 *
 * On database failure this falls back to the in-memory counter rather than
 * blocking the request. That is a deliberate availability choice: a database
 * blip should degrade protection, not lock every user out of signing in.
 */
export async function enforceRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<boolean> {
  if (!hasDatabaseUrl()) {
    return enforceInMemory(key, maxAttempts, windowMs);
  }

  try {
    await ensureTable();
    const sql = getSql();
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

    const rows = await sql<{ count: number }[]>`
      INSERT INTO rate_limits (key, count, expires_at)
      VALUES (${key}, 1, NOW() + make_interval(secs => ${windowSeconds}))
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.expires_at <= NOW() THEN 1
          ELSE rate_limits.count + 1
        END,
        expires_at = CASE
          WHEN rate_limits.expires_at <= NOW() THEN EXCLUDED.expires_at
          ELSE rate_limits.expires_at
        END
      RETURNING count
    `;

    void maybeSweep();

    const count = Number(rows[0]?.count ?? 1);
    return count <= maxAttempts;
  } catch (err) {
    console.error("[rate-limit] store unavailable, falling back to memory:", err);
    return enforceInMemory(key, maxAttempts, windowMs);
  }
}

/**
 * Read a counter without consuming from it.
 *
 * Used for the login lockout, where failures are recorded separately from
 * attempts so that a successful sign-in can clear the record.
 */
export async function getFailureCount(key: string): Promise<number> {
  if (!hasDatabaseUrl()) {
    const entry = memoryStore.get(key);
    if (!entry || entry.expiresAt <= Date.now()) return 0;
    return entry.count;
  }

  try {
    await ensureTable();
    const sql = getSql();
    const rows = await sql<{ count: number }[]>`
      SELECT count FROM rate_limits WHERE key = ${key} AND expires_at > NOW() LIMIT 1
    `;
    return Number(rows[0]?.count ?? 0);
  } catch (err) {
    console.error("[rate-limit] failure lookup failed:", err);
    return 0;
  }
}

/** Record one failed authentication attempt against `key`. */
export async function recordFailure(key: string, windowMs: number): Promise<void> {
  await enforceRateLimit(key, Number.MAX_SAFE_INTEGER, windowMs);
}

/** Clear a failure counter — called after a successful sign-in. */
export async function clearFailures(key: string): Promise<void> {
  if (!hasDatabaseUrl()) {
    memoryStore.delete(key);
    return;
  }
  try {
    await ensureTable();
    const sql = getSql();
    await sql`DELETE FROM rate_limits WHERE key = ${key}`;
  } catch (err) {
    console.error("[rate-limit] failure reset failed:", err);
  }
}
