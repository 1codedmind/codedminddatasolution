import { createHash, randomBytes } from "crypto";

import { getSql } from "@/lib/db";
import { hashPassword } from "@/lib/auth/crypto";
import { findCandidateByEmail } from "@/lib/auth/users";
import { findTeamMemberByEmail } from "@/lib/auth/team";

export type UserKind = "candidate" | "team";

const TOKEN_TTL_MS = 60 * 60 * 1000; // reset links valid for 1 hour

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      email      TEXT NOT NULL,
      user_kind  TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used_at    TEXT
    )
  `;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Look up which store (if any) holds this email. */
export async function findUserKindByEmail(email: string): Promise<UserKind | null> {
  const team = await findTeamMemberByEmail(email);
  if (team) return team.isActive ? "team" : null;
  const candidate = await findCandidateByEmail(email);
  return candidate ? "candidate" : null;
}

/** Create a reset token for the email. Returns the raw token (only ever exists in the email link). */
export async function createResetToken(email: string, kind: UserKind): Promise<string> {
  await ensureTable();
  const sql = getSql();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  // Invalidate any previous unused tokens for this email first
  await sql`DELETE FROM password_reset_tokens WHERE email = ${email} AND used_at IS NULL`;
  await sql`
    INSERT INTO password_reset_tokens (token_hash, email, user_kind, expires_at)
    VALUES (${hashToken(token)}, ${email}, ${kind}, ${expiresAt})
  `;
  return token;
}

/** Validate a raw token. Returns the owning email/kind, or null if invalid/expired/used. */
export async function verifyResetToken(token: string): Promise<{ email: string; kind: UserKind } | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql<{ email: string; userKind: UserKind; expiresAt: string; usedAt: string | null }[]>`
    SELECT email, user_kind AS "userKind", expires_at AS "expiresAt", used_at AS "usedAt"
    FROM password_reset_tokens
    WHERE token_hash = ${hashToken(token)}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) return null;
  return { email: row.email, kind: row.userKind };
}

/** Mark a token consumed so it can't be replayed. */
export async function consumeResetToken(token: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE password_reset_tokens
    SET used_at = ${new Date().toISOString()}
    WHERE token_hash = ${hashToken(token)}
  `;
}

/** Set a new password for a user in either store. */
export async function updateUserPassword(kind: UserKind, email: string, newPassword: string): Promise<void> {
  const sql = getSql();
  const { hash, salt } = hashPassword(newPassword);
  if (kind === "team") {
    await sql`UPDATE team_members SET password_hash = ${hash}, password_salt = ${salt} WHERE email = ${email}`;
  } else {
    await sql`UPDATE candidates SET password_hash = ${hash}, password_salt = ${salt} WHERE email = ${email}`;
  }
}

/** Send the reset email via Resend's REST API. Returns false if not configured or send failed. */
export async function sendResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESET_EMAIL_FROM ?? "Coded Mind <noreply@codedmind.co.in>";
  if (!apiKey) return false;

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: "Reset your Coded Mind password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1c1917;">Reset your password</h2>
            <p style="color: #57534e; line-height: 1.6;">
              We received a request to reset the password for your Coded Mind account.
              Click the button below to choose a new password. This link is valid for 1 hour.
            </p>
            <a href="${resetUrl}"
               style="display: inline-block; background: #d97706; color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Reset password
            </a>
            <p style="color: #a8a29e; font-size: 13px; line-height: 1.6;">
              If you didn't request this, you can safely ignore this email — your password will not change.
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("[passwordReset] Resend request failed:", err);
    return false;
  }

  if (!res.ok) {
    console.error("[passwordReset] Resend returned", res.status, await res.text().catch(() => ""));
    return false;
  }

  return true;
}
