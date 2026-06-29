import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { getLeaveRequest } from "@/lib/hrms/leaves";
import LeaveActions from "./LeaveActions";

export const metadata = { title: "Leave Request — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  approved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  rejected:  "bg-red-500/15 text-red-400 border-red-500/20",
  cancelled: "bg-stone-800 text-stone-500 border-stone-700",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-stone-200">{value ?? <span className="text-stone-700">—</span>}</p>
    </div>
  );
}

export default async function LeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const leave = await getLeaveRequest(id);
  if (!leave) notFound();

  // Employees can only view their own requests
  if (!isHrmsAdmin(session.role) && leave.memberId !== session.sub) {
    redirect("/hrms/leaves");
  }

  const canApprove = hasPermission(session.role, "leaves:approve") && leave.status === "pending";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/leaves" className="text-sm text-stone-500 hover:text-stone-300 transition">← Leave requests</a>
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{leave.leaveTypeName}</h1>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[leave.status]}`}>
            {leave.status.toUpperCase()}
          </span>
        </div>
        <p className="text-stone-500 text-sm mt-1">Requested by {leave.memberName}</p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 mb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <InfoRow label="Employee" value={leave.memberName} />
          <InfoRow label="Email" value={leave.memberEmail} />
          <InfoRow label="Leave type" value={leave.leaveTypeName} />
          <InfoRow label="Days" value={`${leave.daysCount} working day${leave.daysCount !== 1 ? "s" : ""}`} />
          <InfoRow
            label="From"
            value={new Date(leave.fromDate).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          />
          <InfoRow
            label="To"
            value={new Date(leave.toDate).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          />
          {leave.reason && (
            <div className="col-span-2">
              <InfoRow label="Reason" value={leave.reason} />
            </div>
          )}
          <InfoRow
            label="Applied on"
            value={new Date(leave.appliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          />
          {leave.reviewerName && (
            <InfoRow label="Reviewed by" value={leave.reviewerName} />
          )}
          {leave.reviewNote && (
            <div className="col-span-2">
              <InfoRow label="Review note" value={leave.reviewNote} />
            </div>
          )}
        </div>
      </div>

      {canApprove && (
        <LeaveActions leaveId={id} />
      )}
    </div>
  );
}
