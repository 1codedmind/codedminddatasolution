import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, RATE_LIMITS } from "@/lib/auth/config";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { getClientIp, isTrustedOrigin, normalizeEmail } from "@/lib/auth/security";
import {
  createVerificationToken,
  markCandidateUnverified,
  sendVerificationEmail,
} from "@/lib/auth/emailVerification";
import { consumeEmailAllowance } from "@/lib/auth/emailQuota";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { createCandidateUser } from "@/lib/auth/users";
import {
  getSignupValidationError,
  validateEmail,
  validateFullName,
  validatePassword,
} from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);

  let body: { fullName?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = validateFullName(body.fullName ?? "");
  const email = validateEmail(body.email ?? "");
  const password = validatePassword(body.password ?? "");
  const validationError = getSignupValidationError(body);

  const rateLimitKey = `signup:${ip}:${normalizeEmail(body.email ?? "")}`;
  const allowed = await enforceRateLimit(
    rateLimitKey,
    RATE_LIMITS.signup.maxAttempts,
    RATE_LIMITS.signup.windowMs,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  if (validationError || !fullName || !email || !password) {
    return NextResponse.json(
      { error: validationError ?? "Please provide valid signup details." },
      { status: 400 },
    );
  }

  const user = await createCandidateUser({
    fullName,
    email,
    password,
  });

  if (!user) {
    return NextResponse.json(
      { error: "Unable to create account with those details." },
      { status: 409 },
    );
  }

  // New accounts start unverified. The column defaults to TRUE so that existing
  // rows are grandfathered, which means new signups must be set explicitly.
  try {
    await markCandidateUnverified(user.id);

    // Sending is best-effort: a mail failure must not cost someone their new
    // account. They can retry from the banner once signed in.
    if (await consumeEmailAllowance(user.email, "verification")) {
      const verifyToken = await createVerificationToken(user.email);
      const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codedmind.co.in";
      await sendVerificationEmail(user.email, `${origin}/verify-email?token=${verifyToken}`);
    }
  } catch (err) {
    console.error("[signup] verification email step failed:", err);
  }

  const token = createSessionToken({
    ver: 0,
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());

  return NextResponse.json({
    ok: true,
    user,
  });
}
