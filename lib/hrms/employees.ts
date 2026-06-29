import { getSql } from "@/lib/db";
import { ensureHrmsTables } from "./db-init";
import { randomUUID } from "crypto";
import { hashPassword } from "@/lib/auth/crypto";

export type EmployeeRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  // joined from employee_profiles
  joinDate: string | null;
  employmentType: string | null;
  departmentName: string | null;
  departmentId: string | null;
  designationId: string | null;
  phone: string | null;
  profileId: string | null;
};

export async function listEmployees(): Promise<EmployeeRow[]> {
  await ensureHrmsTables();
  const sql = getSql();
  return sql<EmployeeRow[]>`
    SELECT
      tm.id,
      tm.full_name         AS "fullName",
      tm.email,
      tm.role,
      tm.is_active         AS "isActive",
      tm.created_at        AS "createdAt",
      ep.id                AS "profileId",
      ep.join_date         AS "joinDate",
      ep.employment_type   AS "employmentType",
      ep.department_id     AS "departmentId",
      ep.designation_id    AS "designationId",
      ep.phone,
      d.name               AS "departmentName"
    FROM team_members tm
    LEFT JOIN employee_profiles ep ON ep.member_id = tm.id
    LEFT JOIN departments d ON d.id = ep.department_id
    ORDER BY tm.created_at DESC
  `;
}

export type EmployeeDetail = EmployeeRow & {
  dateOfBirth: string | null;
  personalEmail: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  reportingTo: string | null;
  reportingToName: string | null;
};

export async function getEmployee(memberId: string): Promise<EmployeeDetail | null> {
  await ensureHrmsTables();
  const sql = getSql();
  const rows = await sql<EmployeeDetail[]>`
    SELECT
      tm.id,
      tm.full_name              AS "fullName",
      tm.email,
      tm.role,
      tm.is_active              AS "isActive",
      tm.created_at             AS "createdAt",
      ep.id                     AS "profileId",
      ep.join_date              AS "joinDate",
      ep.employment_type        AS "employmentType",
      ep.department_id          AS "departmentId",
      ep.designation_id         AS "designationId",
      ep.phone,
      ep.date_of_birth          AS "dateOfBirth",
      ep.personal_email         AS "personalEmail",
      ep.address_line1          AS "addressLine1",
      ep.city,
      ep.state,
      ep.country,
      ep.emergency_contact_name  AS "emergencyContactName",
      ep.emergency_contact_phone AS "emergencyContactPhone",
      ep.reporting_to            AS "reportingTo",
      d.name                     AS "departmentName",
      mgr.full_name              AS "reportingToName"
    FROM team_members tm
    LEFT JOIN employee_profiles ep ON ep.member_id = tm.id
    LEFT JOIN departments d ON d.id = ep.department_id
    LEFT JOIN team_members mgr ON mgr.id = ep.reporting_to
    WHERE tm.id = ${memberId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export type CreateEmployeeInput = {
  fullName: string;
  email: string;
  role: "superadmin" | "admin" | "employee";
  password: string;
  joinDate?: string;
  employmentType?: string;
  departmentId?: string;
  phone?: string;
  createdBy: string;
};

export async function createEmployee(input: CreateEmployeeInput): Promise<{ id: string } | null> {
  await ensureHrmsTables();
  const sql = getSql();

  // Check email uniqueness
  const [existing] = await sql<[{ id: string }?]>`
    SELECT id FROM team_members WHERE email = ${input.email} LIMIT 1
  `;
  if (existing) return null;

  const { hash, salt } = hashPassword(input.password);
  const memberId = randomUUID();
  const profileId = randomUUID();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO team_members (id, full_name, email, role, is_active, password_hash, password_salt, created_at)
    VALUES (${memberId}, ${input.fullName}, ${input.email}, ${input.role}, true, ${hash}, ${salt}, ${now})
  `;

  await sql`
    INSERT INTO employee_profiles (
      id, member_id, join_date, employment_type, department_id, phone, created_at, updated_at
    ) VALUES (
      ${profileId},
      ${memberId},
      ${input.joinDate ?? now.slice(0, 10)},
      ${input.employmentType ?? "full_time"},
      ${input.departmentId ?? null},
      ${input.phone ?? null},
      ${now},
      ${now}
    )
  `;

  return { id: memberId };
}

export type UpdateProfileInput = {
  memberId: string;
  phone?: string;
  departmentId?: string;
  employmentType?: string;
  joinDate?: string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  reportingTo?: string;
};

export async function updateEmployeeProfile(input: UpdateProfileInput): Promise<void> {
  await ensureHrmsTables();
  const sql = getSql();
  const now = new Date().toISOString();

  const existing = await sql<[{ id: string }?]>`
    SELECT id FROM employee_profiles WHERE member_id = ${input.memberId} LIMIT 1
  `;

  if (!existing[0]) {
    await sql`
      INSERT INTO employee_profiles (id, member_id, employment_type, created_at, updated_at)
      VALUES (${randomUUID()}, ${input.memberId}, 'full_time', ${now}, ${now})
    `;
  }

  await sql`
    UPDATE employee_profiles SET
      phone                  = COALESCE(${input.phone ?? null}, phone),
      department_id          = COALESCE(${input.departmentId ?? null}, department_id),
      employment_type        = COALESCE(${input.employmentType ?? null}, employment_type),
      join_date              = COALESCE(${input.joinDate ?? null}, join_date),
      date_of_birth          = COALESCE(${input.dateOfBirth ?? null}, date_of_birth),
      city                   = COALESCE(${input.city ?? null}, city),
      state                  = COALESCE(${input.state ?? null}, state),
      country                = COALESCE(${input.country ?? null}, country),
      emergency_contact_name  = COALESCE(${input.emergencyContactName ?? null}, emergency_contact_name),
      emergency_contact_phone = COALESCE(${input.emergencyContactPhone ?? null}, emergency_contact_phone),
      reporting_to           = COALESCE(${input.reportingTo ?? null}, reporting_to),
      updated_at             = ${now}
    WHERE member_id = ${input.memberId}
  `;
}

export async function getEmployeeCount(): Promise<number> {
  await ensureHrmsTables();
  const sql = getSql();
  const [{ count }] = await sql<[{ count: string }]>`
    SELECT COUNT(*) AS count FROM team_members WHERE is_active = true
  `;
  return parseInt(count, 10);
}
