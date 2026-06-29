import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { updateEmployeeProfile } from "@/lib/hrms/employees";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 20 profile updates per minute per user
  if (!enforceRateLimit(`hrms:profile-update:${session.sub}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  const { id } = await params;

  // Employees can only update their own profile
  const canEditOthers = hasPermission(session.role, "employees:update");
  if (!canEditOthers && id !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Explicitly whitelist fields — never spread body directly to avoid mass assignment
  await updateEmployeeProfile({
    memberId: id,
    phone:                  body.phone,
    departmentId:           body.departmentId,
    employmentType:         body.employmentType,
    joinDate:               body.joinDate,
    dateOfBirth:            body.dateOfBirth,
    city:                   body.city,
    state:                  body.state,
    country:                body.country,
    emergencyContactName:   body.emergencyContactName,
    emergencyContactPhone:  body.emergencyContactPhone,
    reportingTo:            body.reportingTo,
  });
  return NextResponse.json({ ok: true });
}
