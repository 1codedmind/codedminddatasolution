import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";

export const metadata = { title: "Announcements — HRMS" };

export default async function AnnouncementsPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "announcements:read")) redirect("/hrms/dashboard");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Announcements</h1>
        <p className="text-stone-500 text-sm mt-0.5">Company-wide and department updates.</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
        <p className="text-stone-500 text-sm">Announcements coming soon.</p>
        <p className="text-stone-600 text-xs mt-2">Will support company-wide posts, department targeting, and pinning.</p>
      </div>
    </div>
  );
}
