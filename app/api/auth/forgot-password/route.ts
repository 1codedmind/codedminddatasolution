import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin, normalizeEmail } from "@/lib/auth/security";
import { validateEmail } from "@/lib/auth/validation";
import { createResetToken, findUserKindByEmail, sendResetEmail } from "@/lib/auth/passwordReset";
import { hasDatabaseUrl } from "@/lib/db";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const ip = getClientIp(request);

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // 3 reset requests per 15 minutes per IP+email
  if (!enforceRateLimit(`forgot-pw:${ip}:${normalizeEmail(body.email ?? "")}`, 3, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const email = validateEmail(body.email ?? "");
  if (!email) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Password reset email is not configured yet. Contact hr@codedmind.co.in to reset your password." },
      { status: 503 },
    );
  }

  // Always return the same success response whether or not the account exists,
  // so this endpoint can't be used to probe for registered emails.
  const kind = await findUserKindByEmail(email);
  if (kind) {
    const token = await createResetToken(email, kind);
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codedmind.co.in";
    await sendResetEmail(email, `${origin}/reset-password?token=${token}`);
  }

  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link has been sent. Check your inbox.",
  });
}
