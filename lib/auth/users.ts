import { randomUUID } from "crypto";

import { getSql } from "@/lib/db";
import { hashPassword } from "@/lib/auth/crypto";
import { CandidateUser, CandidateUserRecord } from "@/lib/auth/types";

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS candidates (
      id          TEXT PRIMARY KEY,
      full_name   TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      role        TEXT NOT NULL DEFAULT 'candidate',
      created_at  TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL
    )
  `;
}

export async function findCandidateByEmail(email: string): Promise<CandidateUserRecord | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql<CandidateUserRecord[]>`
    SELECT
      id,
      full_name   AS "fullName",
      email,
      role,
      created_at  AS "createdAt",
      password_hash AS "passwordHash",
      password_salt AS "passwordSalt"
    FROM candidates
    WHERE email = ${email}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function findCandidateById(id: string): Promise<CandidateUserRecord | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql<CandidateUserRecord[]>`
    SELECT
      id,
      full_name   AS "fullName",
      email,
      role,
      created_at  AS "createdAt",
      password_hash AS "passwordHash",
      password_salt AS "passwordSalt"
    FROM candidates
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createCandidateUser(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<CandidateUser | null> {
  await ensureTable();
  const sql = getSql();

  const { hash, salt } = hashPassword(input.password);
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const fullName = input.fullName.trim();

  try {
    await sql`
      INSERT INTO candidates (id, full_name, email, role, created_at, password_hash, password_salt)
      VALUES (${id}, ${fullName}, ${input.email}, 'candidate', ${createdAt}, ${hash}, ${salt})
    `;
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return null;
    }
    throw err;
  }

  return { id, fullName, email: input.email, role: "candidate", createdAt };
}

export function sanitizeCandidateUser(user: CandidateUserRecord): CandidateUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
