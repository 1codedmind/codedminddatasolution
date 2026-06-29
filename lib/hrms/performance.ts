import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type PerformanceReview = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  reviewerId: string | null;
  reviewerName: string | null;
  period: string;
  rating: number | null;
  strengths: string | null;
  areasForImprovement: string | null;
  goalsNextPeriod: string | null;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listPerformanceReviews(opts: {
  memberId?: string;
  status?: string;
}): Promise<PerformanceReview[]> {
  await ensureHrmsTables();
  const sql = getSql();
  const { memberId, status } = opts;
  return sql<PerformanceReview[]>`
    SELECT
      pr.id,
      pr.member_id              AS "memberId",
      tm.full_name              AS "memberName",
      tm.email                  AS "memberEmail",
      pr.reviewer_id            AS "reviewerId",
      rv.full_name              AS "reviewerName",
      pr.period,
      pr.rating,
      pr.strengths,
      pr.areas_for_improvement  AS "areasForImprovement",
      pr.goals_next_period      AS "goalsNextPeriod",
      pr.status,
      pr.reviewed_at            AS "reviewedAt",
      pr.created_at             AS "createdAt",
      pr.updated_at             AS "updatedAt"
    FROM performance_reviews pr
    JOIN team_members tm ON tm.id = pr.member_id
    LEFT JOIN team_members rv ON rv.id = pr.reviewer_id
    WHERE
      (${memberId ?? null} IS NULL OR pr.member_id = ${memberId ?? null})
      AND (${status ?? null} IS NULL OR pr.status = ${status ?? null})
    ORDER BY pr.created_at DESC
  `;
}

export async function getPerformanceReview(id: string): Promise<PerformanceReview | null> {
  await ensureHrmsTables();
  const sql = getSql();
  const rows = await sql<PerformanceReview[]>`
    SELECT
      pr.id,
      pr.member_id              AS "memberId",
      tm.full_name              AS "memberName",
      tm.email                  AS "memberEmail",
      pr.reviewer_id            AS "reviewerId",
      rv.full_name              AS "reviewerName",
      pr.period,
      pr.rating,
      pr.strengths,
      pr.areas_for_improvement  AS "areasForImprovement",
      pr.goals_next_period      AS "goalsNextPeriod",
      pr.status,
      pr.reviewed_at            AS "reviewedAt",
      pr.created_at             AS "createdAt",
      pr.updated_at             AS "updatedAt"
    FROM performance_reviews pr
    JOIN team_members tm ON tm.id = pr.member_id
    LEFT JOIN team_members rv ON rv.id = pr.reviewer_id
    WHERE pr.id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createPerformanceReview(input: {
  memberId: string;
  reviewerId: string;
  period: string;
  rating?: number;
  strengths?: string;
  areasForImprovement?: string;
  goalsNextPeriod?: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO performance_reviews (
      id, member_id, reviewer_id, period, rating,
      strengths, areas_for_improvement, goals_next_period,
      status, reviewed_at, created_at, updated_at
    ) VALUES (
      ${id}, ${input.memberId}, ${input.reviewerId}, ${input.period},
      ${input.rating ?? null},
      ${input.strengths ?? null}, ${input.areasForImprovement ?? null},
      ${input.goalsNextPeriod ?? null},
      'submitted', ${now}, ${now}, ${now}
    )
  `;
  return { id };
}

export async function updatePerformanceReview(
  id: string,
  input: {
    rating?: number;
    strengths?: string;
    areasForImprovement?: string;
    goalsNextPeriod?: string;
    status?: string;
  }
): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();
  await sql`
    UPDATE performance_reviews SET
      rating                = COALESCE(${input.rating ?? null}, rating),
      strengths             = COALESCE(${input.strengths ?? null}, strengths),
      areas_for_improvement = COALESCE(${input.areasForImprovement ?? null}, areas_for_improvement),
      goals_next_period     = COALESCE(${input.goalsNextPeriod ?? null}, goals_next_period),
      status                = COALESCE(${input.status ?? null}, status),
      updated_at            = ${now}
    WHERE id = ${id}
  `;
}
