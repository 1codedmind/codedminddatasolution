import { getSql } from "@/lib/db";
import { DEFAULT_TENANT_ID } from "./types";

let initPromise: Promise<void> | null = null;

export function ensureExamTables(): Promise<void> {
  // Once tables exist (npx tsx scripts/setup-exam-db.ts), set EXAM_SKIP_DDL=1
  // to keep this out of the request path. In dev every recompile resets module
  // state, so without the flag the DDL round-trips re-run against the remote
  // DB on each first request — seconds of latency to us-east-1.
  if (process.env.EXAM_SKIP_DDL === "1") return Promise.resolve();
  if (!initPromise) initPromise = _init();
  return initPromise;
}

async function _init() {
  const sql = getSql();

  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS exam_tenants (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      slug       TEXT NOT NULL UNIQUE,
      settings   JSONB NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL
    )`,

    sql`CREATE TABLE IF NOT EXISTS exam_questions (
      id         TEXT PRIMARY KEY,
      tenant_id  TEXT NOT NULL,
      type       TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      status     TEXT NOT NULL DEFAULT 'draft',
      content    JSONB NOT NULL,
      tags       TEXT[] NOT NULL DEFAULT '{}',
      marks      INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ]);

  // Indexes and seed after tables exist. Every question-bank query filters on
  // tenant_id first, so it leads each index.
  await Promise.all([
    sql`CREATE INDEX IF NOT EXISTS idx_exam_questions_tenant
        ON exam_questions (tenant_id, status, updated_at DESC)`,
    sql`CREATE INDEX IF NOT EXISTS idx_exam_questions_tags
        ON exam_questions USING GIN (tags)`,
    sql`INSERT INTO exam_tenants (id, name, slug, created_at)
        VALUES (${DEFAULT_TENANT_ID}, 'Coded Mind', ${DEFAULT_TENANT_ID}, ${new Date().toISOString()})
        ON CONFLICT (id) DO NOTHING`,
  ]);
}
