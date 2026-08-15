import { randomUUID } from "crypto";

import { getSql, hasDatabaseUrl } from "@/lib/db";

/**
 * Append-only audit trail for privileged actions.
 *
 * The HRMS holds salary, performance, and employment records, but nothing
 * recorded who changed what. Without that there is no way to answer "who
 * deleted this pay run" after the fact — which matters most precisely when
 * something has gone wrong or is disputed.
 *
 * Writes are best-effort: an audit failure logs loudly but never blocks the
 * action the user asked for.
 */

export type AuditAction =
  | "employee.create"
  | "employee.update"
  | "employee.delete"
  | "employee.password_reset"
  | "payroll.create"
  | "payroll.delete"
  | "payroll.item_change"
  | "leave.review"
  | "performance.create"
  | "asset.assign"
  | "exam.question_delete";

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS audit_log (
      id           TEXT        PRIMARY KEY,
      actor_id     TEXT        NOT NULL,
      actor_email  TEXT        NOT NULL,
      actor_role   TEXT        NOT NULL,
      action       TEXT        NOT NULL,
      target_type  TEXT,
      target_id    TEXT,
      detail       TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_actor   ON audit_log (actor_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_target  ON audit_log (target_type, target_id)`;
  tableReady = true;
}

export async function recordAudit(input: {
  actor: { sub: string; email: string; role: string };
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  detail?: string;
}): Promise<void> {
  if (!hasDatabaseUrl()) return;

  try {
    await ensureTable();
    const sql = getSql();
    await sql`
      INSERT INTO audit_log (id, actor_id, actor_email, actor_role, action, target_type, target_id, detail)
      VALUES (
        ${randomUUID()},
        ${input.actor.sub},
        ${input.actor.email},
        ${input.actor.role},
        ${input.action},
        ${input.targetType ?? null},
        ${input.targetId ?? null},
        ${input.detail?.slice(0, 1000) ?? null}
      )
    `;
  } catch (err) {
    // Never let auditing break the operation it is recording.
    console.error("[audit] failed to record", input.action, err);
  }
}
