import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";

import { getCurrentSession } from "@/lib/auth/session";
import { findCandidateById } from "@/lib/auth/users";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CandidateProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const candidate = await findCandidateById(session.sub);

  if (!candidate) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-[#fcfaf6] py-16">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl shadow-stone-900/5">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Profile Details
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {candidate.fullName}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
                Your account details are shown below. This page can be extended next
                with resume uploads, experience, skills, and application history.
              </p>
            </div>
            <Link
              href="/candidate"
              className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center gap-3 text-slate-900">
                <UserRound size={18} />
                <p className="text-sm font-semibold">Full Name</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{candidate.fullName}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center gap-3 text-slate-900">
                <Mail size={18} />
                <p className="text-sm font-semibold">Email</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{candidate.email}</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center gap-3 text-slate-900">
                <ShieldCheck size={18} />
                <p className="text-sm font-semibold">Role</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">Candidate</p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
              <div className="flex items-center gap-3 text-slate-900">
                <CalendarDays size={18} />
                <p className="text-sm font-semibold">Joined</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {formatDate(candidate.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
