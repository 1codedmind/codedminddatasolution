import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getSql, hasDatabaseUrl } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { PASSWORD_LIMITS } from "@/lib/auth/config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const isSelf = id === session.sub;
  const canResetOthers = hasPermission(session.role, "employees:update") && !isSelf;

  if (!isSelf && !canResetOthers) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 5 attempts per 10 minutes per user
  if (!enforceRateLimit(`hrms:pwd-change:${session.sub}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (!newPassword?.trim()) {
    return NextResponse.json({ error: "New password is required." }, { status: 400 });
  }

  if (newPassword.length < PASSWORD_LIMITS.min || newPassword.length > PASSWORD_LIMITS.max) {
    return NextResponse.json(
      { error: `Password must be ${PASSWORD_LIMITS.min}–${PASSWORD_LIMITS.max} characters.` },
      { status: 400 },
    );
  }

  const sql = getSql();

  // Fetch the target user
  const rows = await sql<[{ passwordHash: string; passwordSalt: string }?]>`
    SELECT password_hash AS "passwordHash", password_salt AS "passwordSalt"
    FROM team_members WHERE id = ${id} LIMIT 1
  `;
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Employees changing their own password must verify the current one
  if (isSelf) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    if (!verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
  }

  const { hash, salt } = hashPassword(newPassword);
  await sql`
    UPDATE team_members
    SET password_hash = ${hash}, password_salt = ${salt}
    WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true });
}
