import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isHrmsUser, HRMS_NAV, hasPermission } from "@/lib/hrms/access";
import type { HrmsPermission } from "@/lib/hrms/access";
import HrmsSidebar from "@/components/hrms/HrmsSidebar";
import { Suspense } from "react";

async function HrmsShell({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session) redirect("/login");
  if (!isHrmsUser(session.role)) redirect("/");

  const allPermissions = [
    "employees:read", "employees:create", "employees:update", "employees:delete",
    "departments:read", "departments:manage",
    "leaves:read:all", "leaves:read:own", "leaves:create", "leaves:approve",
    "payroll:read", "payroll:create", "payroll:delete",
    "attendance:read:all", "attendance:read:own", "attendance:log",
    "performance:read:all", "performance:read:own", "performance:manage",
    "assets:read", "assets:manage",
    "announcements:read", "announcements:manage",
  ].filter((p) => hasPermission(session.role, p as HrmsPermission)) as HrmsPermission[];

  return (
    <div className="flex flex-1 min-h-0">
      <HrmsSidebar
        role={session.role}
        email={session.email}
        navItems={HRMS_NAV}
        permissions={allPermissions}
      />
      <main className="flex-1 overflow-y-auto bg-stone-950 min-w-0">
        {children}
      </main>
    </div>
  );
}

// Static outer shell — no async data. Suspense wraps HrmsShell so that
// the cookies() call inside getCurrentSession() is inside a Suspense boundary.
export default function HrmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex flex-1 min-h-0">
        <div className="shrink-0 w-56 bg-stone-950 border-r border-stone-800 animate-pulse" />
        <main className="flex-1 bg-stone-950" />
      </div>
    }>
      <HrmsShell>{children}</HrmsShell>
    </Suspense>
  );
}
