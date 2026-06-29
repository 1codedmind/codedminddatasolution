import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listDepartments } from "@/lib/hrms/departments";
import Link from "next/link";
import { Building2, Users, Plus } from "lucide-react";
import CreateDepartmentForm from "./CreateDepartmentForm";

export const metadata = { title: "Departments — HRMS" };

export default async function DepartmentsPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "departments:read")) redirect("/hrms/dashboard");

  const departments = await listDepartments();
  const canManage = hasPermission(session.role, "departments:manage");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Departments</h1>
          <p className="text-stone-500 text-sm mt-0.5">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {departments.length === 0 && (
          <div className="col-span-full py-16 text-center text-stone-600 text-sm">
            No departments yet. Create one below.
          </div>
        )}
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-stone-900 border border-stone-800 rounded-2xl px-5 py-5 flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C87660]/10 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#C87660]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm leading-tight">{dept.name}</p>
                {dept.description && (
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">{dept.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-stone-500 mt-auto pt-2 border-t border-stone-800">
              <span className="flex items-center gap-1.5">
                <Users size={11} />
                {dept.employeeCount} employee{Number(dept.employeeCount) !== 1 ? "s" : ""}
              </span>
              {dept.headName && (
                <span className="truncate">Head: {dept.headName}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {canManage && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={14} /> Create department
          </h2>
          <CreateDepartmentForm />
        </div>
      )}
    </div>
  );
}
