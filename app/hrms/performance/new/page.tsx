import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listEmployees } from "@/lib/hrms/employees";
import CreateReviewForm from "./CreateReviewForm";

export const metadata = { title: "New Review — HRMS" };

export default async function NewReviewPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "performance:manage")) redirect("/hrms/performance");

  const employees = await listEmployees();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/performance" className="text-sm text-stone-500 hover:text-stone-300 transition">← Performance</a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">New performance review</h1>
        <p className="text-stone-500 text-sm mt-1">Submit a review for an employee. They will see it and can acknowledge it.</p>
      </div>
      <CreateReviewForm employees={employees.map((e) => ({ id: e.id, fullName: e.fullName, email: e.email }))} />
    </div>
  );
}
