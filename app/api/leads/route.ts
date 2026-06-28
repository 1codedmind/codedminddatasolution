import { NextResponse } from "next/server";
import { getSql, hasDatabaseUrl } from "@/lib/db";
import { randomUUID } from "crypto";

async function ensureTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      company     TEXT,
      message     TEXT,
      source      TEXT,
      created_at  TEXT NOT NULL
    )
  `;
}

export async function POST(req: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, company, message, source } = body as Record<string, string>;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  try {
    await ensureTable();
    const sql = getSql();
    await sql`
      INSERT INTO leads (id, name, email, company, message, source, created_at)
      VALUES (
        ${randomUUID()},
        ${name.trim()},
        ${email.trim()},
        ${company?.trim() ?? null},
        ${message?.trim() ?? null},
        ${source ?? "website"},
        ${new Date().toISOString()}
      )
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[leads] DB error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
