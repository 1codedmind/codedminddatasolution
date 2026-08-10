import { randomUUID } from "crypto";

import { getSql } from "@/lib/db";
import { findTeamMemberByEmail } from "@/lib/auth/team";
import type { UserRole } from "@/lib/auth/session";
import type { GoogleProfile } from "@/lib/auth/oauth/google";

/**
 * Links a social identity to an existing account, or creates a candidate.
 *
 * Every statement below is additive — new tables, and relaxing two NOT NULL
 * constraints so that an OAuth-only account can exist without a password.
 * No existing row is read, rewritten, or removed by this migration.
 */

// One-time init per server process — all DDL is idempotent.
let tablesInitialized = false;

async function ensureTables(): Promise<void> {
  if (tablesInitialized) return;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS candidate_identities (
      provider          TEXT        NOT NULL,
      provider_user_id  TEXT        NOT NULL,
      candidate_id      TEXT        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
      email             TEXT        NOT NULL,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (provider, provider_user_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_candidate_identities_candidate
    ON candidate_identities (candidate_id)
  `;

  // Staff links live in their own table because the foreign key targets a
  // different table. A staff row is only ever linked, never created, here.
  await sql`
    CREATE TABLE IF NOT EXISTS team_member_identities (
      provider          TEXT        NOT NULL,
      provider_user_id  TEXT        NOT NULL,
      team_member_id    TEXT        NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
      email             TEXT        NOT NULL,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (provider, provider_user_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_team_member_identities_member
    ON team_member_identities (team_member_id)
  `;

  // A user who only ever signs in with Google has no password. Dropping
  // NOT NULL does not touch existing rows — stored hashes are unaffected.
  await sql`ALTER TABLE IF EXISTS candidates ALTER COLUMN password_hash DROP NOT NULL`;
  await sql`ALTER TABLE IF EXISTS candidates ALTER COLUMN password_salt DROP NOT NULL`;

  tablesInitialized = true;
}

export type ResolvedSession = {
  sub: string;
  email: string;
  role: UserRole;
};

export type LinkResult =
  | { ok: true; session: ResolvedSession; created: boolean }
  | { ok: false; reason: "email_unverified" | "account_inactive" };

/**
 * Resolve a Google profile to an account, creating or linking as needed.
 *
 * Linking policy, in order:
 *  1. Known (provider, sub) for a staff member → that staff account, with the
 *     role read fresh from team_members on every sign-in.
 *  2. Known (provider, sub) for a candidate → that candidate. The subject id is
 *     stable even if the user later changes their Google email.
 *  3. Unverified email → refuse. Matching an unverified address against an
 *     existing account would let anyone claim that account.
 *  4. Email matches a team member → link, and sign in with their existing role.
 *  5. Email matches an existing candidate → link, so the password and Google
 *     paths reach the same account.
 *  6. Otherwise → create a new passwordless candidate.
 *
 * Google never determines a role. It only proves control of an email address;
 * the role always comes from the team_members row that already exists. No staff
 * account is ever created here.
 */
export async function findOrCreateUserForGoogle(profile: GoogleProfile): Promise<LinkResult> {
  await ensureTables();
  const sql = getSql();

  // 1. Staff identity already linked. Role and active flag are re-read every
  //    time, so revoking access in HRMS takes effect on the next sign-in.
  const staffIdentity = await sql<{ id: string; email: string; role: UserRole; isActive: boolean }[]>`
    SELECT t.id, t.email, t.role, t.is_active AS "isActive"
    FROM team_member_identities i
    JOIN team_members t ON t.id = i.team_member_id
    WHERE i.provider = 'google' AND i.provider_user_id = ${profile.sub}
    LIMIT 1
  `;

  if (staffIdentity[0]) {
    const staff = staffIdentity[0];
    if (!staff.isActive) {
      return { ok: false, reason: "account_inactive" };
    }
    return {
      ok: true,
      session: { sub: staff.id, email: staff.email, role: staff.role },
      created: false,
    };
  }

  // 2. Candidate identity already linked.
  const candidateIdentity = await sql<{ id: string; email: string }[]>`
    SELECT c.id, c.email
    FROM candidate_identities i
    JOIN candidates c ON c.id = i.candidate_id
    WHERE i.provider = 'google' AND i.provider_user_id = ${profile.sub}
    LIMIT 1
  `;

  if (candidateIdentity[0]) {
    return {
      ok: true,
      session: { ...candidateIdentity[0], sub: candidateIdentity[0].id, role: "candidate" },
      created: false,
    };
  }

  // 3. Never trust an unverified address for matching or account creation.
  if (!profile.emailVerified) {
    return { ok: false, reason: "email_unverified" };
  }

  // 4. Existing staff account with this verified email → link.
  const teamMember = await findTeamMemberByEmail(profile.email);
  if (teamMember) {
    if (!teamMember.isActive) {
      return { ok: false, reason: "account_inactive" };
    }
    await linkTeamMemberIdentity(teamMember.id, profile);
    return {
      ok: true,
      session: { sub: teamMember.id, email: teamMember.email, role: teamMember.role },
      created: false,
    };
  }

  // 5. Existing candidate with this verified email → link.
  const existingCandidate = await sql<{ id: string; email: string }[]>`
    SELECT id, email FROM candidates WHERE email = ${profile.email} LIMIT 1
  `;

  if (existingCandidate[0]) {
    await linkCandidateIdentity(existingCandidate[0].id, profile);
    return {
      ok: true,
      session: { sub: existingCandidate[0].id, email: existingCandidate[0].email, role: "candidate" },
      created: false,
    };
  }

  // 6. New passwordless candidate.
  const id = randomUUID();
  const fullName = (profile.name ?? profile.email.split("@")[0] ?? "Candidate").slice(0, 80);
  const createdAt = new Date().toISOString();

  await sql`
    INSERT INTO candidates (id, full_name, email, role, created_at)
    VALUES (${id}, ${fullName}, ${profile.email}, 'candidate', ${createdAt})
  `;
  await linkCandidateIdentity(id, profile);

  return {
    ok: true,
    session: { sub: id, email: profile.email, role: "candidate" },
    created: true,
  };
}

async function linkCandidateIdentity(candidateId: string, profile: GoogleProfile) {
  const sql = getSql();
  await sql`
    INSERT INTO candidate_identities (provider, provider_user_id, candidate_id, email)
    VALUES ('google', ${profile.sub}, ${candidateId}, ${profile.email})
    ON CONFLICT (provider, provider_user_id) DO NOTHING
  `;
}

async function linkTeamMemberIdentity(teamMemberId: string, profile: GoogleProfile) {
  const sql = getSql();
  await sql`
    INSERT INTO team_member_identities (provider, provider_user_id, team_member_id, email)
    VALUES ('google', ${profile.sub}, ${teamMemberId}, ${profile.email})
    ON CONFLICT (provider, provider_user_id) DO NOTHING
  `;
}
