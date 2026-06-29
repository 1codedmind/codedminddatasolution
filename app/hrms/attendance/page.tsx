import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isHrmsUser } from "@/lib/hrms/access";

export const metadata = { title: "Attendance — HRMS" };

export default async function AttendancePage() {
  const session = await getCurrentSession();
  if (!session || !isHrmsUser(session.role)) redirect("/login");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Attendance</h1>
        <p className="text-stone-500 text-sm mt-0.5">Track check-ins, check-outs, and working hours.</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
        <p className="text-stone-500 text-sm">Attendance tracking coming soon.</p>
        <p className="text-stone-600 text-xs mt-2">Will include daily log, monthly summary, and WFH tracking.</p>
      </div>
    </div>
  );
}
