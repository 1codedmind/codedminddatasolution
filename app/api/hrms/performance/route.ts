import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listPerformanceReviews, createPerformanceReview } from "@/lib/hrms/performance";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function GET(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const memberId = sp.get("memberId") ?? undefined;
  const status = sp.get("status") ?? undefined;

  const effectiveMemberId = isHrmsAdmin(session.role) ? memberId : session.sub;
  const reviews = await listPerformanceReviews({ memberId: effectiveMemberId, status });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "performance:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:perf-create:${session.sub}`, 20, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, period, rating, strengths, areasForImprovement, goalsNextPeriod } =
    body as Record<string, unknown>;

  if (!memberId || !period) {
    return NextResponse.json({ error: "memberId and period are required." }, { status: 400 });
  }

  const result = await createPerformanceReview({
    memberId: memberId as string,
    reviewerId: session.sub,
    period: period as string,
    rating: rating ? Number(rating) : undefined,
    strengths: strengths as string | undefined,
    areasForImprovement: areasForImprovement as string | undefined,
    goalsNextPeriod: goalsNextPeriod as string | undefined,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
