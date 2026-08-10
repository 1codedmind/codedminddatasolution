import { getSql } from "@/lib/db";
import type { Lead } from "@/lib/schema";

export type { Lead };

export async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      company     TEXT,
      phone       TEXT,
      message     TEXT,
      source      TEXT,
      status      TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT,
      created_at  TEXT NOT NULL
    )
  `;
  // Older deployments created this table from scripts/setup-db.ts, which had
  // neither status/assigned_to nor phone. CREATE TABLE IF NOT EXISTS is a no-op
  // there, so bring those rows up to date explicitly.
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to TEXT`;
}

export async function getLeads(limit = 500): Promise<Lead[]> {
  await ensureTable();
  const sql = getSql();
  return sql<Lead[]>`
    SELECT id, name, email, company, phone, message, source, status, assigned_to AS "assignedTo", created_at AS "createdAt"
    FROM leads
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function getLeadCount(): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const [row] = await sql<[{ count: string }]>`
    SELECT COUNT(*)::text AS count FROM leads
  `;
  return parseInt(row.count, 10);
}

export async function getLeadsThisMonth(): Promise<number> {
  await ensureTable();
  const sql = getSql();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [row] = await sql<[{ count: string }]>`
    SELECT COUNT(*)::text AS count FROM leads
    WHERE created_at >= ${monthStart.toISOString()}
  `;
  return parseInt(row.count, 10);
}
