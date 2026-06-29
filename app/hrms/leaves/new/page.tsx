import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { listLeaveTypes } from "@/lib/hrms/leaves";
import LeaveRequestForm from "./LeaveRequestForm";

export const metadata = { title: "Apply for Leave — HRMS" };

export default async function NewLeavePage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "leaves:create")) redirect("/hrms/leaves");

  const leaveTypes = await listLeaveTypes();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/leaves" className="text-sm text-stone-500 hover:text-stone-300 transition">← Leave requests</a>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-3">Apply for leave</h1>
        <p className="text-stone-500 text-sm mt-1">Submit a leave request for review.</p>
      </div>
      <LeaveRequestForm leaveTypes={leaveTypes} memberId={session.sub} />
    </div>
  );
}
