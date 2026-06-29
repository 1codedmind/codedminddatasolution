import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getPayrollRun, updatePayrollRunStatus, deletePayrollRun } from "@/lib/hrms/payroll";
import { hasDatabaseUrl } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const run = await getPayrollRun(id);
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status } = body as { status?: string };
  const valid = ["draft", "processing", "completed", "cancelled"];
  if (!status || !valid.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  await updatePayrollRunStatus(id, status as "draft" | "processing" | "completed" | "cancelled");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:delete")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await deletePayrollRun(id);
  return NextResponse.json({ ok: true });
}
