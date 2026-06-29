import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { assignAsset, updateAssetStatus } from "@/lib/hrms/assets";
import { hasDatabaseUrl } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "assets:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, memberId, status } = body as Record<string, unknown>;

  if (action === "assign") {
    await assignAsset(id, memberId as string | null);
  } else if (action === "status") {
    const valid = ["available", "in_repair", "retired"];
    if (!valid.includes(status as string)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    await updateAssetStatus(id, status as "available" | "in_repair" | "retired");
  } else {
    return NextResponse.json({ error: "action must be 'assign' or 'status'." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
