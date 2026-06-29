import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";

export type Department = {
  id: string;
  name: string;
  description: string | null;
  headId: string | null;
  headName: string | null;
  employeeCount: number;
  createdAt: string;
};

export async function listDepartments(): Promise<Department[]> {
  "use cache";
  await ensureHrmsTables();
  const sql = getSql();
  return sql<Department[]>`
    SELECT
      d.id,
      d.name,
      d.description,
      d.head_id       AS "headId",
      d.created_at    AS "createdAt",
      tm.full_name    AS "headName",
      COUNT(ep.id)    AS "employeeCount"
    FROM departments d
    LEFT JOIN team_members tm ON tm.id = d.head_id
    LEFT JOIN employee_profiles ep ON ep.department_id = d.id
    GROUP BY d.id, d.name, d.description, d.head_id, d.created_at, tm.full_name
    ORDER BY d.name
  `;
}

export async function createDepartment(name: string, description?: string): Promise<{ id: string }> {
  await ensureHrmsTables();
  const sql = getSql();
  const id = randomUUID();
  await sql`
    INSERT INTO departments (id, name, description, created_at)
    VALUES (${id}, ${name}, ${description ?? null}, ${new Date().toISOString()})
  `;
  return { id };
}
