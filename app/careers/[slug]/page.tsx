import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Cloud,
  Database,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import CareerApplicationForm from "@/components/CareerApplicationForm";
import { getJobOpening, jobOpenings } from "@/data/jobOpenings";

type CareerRolePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return jobOpenings.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({
  params,
}: CareerRolePageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobOpening(slug);

  if (!job) {
    return {
      title: "Career Opening Not Found",
    };
  }

  return {
    title: `${job.title} | Careers`,
    description: job.summary,
  };
}

export default async function CareerRolePage({
  params,
}: CareerRolePageProps) {
  const { slug } = await params;
  const job = getJobOpening(slug);

  if (!job) {
    notFound();
  }

  return (
    <main className="bg-[#fcfaf6]">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <Link
            href="/careers"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 transition hover:text-stone-950"
          >
            <ArrowLeft size={16} />
            Back to all openings
          </Link>

          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-amber-800">
              <Sparkles size={14} />
              {job.eyebrow}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-950 md:text-6xl">
              {job.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              {job.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
              >
                Apply Now
                <ArrowRight size={15} />
              </a>
              <a
                href="mailto:hr@codedmind.co.in?subject=Careers%20Inquiry"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50"
              >
                Contact HR
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="space-y-8">
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Overview
                  </p>
                  <h2 className="text-2xl font-bold text-stone-950">
                    What You&apos;ll Work On
                  </h2>
                </div>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                {job.overview}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Key Responsibilities
                  </p>
                  <h2 className="text-2xl font-bold text-stone-950">
                    Day-to-Day Scope
                  </h2>
                </div>
              </div>
              <ul className="space-y-3 text-stone-600">
                {job.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-stone-50 px-4 py-3 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <Cloud size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                    Required Skills
                  </p>
                  <h2 className="text-2xl font-bold text-stone-950">
                    What We&apos;re Looking For
                  </h2>
                </div>
              </div>
              <ul className="space-y-3 text-stone-600">
                {job.requiredSkills.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl bg-stone-50 px-4 py-3 leading-relaxed"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-stone-200 bg-stone-900 p-8 text-stone-100 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-300">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Role Details
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    Quick Snapshot
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {job.details.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-stone-700 bg-stone-800/60 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-100">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Who Should Apply
                  </p>
                  <h2 className="text-2xl font-bold text-stone-950">
                    Ideal Candidate
                  </h2>
                </div>
              </div>
              <p className="text-base leading-relaxed text-stone-600">
                {job.idealCandidate}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="apply"
        className="border-t border-stone-200 bg-stone-100/70 py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Apply For This Role
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
              Send Your Application by Email
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              Fill in the required details below. When you submit, your default
              email app will open with your application details pre-filled so
              you can attach your resume and send it to the HR team.
            </p>
          </div>

          <CareerApplicationForm roleTitle={job.title} />
        </div>
      </section>
    </main>
  );
}
