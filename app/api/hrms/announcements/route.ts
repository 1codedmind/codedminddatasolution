import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listAnnouncements, listAllAnnouncements, createAnnouncement } from "@/lib/hrms/announcements";
import { hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export async function GET(_req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "announcements:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const list = isHrmsAdmin(session.role)
    ? await listAllAnnouncements()
    : await listAnnouncements();

  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "announcements:manage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!enforceRateLimit(`hrms:announce:${session.sub}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, body: text, audience, departmentId, isPinned, expiresAt } =
    body as Record<string, unknown>;

  if (!title || !text) {
    return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
  }

  const result = await createAnnouncement({
    title: (title as string).trim(),
    body: (text as string).trim(),
    audience: (audience as string) ?? "all",
    departmentId: departmentId as string | undefined,
    isPinned: !!isPinned,
    expiresAt: expiresAt as string | undefined,
    createdBy: session.sub,
  });

  return NextResponse.json({ ok: true, id: result.id });
}
