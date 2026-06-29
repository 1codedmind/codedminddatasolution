import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { reviewLeaveRequest, getLeaveRequest } from "@/lib/hrms/leaves";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "leaves:approve")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 30 leave reviews per minute per user (reviewing a queue of leaves is valid)
  if (!enforceRateLimit(`hrms:leave-review:${session.sub}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  const { id } = await params;

  let body: { status?: string; reviewNote?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ error: "Status must be approved or rejected." }, { status: 400 });
  }

  const leave = await getLeaveRequest(id);
  if (!leave) return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
  if (leave.status !== "pending") return NextResponse.json({ error: "Only pending requests can be reviewed." }, { status: 409 });

  await reviewLeaveRequest({
    id,
    status: body.status,
    reviewedBy: session.sub,
    reviewNote: body.reviewNote,
  });

  return NextResponse.json({ ok: true });
}
