import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { createEmployee } from "@/lib/hrms/employees";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "employees:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 10 onboards per 5 minutes per user
  if (!enforceRateLimit(`hrms:onboard:${session.sub}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fullName, email, role, password, joinDate, employmentType, departmentId, phone } = body as Record<string, string>;

  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  if (password.length < 12) {
    return NextResponse.json({ error: "Password must be at least 12 characters." }, { status: 400 });
  }

  const validRoles = ["employee", "admin", "superadmin"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // Only superadmins can create other superadmins
  if (role === "superadmin" && session.role !== "superadmin") {
    return NextResponse.json({ error: "Only a superadmin can create another superadmin." }, { status: 403 });
  }

  const result = await createEmployee({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    role: (role as "superadmin" | "admin" | "employee") ?? "employee",
    password,
    joinDate,
    employmentType,
    departmentId,
    phone,
    createdBy: session.sub,
  });

  if (!result) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
