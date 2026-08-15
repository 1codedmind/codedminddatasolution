import { randomUUID } from "crypto";

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

/**
 * Record a service enquiry raised through the site assistant.
 *
 * A signed-in visitor asking about our services is a lead, but each follow-up
 * question should not create a new row. Within a six-hour window we append to
 * the existing enquiry instead, so the sales team sees one thread per person
 * rather than a scatter of fragments.
 *
 * Returns true when a new lead row was created.
 */
export async function upsertChatLead(input: {
  name: string;
  email: string;
  question: string;
}): Promise<boolean> {
  await ensureTable();
  const sql = getSql();

  const existing = await sql<{ id: string; message: string | null }[]>`
    SELECT id, message FROM leads
    WHERE email = ${input.email}
      AND source = 'chat_assistant'
      AND created_at > ${new Date(Date.now() - 6 * 60 * 60_000).toISOString()}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const question = input.question.trim().slice(0, 1000);

  if (existing[0]) {
    const merged = `${existing[0].message ?? ""}\n\n— ${question}`.slice(0, 5000);
    await sql`
      UPDATE leads SET message = ${merged} WHERE id = ${existing[0].id}
    `;
    return false;
  }

  await sql`
    INSERT INTO leads (id, name, email, company, phone, message, source, status, created_at)
    VALUES (
      ${randomUUID()},
      ${input.name.slice(0, 100)},
      ${input.email},
      ${null},
      ${null},
      ${`Asked via the site assistant:\n\n— ${question}`},
      ${"chat_assistant"},
      ${"new"},
      ${new Date().toISOString()}
    )
  `;
  return true;
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
