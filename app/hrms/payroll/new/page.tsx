import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";

export const metadata = { title: "New Pay Run — HRMS" };

export default async function NewPayrollPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) redirect("/hrms/payroll");

  const now = new Date();
  const month = now.getMonth() + 1;
  const year  = now.getFullYear();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/payroll" className="text-sm text-stone-500 hover:text-stone-300 transition">← Payroll</a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">New pay run</h1>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-center py-12">
        <p className="text-stone-500 text-sm">
          Payroll module coming soon — payslip generation and salary configuration.
        </p>
        <p className="text-stone-600 text-xs mt-2">Current period: {month}/{year}</p>
      </div>
    </div>
  );
}
