/**
 * Applies the security-hardening migration.
 *
 *   node --env-file=.env.local scripts/migrate-security.mjs
 *
 * Every statement is additive and idempotent — new tables, new indexes, and
 * two new columns with defaults. Nothing is dropped, deleted, or rewritten,
 * and no existing row is modified. Safe to re-run.
 *
 * These objects also self-create the first time the app needs them; running
 * this simply applies them deliberately rather than lazily.
 */
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/migrate-security.mjs");
  process.exit(1);
}

// Match lib/db.ts: HTTP driver for Neon, TCP for a local database.
const isLocal = /localhost|127\.0\.0\.1/.test(url);
const tcp = isLocal ? postgres(url, { max: 1 }) : null;
const sql = isLocal ? tcp : neon(url);

const steps = [
  [
    "rate_limits table",
    (s) => s`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key        TEXT        PRIMARY KEY,
        count      INTEGER     NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      )`,
  ],
  ["rate_limits index", (s) => s`CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at)`],
  [
    "audit_log table",
    (s) => s`
      CREATE TABLE IF NOT EXISTS audit_log (
        id           TEXT        PRIMARY KEY,
        actor_id     TEXT        NOT NULL,
        actor_email  TEXT        NOT NULL,
        actor_role   TEXT        NOT NULL,
        action       TEXT        NOT NULL,
        target_type  TEXT,
        target_id    TEXT,
        detail       TEXT,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
  ],
  ["audit_log created index", (s) => s`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC)`],
  ["audit_log actor index", (s) => s`CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log (actor_id, created_at DESC)`],
  ["audit_log target index", (s) => s`CREATE INDEX IF NOT EXISTS idx_audit_log_target ON audit_log (target_type, target_id)`],
  [
    "candidates.email_verified",
    (s) => s`ALTER TABLE IF EXISTS candidates ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE`,
  ],
  [
    "email_verification_tokens",
    (s) => s`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        token_hash TEXT        PRIMARY KEY,
        email      TEXT        NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at    TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
  ],
  [
    "email_verification index",
    (s) => s`CREATE INDEX IF NOT EXISTS idx_email_verification_email ON email_verification_tokens (email)`,
  ],
  [
    "candidates.session_version",
    (s) => s`ALTER TABLE IF EXISTS candidates ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0`,
  ],
  [
    "team_members.session_version",
    (s) => s`ALTER TABLE IF EXISTS team_members ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0`,
  ],
];

const [{ db }] = await sql`SELECT current_database() AS db`;
console.log(`\nApplying security migration to: ${db}\n`);

for (const [name, run] of steps) {
  try {
    await run(sql);
    console.log(`  OK       ${name}`);
  } catch (err) {
    console.error(`  FAILED   ${name}: ${err.message}`);
    process.exitCode = 1;
  }
}

// Confirm the result rather than trusting that the statements did what we think.
const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('rate_limits', 'audit_log')
  ORDER BY table_name`;
const columns = await sql`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND column_name = 'session_version'
  ORDER BY table_name`;

console.log("\nVerification:");
for (const name of ["audit_log", "rate_limits"]) {
  console.log(`  ${tables.some((t) => t.table_name === name) ? "OK     " : "MISSING"} ${name}`);
}
for (const name of ["candidates", "team_members"]) {
  console.log(`  ${columns.some((c) => c.table_name === name) ? "OK     " : "MISSING"} ${name}.session_version`);
}

// Existing sessions carry no version, which reads as 0 and matches the column
// default — so applying this migration signs nobody out.
console.log("\nNo rows were modified. Existing sessions remain valid.\n");

if (tcp) await tcp.end();
