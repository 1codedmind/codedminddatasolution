import { randomUUID } from "crypto";
import { getSql } from "@/lib/db";

export const PLAN_LIMITS = {
  free: { daily: 3,  weekly: 15 },
  pro:  { daily: 50, weekly: null }, // null = no weekly cap
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

// One-time init per server process — safe because all DDL uses IF NOT/EXISTS.
let tablesInitialized = false;

async function ensureTables(): Promise<void> {
  if (tablesInitialized) return;
  const sql = getSql();
  // Add plan column to existing candidates table (idempotent).
  await sql`
    ALTER TABLE IF EXISTS candidates
    ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS resume_parse_log (
      id         TEXT        PRIMARY KEY,
      user_id    TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_rpl_user_created
    ON resume_parse_log (user_id, created_at DESC)
  `;
  tablesInitialized = true;
}

export async function getUserPlan(userId: string): Promise<Plan> {
  await ensureTables();
  const sql = getSql();
  const rows = await sql<{ plan: string }[]>`
    SELECT plan FROM candidates WHERE id = ${userId} LIMIT 1
  `;
  const raw = rows[0]?.plan ?? "free";
  return raw === "pro" ? "pro" : "free";
}

export interface ParseCounts {
  today: number;
  week: number;
}

export async function getUserParseCounts(userId: string): Promise<ParseCounts> {
  await ensureTables();
  const sql = getSql();
  const rows = await sql<{ today: string; week: string }[]>`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day')  AS today,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS week
    FROM resume_parse_log
    WHERE user_id = ${userId}
  `;
  return {
    today: parseInt(rows[0]?.today ?? "0", 10),
    week:  parseInt(rows[0]?.week  ?? "0", 10),
  };
}

export async function recordParseAttempt(userId: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`
    INSERT INTO resume_parse_log (id, user_id, created_at)
    VALUES (${randomUUID()}, ${userId}, NOW())
  `;
}
