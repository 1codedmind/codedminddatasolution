import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listAttendance, getTodayAttendance, checkIn, checkOut } from "@/lib/hrms/attendance";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function GET(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const sp = req.nextUrl.searchParams;
  const today = sp.get("today") === "1";
  const memberId = sp.get("memberId") ?? undefined;
  const month = sp.get("month") ? Number(sp.get("month")) : undefined;
  const year = sp.get("year") ? Number(sp.get("year")) : undefined;

  // Employees can only read their own attendance
  if (!isHrmsAdmin(session.role) && memberId && memberId !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (today) {
    const targetId = isHrmsAdmin(session.role) ? (memberId ?? session.sub) : session.sub;
    const log = await getTodayAttendance(targetId);
    return NextResponse.json(log ?? null);
  }

  const effectiveMemberId = isHrmsAdmin(session.role) ? memberId : session.sub;
  const logs = await listAttendance({ memberId: effectiveMemberId, month, year });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "attendance:log")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:attendance:${session.sub}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, note } = body as { action?: string; note?: string };

  if (action !== "checkin" && action !== "checkout") {
    return NextResponse.json({ error: "action must be 'checkin' or 'checkout'." }, { status: 400 });
  }

  try {
    if (action === "checkin") {
      const result = await checkIn(session.sub, note);
      return NextResponse.json({ ok: true, id: result.id });
    } else {
      await checkOut(session.sub);
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
