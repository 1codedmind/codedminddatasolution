import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listPayrollRuns } from "@/lib/hrms/payroll";
import { getMyPayslips } from "@/lib/hrms/payroll";
import Link from "next/link";
import { Plus, Banknote } from "lucide-react";

export const metadata = { title: "Payroll — HRMS" };

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_STYLE: Record<string, string> = {
  draft:      "bg-stone-800 text-stone-400",
  processing: "bg-amber-500/15 text-amber-400",
  completed:  "bg-emerald-500/15 text-emerald-400",
  cancelled:  "bg-red-500/15 text-red-400",
};

export default async function PayrollPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const isAdmin = isHrmsAdmin(session.role);

  if (isAdmin) {
    if (!hasPermission(session.role, "payroll:read")) redirect("/hrms/dashboard");
    const runs = await listPayrollRuns();

    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Payroll</h1>
            <p className="text-stone-500 text-sm mt-0.5">{runs.length} pay run{runs.length !== 1 ? "s" : ""}</p>
          </div>
          {hasPermission(session.role, "payroll:create") && (
            <Link
              href="/hrms/payroll/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
            >
              <Plus size={14} /> New pay run
            </Link>
          )}
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Period</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Employees</th>
                <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Total net pay</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-stone-600 text-sm">No pay runs yet.</td>
                </tr>
              )}
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-white">
                    {MONTH_NAMES[run.periodMonth - 1]} {run.periodYear}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[run.status]}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-stone-400">{run.itemCount}</td>
                  <td className="px-5 py-3.5 text-right text-stone-300 font-mono text-xs">
                    ₹{Number(run.totalNet).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/hrms/payroll/${run.id}`} className="text-xs text-stone-500 hover:text-[#C87660] transition-colors font-medium">
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

  // Employee — show own payslips
  const payslips = await getMyPayslips(session.sub);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Payslips</h1>
        <p className="text-stone-500 text-sm mt-0.5">{payslips.length} payslip{payslips.length !== 1 ? "s" : ""}</p>
      </div>

      {payslips.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <Banknote size={32} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-600 text-sm">No payslips available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((p) => (
            <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{MONTH_NAMES[(p as unknown as { periodMonth: number }).periodMonth - 1]} {(p as unknown as { periodYear: number }).periodYear}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Basic ₹{Number(p.basicSalary).toLocaleString("en-IN")} · Allowances ₹{Number(p.allowances).toLocaleString("en-IN")} · Deductions ₹{Number(p.deductions).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-lg">₹{Number(p.netPay).toLocaleString("en-IN")}</p>
                <span className={`text-[11px] font-semibold ${p.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                  {p.paymentStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
