import type { UserRole } from "@/lib/auth/session";

type ExamPermission =
  | "questions:read"
  | "questions:write"
  | "questions:delete"
  | "exams:manage"
  | "exams:take";

const ROLE_PERMISSIONS: Record<UserRole, ExamPermission[]> = {
  superadmin: ["questions:read", "questions:write", "questions:delete", "exams:manage", "exams:take"],
  admin:      ["questions:read", "questions:write", "questions:delete", "exams:manage"],
  employee:   ["questions:read", "questions:write"],
  candidate:  ["exams:take"],
};

export function hasExamPermission(role: UserRole, permission: ExamPermission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
