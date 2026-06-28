import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, RATE_LIMITS } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getSessionCookieOptions, createSessionToken } from "@/lib/auth/session";
import { getClientIp, isTrustedOrigin, normalizeEmail } from "@/lib/auth/security";
import { findCandidateByEmail, sanitizeCandidateUser } from "@/lib/auth/users";
import { findTeamMemberByEmail } from "@/lib/auth/team";
import { validateEmail } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = validateEmail(body.email ?? "");
  const password = body.password?.trim() ?? "";

  const rateLimitKey = `login:${ip}:${normalizeEmail(body.email ?? "")}`;
  const allowed = enforceRateLimit(
    rateLimitKey,
    RATE_LIMITS.login.maxAttempts,
    RATE_LIMITS.login.windowMs,
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 400 },
    );
  }

  // Check team members first (internal staff), then candidates (external applicants)
  const teamMember = await findTeamMemberByEmail(email);

  if (teamMember) {
    if (!teamMember.isActive) {
      return NextResponse.json({ error: "Account is inactive." }, { status: 403 });
    }
    const valid = verifyPassword(password, teamMember.passwordSalt, teamMember.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const token = createSessionToken({ sub: teamMember.id, email: teamMember.email, role: teamMember.role });
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    return NextResponse.json({ ok: true, redirectTo: "/admin" });
  }

  const candidate = await findCandidateByEmail(email);
  if (!candidate) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const validPassword = verifyPassword(password, candidate.passwordSalt, candidate.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const safeUser = sanitizeCandidateUser(candidate);
  const token = createSessionToken({ sub: safeUser.id, email: safeUser.email, role: safeUser.role });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
  return NextResponse.json({ ok: true, redirectTo: "/candidate", user: safeUser });
}
