import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getEmployee } from "@/lib/hrms/employees";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = { title: "Change Password — HRMS" };

export default async function ChangePasswordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const isSelf = id === session.sub;
  const canResetOthers = hasPermission(session.role, "employees:update") && !isSelf;

  if (!isSelf && !canResetOthers) redirect("/hrms/dashboard");

  const emp = await getEmployee(id);
  if (!emp) notFound();

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <a
          href={`/hrms/employees/${id}`}
          className="text-sm text-stone-500 hover:text-stone-300 transition"
        >
          ← {emp.fullName}
        </a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">
          {isSelf ? "Change your password" : `Reset password for ${emp.fullName}`}
        </h1>
        {!isSelf && (
          <p className="text-stone-500 text-sm mt-1">
            As an admin you can set a new password without knowing the current one.
            Let the employee know their new temporary password.
          </p>
        )}
      </div>
      <ChangePasswordForm memberId={id} isSelf={isSelf} />
    </div>
  );
}
