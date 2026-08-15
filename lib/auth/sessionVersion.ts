import { getSql, hasDatabaseUrl } from "@/lib/db";

/**
 * Session invalidation.
 *
 * Session tokens are stateless and signed, so there is nothing to delete when
 * a password changes — a stolen token would stay valid until it expired. That
 * is exactly backwards: resetting a password is the moment a user most expects
 * an attacker to be locked out.
 *
 * Each account carries a `session_version` that is embedded in every token it
 * issues. Bumping the column invalidates every token issued before the bump,
 * which gives password reset real teeth and doubles as "sign out everywhere".
 */

export type AccountKind = "candidate" | "team";

let columnsReady = false;

async function ensureColumns() {
  if (columnsReady) return;
  const sql = getSql();
  // Default 0 matches the version carried by tokens issued before this
  // existed, so nobody is signed out by the migration itself.
  await sql`ALTER TABLE IF EXISTS candidates   ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE IF EXISTS team_members ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0`;
  columnsReady = true;
}

/** Current version for an account. Returns 0 when unknown. */
export async function getSessionVersion(kind: AccountKind, id: string): Promise<number> {
  if (!hasDatabaseUrl()) return 0;
  await ensureColumns();
  const sql = getSql();

  const rows =
    kind === "team"
      ? await sql<{ v: number }[]>`SELECT session_version AS v FROM team_members WHERE id = ${id} LIMIT 1`
      : await sql<{ v: number }[]>`SELECT session_version AS v FROM candidates   WHERE id = ${id} LIMIT 1`;

  return Number(rows[0]?.v ?? 0);
}

/** Invalidate every existing session for an account, and return the new version. */
export async function bumpSessionVersion(kind: AccountKind, email: string): Promise<number> {
  if (!hasDatabaseUrl()) return 0;
  await ensureColumns();
  const sql = getSql();

  const rows =
    kind === "team"
      ? await sql<{ v: number }[]>`
          UPDATE team_members SET session_version = session_version + 1
          WHERE email = ${email} RETURNING session_version AS v
        `
      : await sql<{ v: number }[]>`
          UPDATE candidates SET session_version = session_version + 1
          WHERE email = ${email} RETURNING session_version AS v
        `;

  return Number(rows[0]?.v ?? 0);
}
