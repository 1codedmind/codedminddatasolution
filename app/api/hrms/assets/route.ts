import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listAssets, createAsset } from "@/lib/hrms/assets";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function GET(_req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "assets:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const assets = await listAssets();
  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "assets:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:asset-create:${session.sub}`, 20, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, categoryId, serialNumber, purchaseDate, purchasePrice, vendor, warrantyExpiresAt, notes } =
    body as Record<string, unknown>;

  if (!name) return NextResponse.json({ error: "Asset name is required." }, { status: 400 });

  const result = await createAsset({
    name: (name as string).trim(),
    categoryId: categoryId as string | undefined,
    serialNumber: serialNumber as string | undefined,
    purchaseDate: purchaseDate as string | undefined,
    purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
    vendor: vendor as string | undefined,
    warrantyExpiresAt: warrantyExpiresAt as string | undefined,
    notes: notes as string | undefined,
    createdBy: session.sub,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
