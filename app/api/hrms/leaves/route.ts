import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { createLeaveRequest } from "@/lib/hrms/leaves";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "leaves:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 10 leave requests per 5 minutes per user
  if (!enforceRateLimit(`hrms:leave-create:${session.sub}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, leaveTypeId, fromDate, toDate, daysCount, reason } = body as Record<string, string | number>;

  if (!leaveTypeId || !fromDate || !toDate || !daysCount) {
    return NextResponse.json({ error: "Leave type, dates, and day count are required." }, { status: 400 });
  }

  // Employees can only submit for themselves
  const requestedFor = (memberId as string) ?? session.sub;
  if (session.role === "employee" && requestedFor !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (new Date(fromDate as string) > new Date(toDate as string)) {
    return NextResponse.json({ error: "From date must be before to date." }, { status: 400 });
  }

  const result = await createLeaveRequest({
    memberId: requestedFor,
    leaveTypeId: leaveTypeId as string,
    fromDate: fromDate as string,
    toDate: toDate as string,
    daysCount: Number(daysCount),
    reason: reason as string | undefined,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
