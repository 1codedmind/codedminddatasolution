import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin } from "@/lib/hrms/access";
import { listLeaves } from "@/lib/hrms/leaves";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Leaves — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-400",
  approved:  "bg-emerald-500/15 text-emerald-400",
  rejected:  "bg-red-500/15 text-red-400",
  cancelled: "bg-stone-800 text-stone-500",
};

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; member?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { status = "", member = "" } = await searchParams;
  const isAdmin = isHrmsAdmin(session.role);

  const allLeaves = await listLeaves(isAdmin ? undefined : session.sub);

  const filtered = allLeaves.filter((l) => {
    const matchStatus = !status || l.status === status;
    const matchMember = !member || l.memberId === member;
    return matchStatus && matchMember;
  });

  const pendingCount = allLeaves.filter((l) => l.status === "pending").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Leave requests</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {isAdmin
              ? `${allLeaves.length} total · ${pendingCount} pending`
              : `${allLeaves.length} requests`}
          </p>
        </div>
        <Link
          href="/hrms/leaves/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
        >
          <Plus size={14} /> Apply for leave
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5">
        {["", "pending", "approved", "rejected"].map((s) => (
          <Link
            key={s}
            href={`/hrms/leaves${s ? `?status=${s}` : ""}`}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              status === s
                ? "bg-[#C87660] text-white"
                : "bg-stone-800 text-stone-400 hover:text-white"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800">
              {isAdmin && <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Employee</th>}
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Type</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden sm:table-cell">Duration</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden md:table-cell">Days</th>
              <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
              <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden lg:table-cell">Applied</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-stone-600 text-sm">
                  No leave requests found.
                </td>
              </tr>
            )}
            {filtered.map((leave) => (
              <tr key={leave.id} className="border-b border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                {isAdmin && (
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{leave.memberName}</p>
                    <p className="text-[11px] text-stone-600">{leave.memberEmail}</p>
                  </td>
                )}
                <td className="px-5 py-3.5 text-stone-300">{leave.leaveTypeName}</td>
                <td className="px-5 py-3.5 text-stone-400 text-xs hidden sm:table-cell whitespace-nowrap">
                  {new Date(leave.fromDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  {" – "}
                  {new Date(leave.toDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-stone-400 text-xs hidden md:table-cell">
                  {leave.daysCount}d
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[leave.status] ?? "bg-stone-800 text-stone-400"}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-stone-600 text-xs text-right hidden lg:table-cell">
                  {new Date(leave.appliedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/hrms/leaves/${leave.id}`} className="text-xs text-stone-500 hover:text-[#C87660] transition-colors font-medium">
                    {isAdmin && leave.status === "pending" ? "Review →" : "View →"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
