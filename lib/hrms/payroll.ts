import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type PayrollRun = {
  id: string;
  periodMonth: number;
  periodYear: number;
  status: "draft" | "processing" | "completed" | "cancelled";
  runDate: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  itemCount: number;
  totalNet: number;
};

export type PayrollItem = {
  id: string;
  payrollRunId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  netPay: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "on_hold";
  paidAt: string | null;
  notes: string | null;
};

export async function listPayrollRuns(): Promise<PayrollRun[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<PayrollRun[]>`
    SELECT
      pr.id,
      pr.period_month AS "periodMonth",
      pr.period_year  AS "periodYear",
      pr.status,
      pr.run_date     AS "runDate",
      pr.notes,
      pr.created_by   AS "createdBy",
      pr.created_at   AS "createdAt",
      COUNT(pi.id)    AS "itemCount",
      COALESCE(SUM(pi.net_pay), 0) AS "totalNet"
    FROM payroll_runs pr
    LEFT JOIN payroll_items pi ON pi.payroll_run_id = pr.id
    GROUP BY pr.id
    ORDER BY pr.period_year DESC, pr.period_month DESC
  `;
}

export async function getPayrollRun(id: string): Promise<PayrollRun | null> {
  await ensureHrmsTables();
  const sql = getSql();
  const rows = await sql<PayrollRun[]>`
    SELECT
      pr.id,
      pr.period_month AS "periodMonth",
      pr.period_year  AS "periodYear",
      pr.status,
      pr.run_date     AS "runDate",
      pr.notes,
      pr.created_by   AS "createdBy",
      pr.created_at   AS "createdAt",
      COUNT(pi.id)    AS "itemCount",
      COALESCE(SUM(pi.net_pay), 0) AS "totalNet"
    FROM payroll_runs pr
    LEFT JOIN payroll_items pi ON pi.payroll_run_id = pr.id
    WHERE pr.id = ${id}
    GROUP BY pr.id
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getPayrollItems(runId: string): Promise<PayrollItem[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<PayrollItem[]>`
    SELECT
      pi.id,
      pi.payroll_run_id  AS "payrollRunId",
      pi.member_id       AS "memberId",
      tm.full_name       AS "memberName",
      tm.email           AS "memberEmail",
      pi.basic_salary    AS "basicSalary",
      pi.allowances,
      pi.deductions,
      pi.bonus,
      pi.net_pay         AS "netPay",
      pi.currency,
      pi.payment_status  AS "paymentStatus",
      pi.paid_at         AS "paidAt",
      pi.notes
    FROM payroll_items pi
    JOIN team_members tm ON tm.id = pi.member_id
    WHERE pi.payroll_run_id = ${runId}
    ORDER BY tm.full_name
  `;
}

export async function getMyPayslips(memberId: string): Promise<PayrollItem[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<PayrollItem[]>`
    SELECT
      pi.id,
      pi.payroll_run_id  AS "payrollRunId",
      pi.member_id       AS "memberId",
      tm.full_name       AS "memberName",
      tm.email           AS "memberEmail",
      pi.basic_salary    AS "basicSalary",
      pi.allowances,
      pi.deductions,
      pi.bonus,
      pi.net_pay         AS "netPay",
      pi.currency,
      pi.payment_status  AS "paymentStatus",
      pi.paid_at         AS "paidAt",
      pi.notes,
      pr.period_month    AS "periodMonth",
      pr.period_year     AS "periodYear"
    FROM payroll_items pi
    JOIN team_members tm ON tm.id = pi.member_id
    JOIN payroll_runs pr ON pr.id = pi.payroll_run_id
    WHERE pi.member_id = ${memberId} AND pr.status = 'completed'
    ORDER BY pr.period_year DESC, pr.period_month DESC
  `;
}

export async function createPayrollRun(input: {
  periodMonth: number;
  periodYear: number;
  createdBy: string;
  notes?: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  await sql`
    INSERT INTO payroll_runs (id, period_month, period_year, status, notes, created_by, created_at)
    VALUES (${id}, ${input.periodMonth}, ${input.periodYear}, 'draft', ${input.notes ?? null}, ${input.createdBy}, ${new Date().toISOString()})
  `;
  return { id };
}

export async function addPayrollItem(input: {
  payrollRunId: string;
  memberId: string;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  bonus?: number;
  currency?: string;
  notes?: string;
}): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  const { basicSalary, allowances = 0, deductions = 0, bonus = 0 } = input;
  const netPay = basicSalary + allowances + bonus - deductions;
  await sql`
    INSERT INTO payroll_items (
      id, payroll_run_id, member_id, basic_salary, allowances, deductions,
      bonus, net_pay, currency, payment_status
    ) VALUES (
      ${id}, ${input.payrollRunId}, ${input.memberId},
      ${basicSalary}, ${allowances}, ${deductions}, ${bonus}, ${netPay},
      ${input.currency ?? "INR"}, 'pending'
    )
  `;
  return { id };
}

export async function updatePayrollRunStatus(
  id: string,
  status: "draft" | "processing" | "completed" | "cancelled"
): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const runDate = status === "completed" ? new Date().toISOString() : null;
  await sql`
    UPDATE payroll_runs SET status = ${status}, run_date = COALESCE(${runDate}, run_date) WHERE id = ${id}
  `;
}

export async function updatePayrollItemStatus(
  itemId: string,
  paymentStatus: "pending" | "paid" | "on_hold"
): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const paidAt = paymentStatus === "paid" ? new Date().toISOString() : null;
  await sql`
    UPDATE payroll_items
    SET payment_status = ${paymentStatus}, paid_at = COALESCE(${paidAt}, paid_at)
    WHERE id = ${itemId}
  `;
}

export async function removePayrollItem(itemId: string): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  await sql`DELETE FROM payroll_items WHERE id = ${itemId}`;
}

export async function deletePayrollRun(id: string): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  await sql`DELETE FROM payroll_items WHERE payroll_run_id = ${id}`;
  await sql`DELETE FROM payroll_runs WHERE id = ${id}`;
}
