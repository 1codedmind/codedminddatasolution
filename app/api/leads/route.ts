import { NextResponse } from "next/server";
import { getSql, hasDatabaseUrl } from "@/lib/db";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const ip = getClientIp(req as Parameters<typeof getClientIp>[0]);
  if (!enforceRateLimit(`lead:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, company, message, source } = body as Record<string, string>;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  if (name.trim().length > 100 || email.trim().length > 254 || (message ?? "").length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO leads (id, name, email, company, message, source, status, created_at)
      VALUES (
        ${randomUUID()},
        ${name.trim()},
        ${email.trim()},
        ${company?.trim() ?? null},
        ${message?.trim() ?? null},
        ${source ?? "website"},
        ${"new"},
        ${new Date().toISOString()}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads] DB error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
