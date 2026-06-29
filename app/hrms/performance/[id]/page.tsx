import { redirect, notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";
import { getPerformanceReview } from "@/lib/hrms/performance";
import AcknowledgeButton from "./AcknowledgeButton";
import Link from "next/link";

export const metadata = { title: "Performance Review — HRMS" };

const STATUS_STYLE: Record<string, string> = {
  submitted:    "bg-amber-500/15 text-amber-400",
  acknowledged: "bg-emerald-500/15 text-emerald-400",
  draft:        "bg-stone-800 text-stone-500",
};

const RATING_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Below expectations",
  3: "Meets expectations",
  4: "Exceeds expectations",
  5: "Outstanding",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
      <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">{title}</h2>
      <div className="text-sm text-stone-300 whitespace-pre-wrap leading-relaxed">{children}</div>
    </div>
  );
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const review = await getPerformanceReview(id);
  if (!review) notFound();

  const isManager = hasPermission(session.role, "performance:manage");
  const isSelf = review.memberId === session.sub;

  if (!isManager && !isSelf) redirect("/hrms/performance");

  const canAcknowledge = isSelf && review.status === "submitted";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/hrms/performance" className="text-sm text-stone-500 hover:text-stone-300 transition">← Performance</a>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{review.period}</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {review.memberName} · Reviewed by {review.reviewerName ?? "—"}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLE[review.status] ?? "bg-stone-800 text-stone-400"}`}>
            {review.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Rating */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex items-center gap-6">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Rating</p>
            {review.rating ? (
              <>
                <p className="text-3xl font-extrabold text-yellow-400">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                <p className="text-xs text-stone-500 mt-0.5">{RATING_LABELS[review.rating]}</p>
              </>
            ) : (
              <p className="text-stone-600 text-sm">No rating given</p>
            )}
          </div>
          {review.reviewedAt && (
            <div className="ml-auto text-right">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Reviewed</p>
              <p className="text-sm text-stone-400">
                {new Date(review.reviewedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        {review.strengths && (
          <Section title="Strengths">{review.strengths}</Section>
        )}
        {review.areasForImprovement && (
          <Section title="Areas for improvement">{review.areasForImprovement}</Section>
        )}
        {review.goalsNextPeriod && (
          <Section title="Goals for next period">{review.goalsNextPeriod}</Section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canAcknowledge && <AcknowledgeButton reviewId={review.id} />}
          {isManager && (
            <Link
              href={`/hrms/performance/new`}
              className="px-4 py-2.5 text-sm font-medium text-stone-400 bg-stone-800 border border-stone-700 rounded-xl hover:text-white transition-colors"
            >
              New review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
