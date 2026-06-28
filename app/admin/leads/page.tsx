import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { getLeads, getLeadCount, getLeadsThisMonth } from "@/lib/leads";
import { hasDatabaseUrl } from "@/lib/db";
import LeadsClient from "./LeadsClient";

export const metadata = { title: "Leads — Admin", robots: "noindex, nofollow" };

export default async function LeadsPage() {
  const session = await getCurrentSession();

  if (!session || !["superadmin", "admin"].includes(session.role)) {
    redirect("/login");
  }

  if (!hasDatabaseUrl()) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-1">Database not configured</p>
          <p className="text-stone-600 text-xs">Set DATABASE_URL in your environment variables.</p>
        </div>
      </div>
    );
  }

  const [leads, count, thisMonth] = await Promise.all([
    getLeads(500),
    getLeadCount(),
    getLeadsThisMonth(),
  ]);

  return <LeadsClient leads={leads} count={count} thisMonth={thisMonth} />;
}
