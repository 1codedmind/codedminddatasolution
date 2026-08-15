import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { consumeEmailAllowance, dailyEmailLimit } from "@/lib/auth/emailQuota";
import {
  createVerificationToken,
  isEmailVerified,
  sendVerificationEmail,
} from "@/lib/auth/emailVerification";
import { hasDatabaseUrl } from "@/lib/db";

/**
 * Re-send the confirmation email for the signed-in account.
 *
 * Requires a session and only ever sends to the session's own address, so this
 * cannot be pointed at a third party — there is no email parameter to abuse.
 */
export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  // Staff accounts are exempt from verification entirely.
  if (session.role !== "candidate") {
    return NextResponse.json({ ok: true, message: "This account does not require confirmation." });
  }

  const ip = getClientIp(request);
  if (!(await enforceRateLimit(`verify-resend:${ip}`, 10, 60 * 60_000))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // A short cooldown per account, so the button cannot be mashed.
  if (!(await enforceRateLimit(`verify-resend:acct:${session.sub}`, 3, 60 * 60_000))) {
    return NextResponse.json(
      { error: "We've sent several confirmation emails recently. Please check your inbox and spam folder." },
      { status: 429 },
    );
  }

  if (await isEmailVerified(session.email)) {
    return NextResponse.json({ ok: true, message: "Your email is already confirmed." });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Email is not configured. Contact hr@codedmind.co.in." },
      { status: 503 },
    );
  }

  // Shares the daily ceiling with password reset.
  if (!(await consumeEmailAllowance(session.email, "verification"))) {
    return NextResponse.json(
      {
        error: `For security we send at most ${dailyEmailLimit()} account emails per address per day. Please try again tomorrow, or contact hr@codedmind.co.in.`,
      },
      { status: 429 },
    );
  }

  const token = await createVerificationToken(session.email);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codedmind.co.in";
  const sent = await sendVerificationEmail(session.email, `${origin}/verify-email?token=${token}`);

  if (!sent) {
    return NextResponse.json(
      { error: "We couldn't send the email right now. Please try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, message: "Confirmation email sent. Check your inbox." });
}
