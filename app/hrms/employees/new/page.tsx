import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listDepartments } from "@/lib/hrms/departments";
import OnboardingForm from "./OnboardingForm";

export const metadata = { title: "Onboard Employee — HRMS" };

export default async function NewEmployeePage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "employees:create")) redirect("/hrms/employees");

  const departments = await listDepartments();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/employees" className="text-sm text-stone-500 hover:text-stone-300 transition">← Employees</a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">Onboard employee</h1>
        <p className="text-stone-500 text-sm mt-1">Create a login and profile for a new team member.</p>
      </div>
      <OnboardingForm departments={departments} isSuperadmin={session.role === "superadmin"} />
    </div>
  );
}
