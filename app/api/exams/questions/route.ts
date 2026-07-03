import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { hasDatabaseUrl } from "@/lib/db";
import { hasExamPermission } from "@/lib/exam/access";
import { resolveTenantId } from "@/lib/exam/tenant";
import { validateQuestionBody } from "@/lib/exam/validation";
import {
  createQuestion,
  listQuestions,
  type QuestionFilters,
} from "@/lib/exam/db/questions";
import type {
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
} from "@/lib/exam/types";

export async function GET(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasExamPermission(session.role, "questions:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const p = req.nextUrl.searchParams;
  const filters: QuestionFilters = {
    search: p.get("search") ?? undefined,
    type: (p.get("type") as QuestionType) ?? undefined,
    status: (p.get("status") as QuestionStatus) ?? undefined,
    difficulty: (p.get("difficulty") as QuestionDifficulty) ?? undefined,
    tag: p.get("tag") ?? undefined,
    limit: p.get("limit") ? Number(p.get("limit")) : undefined,
    offset: p.get("offset") ? Number(p.get("offset")) : undefined,
  };

  const result = await listQuestions(resolveTenantId(session), filters);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasExamPermission(session.role, "questions:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 60 question creates per minute per user
  if (!enforceRateLimit(`exam:question-create:${session.sub}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateQuestionBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const question = await createQuestion(resolveTenantId(session), {
    ...validated.value,
    createdBy: session.sub,
  });
  return NextResponse.json({ question }, { status: 201 });
}
