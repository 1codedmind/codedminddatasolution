import { createHash, randomBytes } from "crypto";

import { getSql, hasDatabaseUrl } from "@/lib/db";

/**
 * Email verification for candidate signups.
 *
 * Mirrors the password-reset token design deliberately: only the SHA-256 hash
 * of a token is stored, so a database leak yields nothing usable; tokens are
 * single-use and expire; and issuing a new one invalidates any outstanding
 * token for that address.
 *
 * Staff accounts are never subject to this — an administrator created them
 * through HRMS, which is a stronger assertion than a click in an inbox. Google
 * sign-ups are likewise exempt: Google already asserted the address is verified.
 */

const TOKEN_TTL_MS = 24 * 60 * 60_000;

let tablesReady = false;

async function ensureTables() {
  if (tablesReady) return;
  const sql = getSql();

  // Defaulting to TRUE grandfathers every existing account, so applying this
  // migration cannot lock out a real user. Only new signups insert FALSE.
  await sql`
    ALTER TABLE IF EXISTS candidates
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      token_hash TEXT        PRIMARY KEY,
      email      TEXT        NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at    TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_verification_email
    ON email_verification_tokens (email)
  `;
  tablesReady = true;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Mark a freshly created candidate as unverified.
 *
 * Lives here rather than in the signup route so it runs behind ensureTables —
 * the column defaults to TRUE for grandfathering, so it may not exist yet on a
 * database that has not seen this feature before.
 */
export async function markCandidateUnverified(candidateId: string): Promise<void> {
  await ensureTables();
  const sql = getSql();
  await sql`UPDATE candidates SET email_verified = FALSE WHERE id = ${candidateId}`;
}

/** Mint a token. The raw value exists only in the emailed link. */
export async function createVerificationToken(email: string): Promise<string> {
  await ensureTables();
  const sql = getSql();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  // One outstanding token per address — a fresh request retires the old link.
  await sql`DELETE FROM email_verification_tokens WHERE email = ${email} AND used_at IS NULL`;
  await sql`
    INSERT INTO email_verification_tokens (token_hash, email, expires_at)
    VALUES (${hashToken(token)}, ${email}, ${expiresAt})
  `;

  return token;
}

export type VerifyOutcome =
  | { status: "verified"; email: string }
  | { status: "already-verified"; email: string }
  | { status: "invalid" };

/**
 * Consume a token and mark its address verified.
 *
 * Every failure mode returns the same "invalid" result. Distinguishing expired
 * from unknown from already-used would tell an attacker probing tokens whether
 * they had found a real one.
 */
export async function consumeVerificationToken(token: string): Promise<VerifyOutcome> {
  if (!token || token.length > 200) return { status: "invalid" };

  await ensureTables();
  const sql = getSql();

  const rows = await sql<{ email: string; expiresAt: string; usedAt: string | null }[]>`
    SELECT email, expires_at AS "expiresAt", used_at AS "usedAt"
    FROM email_verification_tokens
    WHERE token_hash = ${hashToken(token)}
    LIMIT 1
  `;

  const record = rows[0];
  if (!record) return { status: "invalid" };

  // A used token is only "already verified" if that address really is verified;
  // otherwise treat it as invalid so a replayed link cannot re-verify.
  if (record.usedAt) {
    const verified = await isEmailVerified(record.email);
    return verified
      ? { status: "already-verified", email: record.email }
      : { status: "invalid" };
  }

  if (new Date(record.expiresAt).getTime() <= Date.now()) {
    return { status: "invalid" };
  }

  await sql`
    UPDATE email_verification_tokens
    SET used_at = NOW()
    WHERE token_hash = ${hashToken(token)} AND used_at IS NULL
  `;
  await sql`
    UPDATE candidates SET email_verified = TRUE WHERE email = ${record.email}
  `;

  return { status: "verified", email: record.email };
}

/** Whether a candidate address is verified. Unknown addresses read as verified. */
export async function isEmailVerified(email: string): Promise<boolean> {
  if (!hasDatabaseUrl()) return true;
  await ensureTables();
  const sql = getSql();

  const rows = await sql<{ verified: boolean }[]>`
    SELECT email_verified AS verified FROM candidates WHERE email = ${email} LIMIT 1
  `;
  // No row means the session belongs to a staff account, which is exempt.
  return rows[0]?.verified ?? true;
}

/** Send the verification email through Resend. False when unsent. */
export async function sendVerificationEmail(email: string, verifyUrl: string): Promise<boolean> {
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
        subject: "Confirm your Coded Mind email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1c1917;">Confirm your email</h2>
            <p style="color: #57534e; line-height: 1.6;">
              Thanks for creating a Coded Mind account. Confirm this address to
              unlock AI resume parsing and job applications. This link is valid
              for 24 hours.
            </p>
            <a href="${verifyUrl}"
               style="display: inline-block; background: #d97706; color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; margin: 16px 0;">
              Confirm email
            </a>
            <p style="color: #a8a29e; font-size: 13px; line-height: 1.6;">
              If you didn't create this account, you can safely ignore this email
              and nothing further will happen.
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("[emailVerification] Resend request failed:", err);
    return false;
  }

  if (!res.ok) {
    console.error("[emailVerification] Resend returned", res.status, await res.text().catch(() => ""));
    return false;
  }

  return true;
}
