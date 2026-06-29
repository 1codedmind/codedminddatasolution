import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { createDepartment } from "@/lib/hrms/departments";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "departments:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 10 department creates per 5 minutes per user
  if (!enforceRateLimit(`hrms:dept-create:${session.sub}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests. Try again in a few minutes." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, description } = body as { name?: string; description?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Department name is required." }, { status: 400 });
  }

  const result = await createDepartment(name.trim(), description?.trim());
  return NextResponse.json({ ok: true, id: result.id });
}
