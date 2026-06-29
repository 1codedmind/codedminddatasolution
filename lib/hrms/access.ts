import type { UserRole } from "@/lib/auth/session";

export type HrmsPermission =
  | "employees:read"
  | "employees:create"
  | "employees:update"
  | "employees:delete"
  | "departments:read"
  | "departments:manage"
  | "leaves:read:all"
  | "leaves:read:own"
  | "leaves:create"
  | "leaves:approve"
  | "payroll:read"
  | "payroll:create"
  | "payroll:delete"
  | "attendance:read:all"
  | "attendance:read:own"
  | "attendance:log"
  | "performance:read:all"
  | "performance:read:own"
  | "performance:manage"
  | "assets:read"
  | "assets:manage"
  | "announcements:read"
  | "announcements:manage";

const ROLE_PERMISSIONS: Record<string, HrmsPermission[]> = {
  superadmin: [
    "employees:read", "employees:create", "employees:update", "employees:delete",
    "departments:read", "departments:manage",
    "leaves:read:all", "leaves:read:own", "leaves:create", "leaves:approve",
    "payroll:read", "payroll:create", "payroll:delete",
    "attendance:read:all", "attendance:read:own", "attendance:log",
    "performance:read:all", "performance:read:own", "performance:manage",
    "assets:read", "assets:manage",
    "announcements:read", "announcements:manage",
  ],
  admin: [
    "employees:read", "employees:create", "employees:update",
    "departments:read",
    "leaves:read:all", "leaves:read:own", "leaves:create", "leaves:approve",
    "payroll:read", "payroll:create",
    "attendance:read:all", "attendance:read:own", "attendance:log",
    "performance:read:all", "performance:read:own", "performance:manage",
    "assets:read", "assets:manage",
    "announcements:read", "announcements:manage",
  ],
  employee: [
    "departments:read",
    "leaves:read:own", "leaves:create",
    "attendance:read:own", "attendance:log",
    "performance:read:own",
    "assets:read",
    "announcements:read",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: HrmsPermission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function isHrmsUser(role: UserRole | undefined): boolean {
  return role === "superadmin" || role === "admin" || role === "employee";
}

export function isHrmsAdmin(role: UserRole | undefined): boolean {
  return role === "superadmin" || role === "admin";
}

// Nav items shown per role
export type NavItem = {
  label: string;
  href: string;
  icon: string;
  permission?: HrmsPermission;
};

export const HRMS_NAV: NavItem[] = [
  { label: "Dashboard",     href: "/hrms/dashboard",     icon: "LayoutDashboard" },
  { label: "Employees",     href: "/hrms/employees",     icon: "Users",           permission: "employees:read" },
  { label: "My Profile",    href: "/hrms/employees/me",  icon: "CircleUser",      permission: "leaves:read:own" },
  { label: "Departments",   href: "/hrms/departments",   icon: "Building2",       permission: "departments:manage" },
  { label: "Leaves",        href: "/hrms/leaves",        icon: "CalendarDays" },
  { label: "Payroll",       href: "/hrms/payroll",       icon: "Banknote",        permission: "payroll:read" },
  { label: "Attendance",    href: "/hrms/attendance",    icon: "Clock" },
  { label: "Performance",   href: "/hrms/performance",   icon: "TrendingUp" },
  { label: "Assets",        href: "/hrms/assets",        icon: "Monitor",         permission: "assets:read" },
  { label: "Announcements", href: "/hrms/announcements", icon: "Megaphone" },
];
