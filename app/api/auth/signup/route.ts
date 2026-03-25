import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, RATE_LIMITS } from "@/lib/auth/config";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { getClientIp, isTrustedOrigin, normalizeEmail } from "@/lib/auth/security";
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
  const allowed = enforceRateLimit(
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

  const token = createSessionToken({
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
