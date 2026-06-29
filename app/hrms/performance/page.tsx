import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isHrmsUser } from "@/lib/hrms/access";

export const metadata = { title: "Performance — HRMS" };

export default async function PerformancePage() {
  const session = await getCurrentSession();
  if (!session || !isHrmsUser(session.role)) redirect("/login");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Performance</h1>
        <p className="text-stone-500 text-sm mt-0.5">Reviews, ratings, and goals.</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
        <p className="text-stone-500 text-sm">Performance reviews coming soon.</p>
        <p className="text-stone-600 text-xs mt-2">Will include quarterly/annual reviews, ratings (1–5), strengths, improvement areas, and next-period goals.</p>
      </div>
    </div>
  );
}
