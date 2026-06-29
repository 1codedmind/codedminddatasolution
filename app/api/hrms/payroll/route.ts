import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { createPayrollRun } from "@/lib/hrms/payroll";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:payroll-create:${session.sub}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { periodMonth, periodYear, notes } = body as Record<string, unknown>;

  const month = Number(periodMonth);
  const year = Number(periodYear);

  if (!month || month < 1 || month > 12 || !year || year < 2000) {
    return NextResponse.json({ error: "Valid month (1–12) and year are required." }, { status: 400 });
  }

  const result = await createPayrollRun({
    periodMonth: month,
    periodYear: year,
    createdBy: session.sub,
    notes: notes as string | undefined,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
