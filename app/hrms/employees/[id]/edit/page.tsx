import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getEmployee } from "@/lib/hrms/employees";
import { listDepartments } from "@/lib/hrms/departments";
import EditProfileForm from "./EditProfileForm";

export const metadata = { title: "Edit Profile — HRMS" };

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const isSelf = id === session.sub;
  const canEdit = hasPermission(session.role, "employees:update");

  if (!isSelf && !canEdit) redirect("/hrms/dashboard");

  const [emp, departments] = await Promise.all([
    getEmployee(id),
    listDepartments(),
  ]);

  if (!emp) notFound();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href={`/hrms/employees/${id}`} className="text-sm text-stone-500 hover:text-stone-300 transition">
          ← {emp.fullName}
        </a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">Edit profile</h1>
        <p className="text-stone-500 text-sm mt-1">{emp.email}</p>
      </div>
      <EditProfileForm emp={emp} departments={departments} isSelf={isSelf} />
    </div>
  );
}
