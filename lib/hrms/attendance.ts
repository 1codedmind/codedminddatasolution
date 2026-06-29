import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type AttendanceLog = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  workHours: number | null;
  status: string;
  note: string | null;
  createdAt: string;
};

export async function listAttendance(opts: {
  memberId?: string;
  month?: number;
  year?: number;
  limit?: number;
}): Promise<AttendanceLog[]> {
  await ensureHrmsTables();
  const sql = getSql();
  const { memberId, month, year, limit = 200 } = opts;
  return sql<AttendanceLog[]>`
    SELECT
      al.id,
      al.member_id       AS "memberId",
      tm.full_name       AS "memberName",
      tm.email           AS "memberEmail",
      al.date,
      al.check_in_at     AS "checkInAt",
      al.check_out_at    AS "checkOutAt",
      al.work_hours      AS "workHours",
      al.status,
      al.note,
      al.created_at      AS "createdAt"
    FROM attendance_logs al
    JOIN team_members tm ON tm.id = al.member_id
    WHERE
      (${memberId ?? null} IS NULL OR al.member_id = ${memberId ?? null})
      AND (${month ?? null} IS NULL
           OR CAST(SUBSTRING(al.date, 6, 2) AS INTEGER) = ${month ?? null})
      AND (${year ?? null} IS NULL
           OR CAST(SUBSTRING(al.date, 1, 4) AS INTEGER) = ${year ?? null})
    ORDER BY al.date DESC, al.check_in_at DESC
    LIMIT ${limit}
  `;
}

export async function getTodayAttendance(memberId: string): Promise<AttendanceLog | null> {
  await ensureHrmsTables();
  const sql = getSql();
  const today = new Date().toISOString().slice(0, 10);
  const rows = await sql<AttendanceLog[]>`
    SELECT
      al.id,
      al.member_id       AS "memberId",
      tm.full_name       AS "memberName",
      tm.email           AS "memberEmail",
      al.date,
      al.check_in_at     AS "checkInAt",
      al.check_out_at    AS "checkOutAt",
      al.work_hours      AS "workHours",
      al.status,
      al.note,
      al.created_at      AS "createdAt"
    FROM attendance_logs al
    JOIN team_members tm ON tm.id = al.member_id
    WHERE al.member_id = ${memberId} AND al.date = ${today}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function checkIn(memberId: string, note?: string): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const existing = await getTodayAttendance(memberId);
  if (existing) {
    await sql`
      UPDATE attendance_logs
      SET check_in_at = ${now}, status = 'present', note = COALESCE(${note ?? null}, note)
      WHERE id = ${existing.id}
    `;
    return { id: existing.id };
  }

  const id = randomUUID();
  await sql`
    INSERT INTO attendance_logs (id, member_id, date, check_in_at, status, note, created_at)
    VALUES (${id}, ${memberId}, ${today}, ${now}, 'present', ${note ?? null}, ${now})
  `;
  return { id };
}

export async function checkOut(memberId: string): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();

  const existing = await getTodayAttendance(memberId);
  if (!existing?.checkInAt) throw new Error("No check-in found for today.");

  const checkIn = new Date(existing.checkInAt);
  const checkOut = new Date(now);
  const workHours = Math.round(((checkOut.getTime() - checkIn.getTime()) / 3_600_000) * 100) / 100;

  await sql`
    UPDATE attendance_logs
    SET check_out_at = ${now}, work_hours = ${workHours}
    WHERE id = ${existing.id}
  `;
}
