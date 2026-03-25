import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChartColumnIncreasing,
  CircleUserRound,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

import LogoutButton from "@/components/auth/LogoutButton";
import { getCurrentSession } from "@/lib/auth/session";
import { loadAssessmentChallenges } from "@/data/loadAssessmentChallenges";
import { jobOpenings } from "@/data/jobOpenings";
import { findCandidateById } from "@/lib/auth/users";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function CandidatePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const candidate = await findCandidateById(session.sub);

  if (!candidate) {
    redirect("/login");
  }

  const assessments = loadAssessmentChallenges();
  const pythonAssessments = assessments.filter(
    (assessment) => assessment.category === "python"
  ).length;
  const sqlAssessments = assessments.length - pythonAssessments;
  const featuredRole = jobOpenings[0];

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-[#fcfaf6] py-16">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl shadow-stone-900/5">
          <div className="bg-[linear-gradient(135deg,#fff6e8_0%,#fcfaf6_45%,#eef7f0_100%)] p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                  Candidate Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Welcome back, {candidate.fullName.split(" ")[0]}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600">
                  Your candidate workspace brings together profile details,
                  assessments, and current opportunities in one place so you can
                  move through the process faster.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/assessments"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Start Assessment
                  <ArrowRight size={16} />
                </Link>
                <LogoutButton />
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-slate-900">
                  <CircleUserRound size={16} />
                  <p className="text-sm font-semibold">Profile Status</p>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">Active</p>
                <p className="mt-2 text-sm text-stone-600">Candidate account ready to use</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-slate-900">
                  <ClipboardList size={16} />
                  <p className="text-sm font-semibold">Assessments</p>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{assessments.length}</p>
                <p className="mt-2 text-sm text-stone-600">Practice tracks available now</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-slate-900">
                  <BriefcaseBusiness size={16} />
                  <p className="text-sm font-semibold">Open Roles</p>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">{jobOpenings.length}</p>
                <p className="mt-2 text-sm text-stone-600">Current opportunities to explore</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-slate-900">
                  <CalendarDays size={16} />
                  <p className="text-sm font-semibold">Joined</p>
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatDate(candidate.createdAt)}
                </p>
                <p className="mt-2 text-sm text-stone-600">Account creation date</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Quick Actions
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Link
                    href="/candidate/profile"
                    className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 text-slate-900">
                      <CircleUserRound size={18} />
                      <p className="text-sm font-semibold">Profile Details</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      Review your name, email, and account status.
                    </p>
                  </Link>
                  <Link
                    href="/assessments"
                    className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 text-slate-900">
                      <ClipboardList size={18} />
                      <p className="text-sm font-semibold">Go to Assessments</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      Practice Python and SQL questions in the browser.
                    </p>
                  </Link>
                  <Link
                    href="/careers"
                    className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 text-slate-900">
                      <BriefcaseBusiness size={18} />
                      <p className="text-sm font-semibold">Explore Open Roles</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      Review current openings and role requirements.
                    </p>
                  </Link>
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center gap-3 text-emerald-900">
                      <ShieldCheck size={18} />
                      <p className="text-sm font-semibold">Secure Session</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-emerald-800">
                      Your session is protected with signed HTTP-only cookies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Assessment Overview
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Total Tracks</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{assessments.length}</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">Python</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{pythonAssessments}</p>
                  </div>
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <p className="text-sm font-semibold text-slate-900">SQL</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">{sqlAssessments}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {assessments.map((assessment) => (
                    <div
                      key={assessment.slug}
                      className="flex flex-col gap-2 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {assessment.title}
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          {assessment.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                          {assessment.category}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                          {assessment.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-stone-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Candidate Snapshot
                </p>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Full Name
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {candidate.fullName}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Email
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {candidate.email}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Account Role
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Candidate
                    </p>
                  </div>
                </div>
              </div>

              {featuredRole ? (
                <div className="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Featured Opportunity
                  </p>
                  <h2 className="mt-3 text-2xl font-bold">{featuredRole.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">
                    {featuredRole.summary}
                  </p>
                  <div className="mt-5 space-y-2">
                    {featuredRole.details.slice(0, 3).map((detail) => (
                      <div
                        key={detail.label}
                        className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                      >
                        <p className="text-sm text-stone-300">{detail.label}</p>
                        <p className="text-sm font-semibold text-white">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/careers/${featuredRole.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
                  >
                    View Role
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ) : null}

              <div className="rounded-3xl border border-stone-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  Progress Checklist
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    "Account created successfully",
                    "Profile details available",
                    "Assessment workspace ready",
                    "Career opportunities available",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl bg-stone-50 px-4 py-4"
                    >
                      <BadgeCheck size={18} className="mt-0.5 text-emerald-600" />
                      <p className="text-sm text-stone-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                  What To Do Next
                </p>
                <div className="mt-5 rounded-3xl bg-[linear-gradient(135deg,#fff4dd_0%,#f8f5ef_100%)] p-5">
                  <div className="flex items-center gap-3 text-slate-900">
                    <ChartColumnIncreasing size={18} />
                    <p className="text-sm font-semibold">Recommended next step</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">
                    Start with the assessment workspace, then review the featured
                    role requirements so you can align your answers and profile.
                  </p>
                  <Link
                    href="/assessments"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900"
                  >
                    Open assessments
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
