import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission, isHrmsAdmin, isHrmsUser } from "@/lib/hrms/access";
import { listPerformanceReviews } from "@/lib/hrms/performance";
import Link from "next/link";
import { Plus, TrendingUp } from "lucide-react";

export const metadata = { title: "Performance — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  submitted:    "bg-amber-500/15 text-amber-400",
  acknowledged: "bg-emerald-500/15 text-emerald-400",
  draft:        "bg-stone-800 text-stone-500",
};

const STARS = (rating: number | null) => {
  if (!rating) return <span className="text-stone-700">—</span>;
  return (
    <span className="text-yellow-400 font-mono text-xs">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
};

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!isHrmsUser(session.role)) redirect("/");

  const { status = "" } = await searchParams;
  const isAdmin = isHrmsAdmin(session.role);

  const reviews = await listPerformanceReviews({
    memberId: isAdmin ? undefined : session.sub,
    status: status || undefined,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Performance</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>
        {hasPermission(session.role, "performance:manage") && (
          <Link
            href="/hrms/performance/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-semibold rounded-xl hover:bg-[#b5644e] transition-colors"
          >
            <Plus size={14} /> New review
          </Link>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {["", "submitted", "acknowledged"].map((s) => (
          <Link
            key={s}
            href={`/hrms/performance${s ? `?status=${s}` : ""}`}
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

      {reviews.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
          <TrendingUp size={32} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-600 text-sm">No performance reviews yet.</p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                {isAdmin && (
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Employee</th>
                )}
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Period</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest hidden md:table-cell">Reviewer</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Rating</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-stone-500 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-stone-800/60 hover:bg-stone-800/30 transition-colors">
                  {isAdmin && (
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{r.memberName}</p>
                      <p className="text-[11px] text-stone-600">{r.memberEmail}</p>
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-stone-300 font-medium">{r.period}</td>
                  <td className="px-5 py-3.5 text-stone-500 text-xs hidden md:table-cell">{r.reviewerName ?? "—"}</td>
                  <td className="px-5 py-3.5">{STARS(r.rating)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[r.status] ?? "bg-stone-800 text-stone-400"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/hrms/performance/${r.id}`} className="text-xs text-stone-500 hover:text-[#C87660] transition-colors font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
