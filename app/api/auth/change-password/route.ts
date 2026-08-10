import { NextRequest, NextResponse } from "next/server";

import { PASSWORD_LIMITS } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getCurrentSession } from "@/lib/auth/session";
import { isTrustedOrigin } from "@/lib/auth/security";
import { validatePassword } from "@/lib/auth/validation";
import { updateUserPassword, type UserKind } from "@/lib/auth/passwordReset";
import { findCandidateByEmail } from "@/lib/auth/users";
import { findTeamMemberByEmail } from "@/lib/auth/team";
import { hasDatabaseUrl } from "@/lib/db";

// Works for every profile type: candidates and team members (employee/admin/superadmin)
export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to change your password." }, { status: 401 });
  }

  if (!enforceRateLimit(`change-pw:${session.sub}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const currentPassword = body.currentPassword?.trim() ?? "";
  if (!currentPassword) {
    return NextResponse.json({ error: "Enter your current password." }, { status: 400 });
  }

  const newPassword = validatePassword(body.newPassword ?? "");
  if (!newPassword) {
    return NextResponse.json(
      {
        error: `New password must be ${PASSWORD_LIMITS.min}-${PASSWORD_LIMITS.max} characters and include uppercase, lowercase, number, and special character.`,
      },
      { status: 400 },
    );
  }

  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "New password must be different from the current one." }, { status: 400 });
  }

  // Session role tells us which store the account lives in
  const kind: UserKind = session.role === "candidate" ? "candidate" : "team";
  const user =
    kind === "team"
      ? await findTeamMemberByEmail(session.email)
      : await findCandidateByEmail(session.email);

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // A social sign-in account has no current password to verify against. Send
  // them through the reset flow to set one for the first time.
  if (!user.passwordHash || !user.passwordSalt) {
    return NextResponse.json(
      {
        error:
          "This account signs in with Google and has no password yet. Use \"Forgot password?\" to set one.",
      },
      { status: 400 },
    );
  }

  if (!verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  await updateUserPassword(kind, session.email, newPassword);

  return NextResponse.json({ ok: true, message: "Password changed successfully." });
}
