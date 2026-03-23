import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Sparkles } from "lucide-react";
import { jobOpenings } from "@/data/jobOpenings";

const featuredOpening = jobOpenings[0];

export default function CareersPage() {
  return (
    <main className="bg-[#fcfaf6]">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-amber-800">
              <Sparkles size={14} />
              Careers at Coded Mind
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-stone-950 md:text-6xl">
              Join Us in Building Scalable Data Systems
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
              This page is structured to grow with us. As new roles open up,
              they can be added here and each one gets its own dedicated detail
              and application page.
            </p>
            {featuredOpening ? (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/careers/${featuredOpening.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  View Current Opening
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="mailto:hr@codedmind.co.in?subject=Careers%20Inquiry"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  Contact HR
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Open Roles
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-950">
              Current and Future Openings
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              We&apos;re building a team of curious problem-solvers across data
              and engineering.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {jobOpenings.map((job) => (
              <article
                key={job.slug}
                className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                  <BriefcaseBusiness size={14} />
                  {job.eyebrow}
                </div>
                <h3 className="text-2xl font-bold text-stone-950">
                  {job.title}
                </h3>
                <p className="mt-4 flex-1 leading-relaxed text-stone-600">
                  {job.summary}
                </p>
                <div className="mt-6 space-y-3 rounded-2xl bg-stone-50 p-4">
                  {job.details.slice(0, 3).map((detail) => (
                    <div key={detail.label}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-sm text-stone-800">
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/careers/${job.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
                >
                  View Role Details
                  <ArrowRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
