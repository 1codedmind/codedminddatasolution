import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { updatePayrollItemStatus, removePayrollItem } from "@/lib/hrms/payroll";
import { hasDatabaseUrl } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { itemId } = await params;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { paymentStatus } = body as { paymentStatus?: string };
  const valid = ["pending", "paid", "on_hold"];
  if (!paymentStatus || !valid.includes(paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  }

  await updatePayrollItemStatus(itemId, paymentStatus as "pending" | "paid" | "on_hold");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { itemId } = await params;
  await removePayrollItem(itemId);
  return NextResponse.json({ ok: true });
}
