import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type LeaveType = {
  id: string;
  name: string;
  daysPerYear: number | null;
  isPaid: boolean;
};

export type LeaveRequest = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  leaveTypeId: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewedBy: string | null;
  reviewerName: string | null;
  reviewNote: string | null;
  appliedAt: string;
  updatedAt: string;
};

export async function listLeaveTypes(): Promise<LeaveType[]> {
  "use cache";
  await ensureHrmsTables();
  const sql = getSql();
  return sql<LeaveType[]>`
    SELECT id, name, days_per_year AS "daysPerYear", is_paid AS "isPaid"
    FROM leave_types
    ORDER BY name
  `;
}

export async function listLeaves(memberId?: string): Promise<LeaveRequest[]> {
  await ensureHrmsTables();
  const sql = getSql();
  if (memberId) {
    return sql<LeaveRequest[]>`
      SELECT
        lr.id,
        lr.member_id     AS "memberId",
        tm.full_name     AS "memberName",
        tm.email         AS "memberEmail",
        lr.leave_type_id AS "leaveTypeId",
        lt.name          AS "leaveTypeName",
        lr.from_date     AS "fromDate",
        lr.to_date       AS "toDate",
        lr.days_count    AS "daysCount",
        lr.reason,
        lr.status,
        lr.reviewed_by   AS "reviewedBy",
        rv.full_name     AS "reviewerName",
        lr.review_note   AS "reviewNote",
        lr.applied_at    AS "appliedAt",
        lr.updated_at    AS "updatedAt"
      FROM leave_requests lr
      JOIN team_members tm ON tm.id = lr.member_id
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      LEFT JOIN team_members rv ON rv.id = lr.reviewed_by
      WHERE lr.member_id = ${memberId}
      ORDER BY lr.applied_at DESC
    `;
  }
  return sql<LeaveRequest[]>`
    SELECT
      lr.id,
      lr.member_id     AS "memberId",
      tm.full_name     AS "memberName",
      tm.email         AS "memberEmail",
      lr.leave_type_id AS "leaveTypeId",
      lt.name          AS "leaveTypeName",
      lr.from_date     AS "fromDate",
      lr.to_date       AS "toDate",
      lr.days_count    AS "daysCount",
      lr.reason,
      lr.status,
      lr.reviewed_by   AS "reviewedBy",
      rv.full_name     AS "reviewerName",
      lr.review_note   AS "reviewNote",
      lr.applied_at    AS "appliedAt",
      lr.updated_at    AS "updatedAt"
    FROM leave_requests lr
    JOIN team_members tm ON tm.id = lr.member_id
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    LEFT JOIN team_members rv ON rv.id = lr.reviewed_by
    ORDER BY lr.applied_at DESC
  `;
}

export async function getLeaveRequest(id: string): Promise<LeaveRequest | null> {
  await ensureHrmsTables();
  const sql = getSql();
  const rows = await sql<LeaveRequest[]>`
    SELECT
      lr.id,
      lr.member_id     AS "memberId",
      tm.full_name     AS "memberName",
      tm.email         AS "memberEmail",
      lr.leave_type_id AS "leaveTypeId",
      lt.name          AS "leaveTypeName",
      lr.from_date     AS "fromDate",
      lr.to_date       AS "toDate",
      lr.days_count    AS "daysCount",
      lr.reason,
      lr.status,
      lr.reviewed_by   AS "reviewedBy",
      rv.full_name     AS "reviewerName",
      lr.review_note   AS "reviewNote",
      lr.applied_at    AS "appliedAt",
      lr.updated_at    AS "updatedAt"
    FROM leave_requests lr
    JOIN team_members tm ON tm.id = lr.member_id
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    LEFT JOIN team_members rv ON rv.id = lr.reviewed_by
    WHERE lr.id = ${id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function createLeaveRequest(input: {
  memberId: string;
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  daysCount: number;
  reason?: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO leave_requests (id, member_id, leave_type_id, from_date, to_date, days_count, reason, status, applied_at, updated_at)
    VALUES (
      ${id}, ${input.memberId}, ${input.leaveTypeId},
      ${input.fromDate}, ${input.toDate}, ${input.daysCount},
      ${input.reason ?? null}, 'pending', ${now}, ${now}
    )
  `;
  return { id };
}

export async function reviewLeaveRequest(input: {
  id: string;
  status: "approved" | "rejected";
  reviewedBy: string;
  reviewNote?: string;
}): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  await sql`
    UPDATE leave_requests
    SET status      = ${input.status},
        reviewed_by = ${input.reviewedBy},
        review_note = ${input.reviewNote ?? null},
        updated_at  = ${new Date().toISOString()}
    WHERE id = ${input.id} AND status = 'pending'
  `;
}

export async function getPendingLeaveCount(): Promise<number> {
  await ensureHrmsTables();
  const sql = getSql();
  const [{ count }] = await sql<[{ count: string }]>`
    SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'pending'
  `;
  return parseInt(count, 10);
}
