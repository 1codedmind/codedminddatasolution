import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { hasDatabaseUrl } from "@/lib/db";
import { getAllPageAnalytics } from "@/lib/tools/visitors";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Page analytics — Admin", robots: "noindex, nofollow" };

export default async function AnalyticsPage() {
  const session = await getCurrentSession();

  if (!session || !["superadmin", "admin"].includes(session.role)) {
    redirect("/login");
  }

  if (!hasDatabaseUrl()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-950">
        <div className="text-center">
          <p className="mb-1 text-sm font-medium text-red-400">Database not configured</p>
          <p className="text-xs text-stone-600">Set DATABASE_URL in your environment variables.</p>
        </div>
      </div>
    );
  }

  const pages = await getAllPageAnalytics(30);

  return <AnalyticsClient pages={pages} />;
}
