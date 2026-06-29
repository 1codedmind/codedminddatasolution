import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import NewPayRunForm from "./NewPayRunForm";

export const metadata = { title: "New Pay Run — HRMS" };

export default async function NewPayrollPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "payroll:create")) redirect("/hrms/payroll");

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/payroll" className="text-sm text-stone-500 hover:text-stone-300 transition">← Payroll</a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">New pay run</h1>
        <p className="text-stone-500 text-sm mt-1">Create a pay run, then add employees and their salary breakdown.</p>
      </div>
      <NewPayRunForm />
    </div>
  );
}
