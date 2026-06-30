import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { getUserPlan, getUserParseCounts, PLAN_LIMITS } from "@/lib/resume/parseUsage";

const INTERNAL_ROLES = new Set(["employee", "admin", "superadmin"]);

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  if (INTERNAL_ROLES.has(session.role)) {
    return NextResponse.json({
      loggedIn: true,
      user: { email: session.email },
      plan: "internal",
      usage: { today: 0, week: 0 },
      limits: { daily: null, weekly: null },
    });
  }

  const [plan, counts] = await Promise.all([
    getUserPlan(session.sub),
    getUserParseCounts(session.sub),
  ]);

  const limits = PLAN_LIMITS[plan];

  return NextResponse.json({
    loggedIn: true,
    user: { email: session.email },
    plan,
    usage: counts,
    limits: {
      daily: limits.daily,
      weekly: limits.weekly,
    },
  });
}
