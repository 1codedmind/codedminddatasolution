import { NextResponse } from "next/server";
import { getSql, hasDatabaseUrl } from "@/lib/db";
import { ensureTable } from "@/lib/leads";
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

  const { name, email, company, phone, message, source } = body as Record<string, string>;

  const cleanName = name?.trim() ?? "";
  const cleanEmail = email?.trim() ?? "";
  const cleanPhone = phone?.trim() ?? "";
  const cleanCompany = company?.trim() ?? "";
  const cleanMessage = message?.trim() ?? "";

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
  }

  if (cleanName.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }

  if (cleanMessage.length < 10) {
    return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
  }

  if (
    cleanName.length > 100 ||
    cleanEmail.length > 254 ||
    cleanCompany.length > 100 ||
    cleanPhone.length > 20 ||
    cleanMessage.length > 5000
  ) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Phone is optional, but must look like a phone number when supplied.
  if (cleanPhone && !/^\+?[\d\s()-]{7,20}$/.test(cleanPhone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  try {
    await ensureTable();
    const sql = getSql();
    await sql`
      INSERT INTO leads (id, name, email, company, phone, message, source, status, created_at)
      VALUES (
        ${randomUUID()},
        ${cleanName},
        ${cleanEmail},
        ${cleanCompany || null},
        ${cleanPhone || null},
        ${cleanMessage},
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
