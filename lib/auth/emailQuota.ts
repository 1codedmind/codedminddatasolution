import { enforceRateLimit } from "@/lib/auth/rate-limit";

/**
 * Daily ceiling on account emails sent to one address.
 *
 * The existing per-IP throttle on password reset is a short rolling window
 * (3 per 15 minutes), which still permits nearly 300 emails to one address in a
 * day. That is enough to bury someone's inbox, and enough to exhaust a
 * transactional email plan — Resend's free tier allows 100 sends per day in
 * total, so a single targeted address could consume all of it.
 *
 * The counter is shared across email types (reset and verification), so an
 * account cannot receive more than the limit in a day whichever flow is used.
 */

export type AccountEmailKind = "password-reset" | "verification";

function envInt(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

const DAY_MS = 24 * 60 * 60_000;

export function dailyEmailLimit(): number {
  return envInt("EMAIL_DAILY_PER_ADDRESS", 5);
}

/**
 * Consume one unit of the recipient's daily email allowance.
 *
 * Keyed on the email address rather than the requester's IP, because the
 * address is what gets flooded and rotating IPs must not bypass it.
 *
 * Note this is consumed for every request, including ones where no account
 * exists. Counting only real sends would make a 429 prove that an account
 * exists, undoing the enumeration protection the reset flow is built around.
 * The cost is that someone can burn a known address's daily allowance; at five
 * per day that is a minor inconvenience with hr@codedmind.co.in as the fallback,
 * where account disclosure would be a genuine security regression.
 */
export async function consumeEmailAllowance(
  email: string,
  kind: AccountEmailKind,
): Promise<boolean> {
  const address = email.trim().toLowerCase();
  const allowed = await enforceRateLimit(`auth-email:${address}`, dailyEmailLimit(), DAY_MS);

  if (!allowed) {
    // Logged rather than returned, so the caller's response stays generic.
    console.warn(`[emailQuota] daily limit reached for a ${kind} request`);
  }

  return allowed;
}
