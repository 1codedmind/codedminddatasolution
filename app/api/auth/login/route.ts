import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, RATE_LIMITS } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/crypto";
import { enforceRateLimit, recordFailure, getFailureCount, clearFailures } from "@/lib/auth/rate-limit";
import { getSessionVersion } from "@/lib/auth/sessionVersion";
import { getSessionCookieOptions, createSessionToken } from "@/lib/auth/session";
import { getClientIp, isTrustedOrigin, normalizeEmail } from "@/lib/auth/security";
import { findCandidateByEmail, sanitizeCandidateUser } from "@/lib/auth/users";
import { findTeamMemberByEmail } from "@/lib/auth/team";
import { validateEmail } from "@/lib/auth/validation";

// 15 failures for a single account within an hour locks it until the window
// rolls off. A correct password clears the counter immediately.
const LOCKOUT_THRESHOLD = 15;
const LOCKOUT_WINDOW_MS = 60 * 60_000;

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
  const allowed = await enforceRateLimit(
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

  // Account lockout: unlike the per-IP limit above, this counter is keyed on
  // the account alone, so an attacker rotating IP addresses still trips it.
  const lockoutKey = `login-fail:${normalizeEmail(body.email ?? "")}`;
  if ((await getFailureCount(lockoutKey)) >= LOCKOUT_THRESHOLD) {
    return NextResponse.json(
      { error: "Too many failed attempts for this account. Try again later, or reset your password." },
      { status: 429 },
    );
  }

  if (!email || !password) {
    await recordFailure(lockoutKey, LOCKOUT_WINDOW_MS);
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
      await recordFailure(lockoutKey, LOCKOUT_WINDOW_MS);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    // A correct password clears both counters, so ordinary repeat sign-ins
    // never accumulate toward the limit — only failures do.
    await clearFailures(lockoutKey);
    await clearFailures(rateLimitKey);
    const ver = await getSessionVersion("team", teamMember.id);
    const token = createSessionToken({ sub: teamMember.id, email: teamMember.email, role: teamMember.role, ver });
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    const hrmsRoles = ["superadmin", "admin", "employee"];
    const redirectTo = hrmsRoles.includes(teamMember.role) ? "/hrms/dashboard" : "/admin";
    return NextResponse.json({ ok: true, redirectTo });
  }

  const candidate = await findCandidateByEmail(email);
  if (!candidate) {
    await recordFailure(lockoutKey, LOCKOUT_WINDOW_MS);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Social sign-in accounts have no password. Point them at the right button
  // instead of failing with a message that can never be satisfied.
  if (!candidate.passwordHash || !candidate.passwordSalt) {
    return NextResponse.json(
      { error: "This account was created with Google. Use \"Continue with Google\" to sign in." },
      { status: 401 },
    );
  }

  const validPassword = verifyPassword(password, candidate.passwordSalt, candidate.passwordHash);
  if (!validPassword) {
    await recordFailure(lockoutKey, LOCKOUT_WINDOW_MS);
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  await clearFailures(lockoutKey);
  await clearFailures(rateLimitKey);

  const safeUser = sanitizeCandidateUser(candidate);
  const ver = await getSessionVersion("candidate", safeUser.id);
  const token = createSessionToken({ sub: safeUser.id, email: safeUser.email, role: safeUser.role, ver });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
  return NextResponse.json({ ok: true, redirectTo: "/candidate", user: safeUser });
}
