import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/hrms/access";

export const metadata = { title: "Assets — HRMS" };

export default async function AssetsPage() {
  const session = await getCurrentSession();
  if (!session || !hasPermission(session.role, "assets:read")) redirect("/hrms/dashboard");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Assets</h1>
        <p className="text-stone-500 text-sm mt-0.5">Laptops, phones, and other company equipment.</p>
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
        <p className="text-stone-500 text-sm">Asset management coming soon.</p>
        <p className="text-stone-600 text-xs mt-2">Will include inventory, assignment tracking, warranty dates, and repair logs.</p>
      </div>
    </div>
  );
}
