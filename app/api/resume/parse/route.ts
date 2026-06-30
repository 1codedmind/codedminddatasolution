import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getUserPlan,
  getUserParseCounts,
  recordParseAttempt,
  PLAN_LIMITS,
} from "@/lib/resume/parseUsage";

const MAX_TEXT_LENGTH = 15000;

const systemPrompt = `You are a precise resume parser. Extract structured data from the resume text the user provides and return ONLY valid JSON matching this exact schema — no markdown, no code fences, no commentary:

{
  "personalInfo": { "fullName": "", "jobTitle": "", "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
  "summary": "",
  "experience": [ { "company": "", "title": "", "location": "", "startDate": "", "endDate": "", "current": false, "bullets": [] } ],
  "education": [ { "institution": "", "degree": "", "field": "", "location": "", "startDate": "", "endDate": "", "gpa": "" } ],
  "skills": [],
  "certifications": [ { "name": "", "issuer": "", "date": "" } ],
  "languages": [ { "name": "", "level": "" } ]
}

Rules:
- Only extract information explicitly present in the text. Never invent, guess, or hallucinate values.
- Keep dates in whatever format the resume uses (e.g. "Jan 2022", "2021", "06/2020").
- "current" is true only if the role says "Present" / "Current" or has no end date.
- "bullets" are the individual responsibility or achievement lines for that role, cleaned of leading bullet characters.
- Split skills into individual items, no duplicates.
- If a field is unknown or absent, use "" for strings and [] for arrays — never omit a key.
- Output raw JSON only, nothing before or after it.`;

interface CFChoicesResponse {
  result?: {
    choices?: Array<{ message?: { content?: string } }>;
    response?: string;
  };
}

function extractRawText(result: CFChoicesResponse): string {
  const content = result.result?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.length > 0) return content;
  const response = result.result?.response;
  if (typeof response === "string" && response.length > 0) return response;
  return "";
}

const INTERNAL_ROLES = new Set(["employee", "admin", "superadmin"]);

export async function POST(request: NextRequest) {
  // ── 1. IP-based spam guard (first line of defence, no DB) ─────────────────
  const ip = getClientIp(request);
  if (!enforceRateLimit(`resume-parse:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  // ── 2. Auth — must be signed in ───────────────────────────────────────────
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "Sign in to use AI resume upload.", code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  // ── 3. Per-user plan limits (internal roles bypass entirely) ─────────────
  // Role comes from a signed session token — cannot be forged without AUTH_SECRET.
  if (!INTERNAL_ROLES.has(session.role)) {
    const [plan, counts] = await Promise.all([
      getUserPlan(session.sub),
      getUserParseCounts(session.sub),
    ]);

    const limits = PLAN_LIMITS[plan];

    if (counts.today >= limits.daily) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${limits.daily}/day on ${plan} plan). Upgrade to Pro for 50/day.`,
          code: "DAILY_LIMIT",
          usage: counts,
          limits: { daily: limits.daily, weekly: limits.weekly },
        },
        { status: 429 },
      );
    }

    if (limits.weekly !== null && counts.week >= limits.weekly) {
      return NextResponse.json(
        {
          error: `Weekly limit reached (${limits.weekly}/week on ${plan} plan). Upgrade to Pro for unlimited weekly usage.`,
          code: "WEEKLY_LIMIT",
          usage: counts,
          limits: { daily: limits.daily, weekly: limits.weekly },
        },
        { status: 429 },
      );
    }
  }

  // ── 4. Validate body ──────────────────────────────────────────────────────
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
  }

  // ── 5. Cloudflare Workers AI extraction ──────────────────────────────────
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Resume parsing is not configured." }, { status: 500 });
  }

  const model = process.env.CLOUDFLARE_AI_MODEL ?? "@cf/meta/llama-3.1-8b-instruct-fast";

  const cfResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text.slice(0, MAX_TEXT_LENGTH) },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    }
  );

  if (!cfResponse.ok) {
    return NextResponse.json({ error: "Resume parsing failed. Try again." }, { status: 502 });
  }

  const result = (await cfResponse.json()) as CFChoicesResponse;
  const rawStr = extractRawText(result);

  if (!rawStr) {
    return NextResponse.json({ error: "Could not parse resume." }, { status: 502 });
  }

  const jsonStart = rawStr.indexOf("{");
  const jsonEnd = rawStr.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    return NextResponse.json({ error: "Could not parse resume." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawStr.slice(jsonStart, jsonEnd + 1));
  } catch {
    return NextResponse.json({ error: "Could not parse resume." }, { status: 502 });
  }

  // ── 6. Record usage — skip for internal roles ─────────────────────────────
  if (!INTERNAL_ROLES.has(session.role)) {
    await recordParseAttempt(session.sub);
  }

  return NextResponse.json(parsed);
}
