import { getSql } from "@/lib/db";
import type { TeamMemberRole } from "@/lib/schema";

export type TeamMemberRecord = {
  id: string;
  fullName: string;
  email: string;
  role: TeamMemberRole;
  isActive: boolean;
  createdAt: string;
  passwordHash: string;
  passwordSalt: string;
};

export async function findTeamMemberByEmail(email: string): Promise<TeamMemberRecord | null> {
  const sql = getSql();
  const rows = await sql<TeamMemberRecord[]>`
    SELECT
      id,
      full_name     AS "fullName",
      email,
      role,
      is_active     AS "isActive",
      created_at    AS "createdAt",
      password_hash AS "passwordHash",
      password_salt AS "passwordSalt"
    FROM team_members
    WHERE email = ${email}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
