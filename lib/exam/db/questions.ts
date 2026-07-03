import { randomUUID } from "crypto";
import { getSql } from "@/lib/db";
import { ensureExamTables } from "../db-init";
import type {
  Question,
  QuestionContent,
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
} from "../types";

/**
 * Tenant scoping is enforced here: every function requires tenantId and every
 * SQL statement filters on it. Routes never query exam tables directly.
 */

export type QuestionFilters = {
  search?: string;
  type?: QuestionType;
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  tag?: string;
  limit?: number;
  offset?: number;
};

export async function listQuestions(
  tenantId: string,
  filters: QuestionFilters = {},
): Promise<{ questions: Question[]; total: number }> {
  await ensureExamTables();
  const sql = getSql();

  const limit = Math.min(filters.limit ?? 50, 200);
  const offset = filters.offset ?? 0;
  const search = filters.search ? `%${filters.search}%` : null;
  const type = filters.type ?? null;
  const status = filters.status ?? null;
  const difficulty = filters.difficulty ?? null;
  const tag = filters.tag ?? null;

  // Optional filters collapse to always-true when null; Postgres prunes them.
  const [questions, [{ total }]] = await Promise.all([
    sql<Question[]>`
      SELECT
        id,
        tenant_id  AS "tenantId",
        type,
        difficulty,
        status,
        content,
        tags,
        marks,
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM exam_questions
      WHERE tenant_id = ${tenantId}
        AND (${type}::text IS NULL OR type = ${type})
        AND (${status}::text IS NULL OR status = ${status})
        AND (${difficulty}::text IS NULL OR difficulty = ${difficulty})
        AND (${tag}::text IS NULL OR tags @> ARRAY[${tag}]::text[])
        AND (${search}::text IS NULL OR content->>'text' ILIKE ${search})
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    sql<[{ total: number }]>`
      SELECT count(*)::int AS total
      FROM exam_questions
      WHERE tenant_id = ${tenantId}
        AND (${type}::text IS NULL OR type = ${type})
        AND (${status}::text IS NULL OR status = ${status})
        AND (${difficulty}::text IS NULL OR difficulty = ${difficulty})
        AND (${tag}::text IS NULL OR tags @> ARRAY[${tag}]::text[])
        AND (${search}::text IS NULL OR content->>'text' ILIKE ${search})
    `,
  ]);

  return { questions, total };
}

export async function getQuestion(
  tenantId: string,
  id: string,
): Promise<Question | null> {
  await ensureExamTables();
  const sql = getSql();
  const rows = await sql<Question[]>`
    SELECT
      id,
      tenant_id  AS "tenantId",
      type,
      difficulty,
      status,
      content,
      tags,
      marks,
      created_by AS "createdBy",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM exam_questions
    WHERE tenant_id = ${tenantId} AND id = ${id}
  `;
  return rows[0] ?? null;
}

export type CreateQuestionInput = {
  type: QuestionType;
  difficulty: QuestionDifficulty;
  content: QuestionContent;
  tags: string[];
  marks: number;
  createdBy: string;
};

export async function createQuestion(
  tenantId: string,
  input: CreateQuestionInput,
): Promise<Question> {
  await ensureExamTables();
  const sql = getSql();
  const now = new Date().toISOString();
  const id = randomUUID();

  const rows = await sql<Question[]>`
    INSERT INTO exam_questions
      (id, tenant_id, type, difficulty, status, content, tags, marks, created_by, created_at, updated_at)
    VALUES
      (${id}, ${tenantId}, ${input.type}, ${input.difficulty}, 'draft',
       ${JSON.stringify(input.content)}::jsonb, ${input.tags}::text[],
       ${input.marks}, ${input.createdBy}, ${now}, ${now})
    RETURNING
      id,
      tenant_id  AS "tenantId",
      type,
      difficulty,
      status,
      content,
      tags,
      marks,
      created_by AS "createdBy",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return rows[0];
}

export type UpdateQuestionInput = Partial<CreateQuestionInput> & {
  status?: QuestionStatus;
};

export async function updateQuestion(
  tenantId: string,
  id: string,
  input: UpdateQuestionInput,
): Promise<Question | null> {
  await ensureExamTables();
  const sql = getSql();
  const now = new Date().toISOString();
  const content = input.content ? JSON.stringify(input.content) : null;

  const rows = await sql<Question[]>`
    UPDATE exam_questions SET
      type       = COALESCE(${input.type ?? null}, type),
      difficulty = COALESCE(${input.difficulty ?? null}, difficulty),
      status     = COALESCE(${input.status ?? null}, status),
      content    = COALESCE(${content}::jsonb, content),
      tags       = COALESCE(${input.tags ?? null}::text[], tags),
      marks      = COALESCE(${input.marks ?? null}, marks),
      updated_at = ${now}
    WHERE tenant_id = ${tenantId} AND id = ${id}
    RETURNING
      id,
      tenant_id  AS "tenantId",
      type,
      difficulty,
      status,
      content,
      tags,
      marks,
      created_by AS "createdBy",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return rows[0] ?? null;
}

export async function deleteQuestion(
  tenantId: string,
  id: string,
): Promise<boolean> {
  await ensureExamTables();
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    DELETE FROM exam_questions
    WHERE tenant_id = ${tenantId} AND id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}
