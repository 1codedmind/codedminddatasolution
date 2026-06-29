import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getPayrollRun, getPayrollItems } from "@/lib/hrms/payroll";
import { listEmployees } from "@/lib/hrms/employees";
import PayrollRunActions from "./PayrollRunActions";

export const metadata = { title: "Pay Run — HRMS" };

export default async function PayrollRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:read")) redirect("/hrms/payroll");

  const { id } = await params;

  const [run, items, employees] = await Promise.all([
    getPayrollRun(id),
    getPayrollItems(id),
    listEmployees(),
  ]);

  if (!run) notFound();

  const canDelete = hasPermission(session.role, "payroll:delete");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/payroll" className="text-sm text-stone-500 hover:text-stone-300 transition">
          ← Payroll
        </a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">Pay run detail</h1>
      </div>
      <PayrollRunActions
        run={run}
        items={items}
        employees={employees.map((e) => ({ id: e.id, fullName: e.fullName, email: e.email }))}
        canDelete={canDelete}
      />
    </div>
  );
}
