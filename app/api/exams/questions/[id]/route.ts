import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { hasDatabaseUrl } from "@/lib/db";
import { hasExamPermission } from "@/lib/exam/access";
import { resolveTenantId } from "@/lib/exam/tenant";
import { validateQuestionBody } from "@/lib/exam/validation";
import {
  deleteQuestion,
  getQuestion,
  updateQuestion,
} from "@/lib/exam/db/questions";
import type { QuestionStatus } from "@/lib/exam/types";

const STATUSES: QuestionStatus[] = ["draft", "published", "archived"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasExamPermission(session.role, "questions:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const question = await getQuestion(resolveTenantId(session), id);
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasExamPermission(session.role, "questions:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 120 question updates per minute per user
  if (!(await enforceRateLimit(`exam:question-update:${session.sub}`, 120, 60_000))) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = await params;
  const tenantId = resolveTenantId(session);

  // Status-only change (publish / archive) skips full content validation.
  const b = body as Record<string, unknown>;
  const statusOnly =
    typeof b.status === "string" && Object.keys(b).length === 1;
  if (statusOnly) {
    if (!STATUSES.includes(b.status as QuestionStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const question = await updateQuestion(tenantId, id, {
      status: b.status as QuestionStatus,
    });
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ question });
  }

  const validated = validateQuestionBody(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const question = await updateQuestion(tenantId, id, validated.value);
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ question });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabaseUrl()) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasExamPermission(session.role, "questions:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const deleted = await deleteQuestion(resolveTenantId(session), id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
