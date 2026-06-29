import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isHrmsUser, isHrmsAdmin } from "@/lib/hrms/access";
import { getEmployeeCount } from "@/lib/hrms/employees";
import { getPendingLeaveCount } from "@/lib/hrms/leaves";
import { hasDatabaseUrl } from "@/lib/db";
import Link from "next/link";
import {
  Users, CalendarDays, Banknote, TrendingUp,
  UserPlus, CheckCircle, Clock, AlertCircle,
} from "lucide-react";

export const metadata = { title: "Dashboard — HRMS" };

function StatCard({
  label, value, sub, icon: Icon, href, color = "stone",
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; href?: string; color?: "orange" | "stone" | "green" | "yellow";
}) {
  const colorMap = {
    orange: "text-[#C87660] bg-[#C87660]/10",
    green:  "text-emerald-400 bg-emerald-400/10",
    yellow: "text-amber-400 bg-amber-400/10",
    stone:  "text-stone-400 bg-stone-800",
  };
  const card = (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl px-6 py-5 flex items-center gap-4 hover:border-stone-700 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-white tabular-nums">{value}</p>
        <p className="text-xs text-stone-500 mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-stone-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session || !isHrmsUser(session.role)) redirect("/login");

  const isAdmin = isHrmsAdmin(session.role);

  let employeeCount = 0;
  let pendingLeaves = 0;

  if (hasDatabaseUrl()) {
    [employeeCount, pendingLeaves] = await Promise.all([
      getEmployeeCount(),
      isAdmin ? getPendingLeaveCount() : Promise.resolve(0),
    ]);
  }

  const month = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-stone-600 uppercase tracking-widest">{month}</p>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
          Welcome back{session.role !== "employee" ? ", HR" : ""}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {isAdmin ? "Here's what's happening across the team." : "Here's your workspace."}
        </p>
      </div>

      {/* Stats grid */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active employees" value={employeeCount} icon={Users} href="/hrms/employees" color="orange" />
          <StatCard label="Pending leave requests" value={pendingLeaves} icon={CalendarDays} href="/hrms/leaves" color={pendingLeaves > 0 ? "yellow" : "stone"} sub={pendingLeaves > 0 ? "Needs review" : "All clear"} />
          <StatCard label="Current month payroll" value="—" icon={Banknote} href="/hrms/payroll" color="stone" sub="No run yet" />
          <StatCard label="Open reviews" value="—" icon={TrendingUp} href="/hrms/performance" color="stone" sub="Not started" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard label="My pending leaves" value="—" icon={CalendarDays} href="/hrms/leaves" color="stone" />
          <StatCard label="My payslips" value="—" icon={Banknote} href="/hrms/payroll" color="stone" />
        </div>
      )}

      {/* Quick actions */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/hrms/employees/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
            >
              <UserPlus size={14} /> Onboard employee
            </Link>
            <Link
              href="/hrms/leaves"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
            >
              <CheckCircle size={14} /> Review leaves
            </Link>
            <Link
              href="/hrms/payroll"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
            >
              <Banknote size={14} /> Run payroll
            </Link>
          </div>
        </div>
      )}

      {/* Employee quick actions */}
      {!isAdmin && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/hrms/leaves/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
            >
              <CalendarDays size={14} /> Apply for leave
            </Link>
            <Link
              href="/hrms/attendance"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 hover:text-white transition-colors"
            >
              <Clock size={14} /> Log attendance
            </Link>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex gap-4">
        <AlertCircle size={18} className="text-stone-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-stone-300">HRMS is live</p>
          <p className="text-xs text-stone-600 mt-1">
            Modules: Employees · Leaves · Payroll · Attendance · Performance · Assets · Announcements.
            Data is stored securely in your Neon database.
          </p>
        </div>
      </div>
    </div>
  );
}
