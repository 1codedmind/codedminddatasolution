import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLeads, getLeadCount, getLeadsThisMonth } from "@/lib/leads";
import { hasDatabaseUrl } from "@/lib/db";
import LeadsClient from "./LeadsClient";

async function loginAction(formData: FormData) {
  "use server";
  const key = formData.get("key") as string;
  if (process.env.ADMIN_KEY && key === process.env.ADMIN_KEY) {
    const cookieStore = await cookies();
    cookieStore.set("cm_admin", key, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  redirect("/admin/leads");
}

async function logoutAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("cm_admin");
  redirect("/admin/leads");
}

export const metadata = { title: "Leads — Admin", robots: "noindex, nofollow" };

export default async function LeadsPage() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("cm_admin")?.value;
  const ADMIN_KEY = process.env.ADMIN_KEY;
  const isAuthed = Boolean(ADMIN_KEY && adminCookie === ADMIN_KEY);

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* Logo mark */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <svg width="22" height="22" viewBox="0 0 180 180" fill="none" aria-hidden="true">
              <polygon points="90,8 125,43 90,78 55,43"      stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
              <polygon points="90,102 125,137 90,172 55,137"  stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
              <polygon points="8,90 43,55 78,90 43,125"       stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="miter"/>
              <polygon points="102,90 137,55 172,90 137,125"  stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="miter"/>
            </svg>
            <span className="text-sm font-bold tracking-tight">
              <span className="text-white">CODED</span>
              <span className="text-[#C87660]"> MIND</span>
            </span>
          </div>

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
            <p className="text-white font-semibold mb-1">Admin access</p>
            <p className="text-stone-400 text-sm mb-6">Enter your admin key to view leads.</p>
            <form action={loginAction} className="space-y-4">
              <input
                type="password"
                name="key"
                placeholder="Admin key"
                required
                autoFocus
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] focus:ring-1 focus:ring-[#C87660] transition-colors"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#C87660] text-white text-sm font-semibold hover:bg-[#b5664f] transition-colors"
              >
                Access dashboard
              </button>
            </form>
          </div>
          <p className="text-center text-xs text-stone-700 mt-4">
            Set <code className="text-stone-500">ADMIN_KEY</code> in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  if (!hasDatabaseUrl()) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-1">Database not configured</p>
          <p className="text-stone-600 text-xs">Set <code>DATABASE_URL</code> in your environment variables.</p>
        </div>
      </div>
    );
  }

  const [leads, count, thisMonth] = await Promise.all([
    getLeads(500),
    getLeadCount(),
    getLeadsThisMonth(),
  ]);

  return (
    <div>
      {/* Logout bar */}
      <div className="bg-stone-950 border-b border-stone-800 px-6 py-2 flex items-center justify-between">
        <p className="text-xs text-stone-600">Coded Mind Admin</p>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            Log out
          </button>
        </form>
      </div>
      <LeadsClient leads={leads} count={count} thisMonth={thisMonth} />
    </div>
  );
}
