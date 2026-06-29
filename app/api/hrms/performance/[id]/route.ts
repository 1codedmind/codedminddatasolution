import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getPerformanceReview, updatePerformanceReview } from "@/lib/hrms/performance";
import { hasDatabaseUrl } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const review = await getPerformanceReview(id);
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isManager = hasPermission(session.role, "performance:manage");
  const isSelf = review.memberId === session.sub;

  // Employees can only acknowledge their own reviews
  if (!isManager && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, rating, strengths, areasForImprovement, goalsNextPeriod } =
    body as Record<string, unknown>;

  // Employees can only set status to "acknowledged"
  if (!isManager && status && status !== "acknowledged") {
    return NextResponse.json({ error: "Employees can only acknowledge reviews." }, { status: 403 });
  }

  await updatePerformanceReview(id, {
    status: status as string | undefined,
    rating: isManager && rating ? Number(rating) : undefined,
    strengths: isManager ? (strengths as string | undefined) : undefined,
    areasForImprovement: isManager ? (areasForImprovement as string | undefined) : undefined,
    goalsNextPeriod: isManager ? (goalsNextPeriod as string | undefined) : undefined,
  });

  return NextResponse.json({ ok: true });
}
