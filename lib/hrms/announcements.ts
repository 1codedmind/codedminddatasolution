import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  departmentId: string | null;
  departmentName: string | null;
  isPinned: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listAnnouncements(): Promise<Announcement[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<Announcement[]>`
    SELECT
      a.id,
      a.title,
      a.body,
      a.audience,
      a.department_id   AS "departmentId",
      d.name            AS "departmentName",
      a.is_pinned       AS "isPinned",
      a.published_at    AS "publishedAt",
      a.expires_at      AS "expiresAt",
      a.created_by      AS "createdBy",
      tm.full_name      AS "createdByName",
      a.created_at      AS "createdAt",
      a.updated_at      AS "updatedAt"
    FROM announcements a
    LEFT JOIN departments d ON d.id = a.department_id
    LEFT JOIN team_members tm ON tm.id = a.created_by
    WHERE a.published_at IS NOT NULL
      AND (a.expires_at IS NULL OR a.expires_at > NOW()::text)
    ORDER BY a.is_pinned DESC, a.published_at DESC
  `;
}

export async function listAllAnnouncements(): Promise<Announcement[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<Announcement[]>`
    SELECT
      a.id,
      a.title,
      a.body,
      a.audience,
      a.department_id   AS "departmentId",
      d.name            AS "departmentName",
      a.is_pinned       AS "isPinned",
      a.published_at    AS "publishedAt",
      a.expires_at      AS "expiresAt",
      a.created_by      AS "createdBy",
      tm.full_name      AS "createdByName",
      a.created_at      AS "createdAt",
      a.updated_at      AS "updatedAt"
    FROM announcements a
    LEFT JOIN departments d ON d.id = a.department_id
    LEFT JOIN team_members tm ON tm.id = a.created_by
    ORDER BY a.is_pinned DESC, a.created_at DESC
  `;
}

export async function createAnnouncement(input: {
  title: string;
  body: string;
  audience?: string;
  departmentId?: string;
  isPinned?: boolean;
  expiresAt?: string;
  createdBy: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO announcements (
      id, title, body, audience, department_id, is_pinned,
      published_at, expires_at, created_by, created_at, updated_at
    ) VALUES (
      ${id}, ${input.title}, ${input.body},
      ${input.audience ?? "all"}, ${input.departmentId ?? null},
      ${input.isPinned ?? false}, ${now},
      ${input.expiresAt ?? null}, ${input.createdBy}, ${now}, ${now}
    )
  `;
  return { id };
}

export async function togglePin(id: string, isPinned: boolean): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`UPDATE announcements SET is_pinned = ${isPinned}, updated_at = ${now} WHERE id = ${id}`;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  await sql`DELETE FROM announcements WHERE id = ${id}`;
}
