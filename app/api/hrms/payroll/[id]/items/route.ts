import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getPayrollItems, addPayrollItem, getPayrollRun } from "@/lib/hrms/payroll";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const items = await getPayrollItems(id);
  return NextResponse.json(items);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:payroll-item:${session.sub}`, 30, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { id } = await params;
  const run = await getPayrollRun(id);
  if (!run) return NextResponse.json({ error: "Pay run not found" }, { status: 404 });
  if (run.status !== "draft") {
    return NextResponse.json({ error: "Can only add items to a draft pay run." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { memberId, basicSalary, allowances, deductions, bonus, currency, notes } =
    body as Record<string, unknown>;

  if (!memberId || basicSalary === undefined) {
    return NextResponse.json({ error: "memberId and basicSalary are required." }, { status: 400 });
  }

  const result = await addPayrollItem({
    payrollRunId: id,
    memberId: memberId as string,
    basicSalary: Number(basicSalary),
    allowances: allowances ? Number(allowances) : 0,
    deductions: deductions ? Number(deductions) : 0,
    bonus: bonus ? Number(bonus) : 0,
    currency: (currency as string) ?? "INR",
    notes: notes as string | undefined,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
