import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listEmployees } from "@/lib/hrms/employees";
import { listDepartments } from "@/lib/hrms/departments";
import Link from "next/link";
import { UserPlus, Search, Mail, Building2, CircleDot } from "lucide-react";

export const metadata = { title: "Employees — HRMS" };

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "HR Admin",
  employee: "Employee",
};

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "employees:read")) redirect("/hrms/dashboard");

  const { q = "", dept = "" } = await searchParams;

  const [employees, departments] = await Promise.all([
    listEmployees(),
    listDepartments(),
  ]);

  const filtered = employees.filter((e) => {
    const matchQ =
      !q ||
      e.fullName.toLowerCase().includes(q.toLowerCase()) ||
      e.email.toLowerCase().includes(q.toLowerCase());
    const matchDept = !dept || e.departmentId === dept;
    return matchQ && matchDept;
  });

  const canCreate = hasPermission(session.role, "employees:create");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Employees</h1>
          <p className="text-stone-500 text-sm mt-0.5">{employees.length} team members</p>
        </div>
        {canCreate && (
          <Link
            href="/hrms/employees/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
          >
            <UserPlus size={14} /> Onboard employee
          </Link>
        )}
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] transition-colors"
          />
        </div>
        <select
          name="dept"
          defaultValue={dept}
          className="px-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-300 focus:outline-none focus:border-[#C87660] transition-colors"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 text-sm font-medium rounded-xl hover:border-stone-600 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Name</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden sm:table-cell">Email</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden md:table-cell">Department</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Type</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Role</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-stone-600 text-sm">
                  {q || dept ? "No employees match your filters." : "No employees yet."}
                </td>
              </tr>
            )}
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-b border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-stone-400 uppercase">
                        {emp.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white leading-tight">{emp.fullName}</p>
                      {emp.joinDate && (
                        <p className="text-[11px] text-stone-600">
                          Joined {new Date(emp.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell">
                  <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 text-stone-400 hover:text-[#C87660] transition-colors">
                    <Mail size={11} />
                    {emp.email}
                  </a>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  {emp.departmentName ? (
                    <span className="flex items-center gap-1.5 text-stone-400">
                      <Building2 size={11} /> {emp.departmentName}
                    </span>
                  ) : (
                    <span className="text-stone-700">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-stone-400 text-xs">
                  {TYPE_LABELS[emp.employmentType ?? ""] ?? "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[11px] font-medium">
                    {ROLE_LABELS[emp.role] ?? emp.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${emp.isActive ? "text-emerald-400" : "text-stone-600"}`}>
                    <CircleDot size={9} />
                    {emp.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/hrms/employees/${emp.id}`}
                    className="text-xs text-stone-500 hover:text-[#C87660] transition-colors font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
