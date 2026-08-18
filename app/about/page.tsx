import type { Metadata } from "next";
import Link from "next/link";
import { Database, Code2, Sparkles, Wrench, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About Coded Mind",
  description:
    "Coded Mind builds data engineering, full-stack software, and AI solutions — and publishes a set of free browser-based developer tools. Who we are, what we build, and why the tools are free.",
  alternates: { canonical: "https://codedmind.co.in/about" },
  openGraph: {
    title: "About Coded Mind",
    description:
      "A technology company building data platforms, software, and AI — and giving away the tools we built for ourselves.",
    url: "https://codedmind.co.in/about",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Coded Mind",
  url: "https://codedmind.co.in",
  email: "hr@codedmind.co.in",
  description:
    "Coded Mind builds data engineering, full-stack software, and AI solutions, and publishes free browser-based developer tools.",
  areaServed: "Worldwide",
};

const disciplines = [
  {
    Icon: Database,
    title: "Data engineering",
    body: "Pipelines, warehouses, and reporting that keep running when nobody is watching — the unglamorous plumbing most analytics work quietly depends on.",
  },
  {
    Icon: Code2,
    title: "Software",
    body: "Web applications, internal tools, APIs, and the cloud infrastructure to run them. Product engineering end to end rather than a handover at the boundary.",
  },
  {
    Icon: Sparkles,
    title: "AI",
    body: "Document parsing, grounded assistants, and workflow automation — scoped to problems where a model genuinely beats ordinary code, and measured to prove it does.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#fcfaf6]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">About</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-950 md:text-5xl">
          We build the systems, then give away the tools.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-600">
          Coded Mind is a technology company working across data engineering,
          software development, and AI. We work remotely with clients worldwide,
          and we publish a growing set of free browser-based tools that anyone can
          use without an account.
        </p>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-stone-950">What we do</h2>
          <div className="mt-6 space-y-6">
            {disciplines.map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
                  <Icon size={16} className="text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{title}</h3>
                  <p className="mt-1 leading-relaxed text-stone-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-stone-950">Why the tools are free</h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            Most of them started as things we needed ourselves. A formatter that
            did not send data to a server. A timezone view that handled daylight
            saving properly. A resume builder that produced something an applicant
            tracking system could actually read. Once built, there was no good
            reason to charge for them.
          </p>
          <p className="mt-4 leading-relaxed text-stone-600">
            They are also the most honest sample of our work we can offer. Anyone
            weighing up whether to hire us can open a tool and judge the
            engineering directly, rather than read a case study about it.
          </p>
          <p className="mt-4 leading-relaxed text-stone-600">
            Where a tool can run entirely in your browser, it does. The PDF tools,
            the formatters, the generators — none of them upload your files or
            your text. That is a deliberate constraint, not a limitation we have
            not got around to removing.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-stone-950">How we work</h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            Every engagement starts by looking at what a client actually runs
            today — the systems, the spreadsheets, the workarounds people have
            built. Most briefs change once somebody reads the real data. From
            there we write a scope that says what we are building and what we are
            deliberately not building, and you approve it before anyone writes
            code.
          </p>
          <p className="mt-4 leading-relaxed text-stone-600">
            We build in short cycles with something working at the end of each
            one, ship with monitoring and rollback in place, and hand over with
            documentation and a walkthrough. You should be able to end an
            engagement without the system becoming a mystery.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold text-stone-950">Things we have built</h2>
          <ul className="mt-4 space-y-3 text-stone-600">
            <li className="leading-relaxed">
              <span className="font-semibold text-stone-800">An examination platform</span> —
              multi-tenant online exams with in-browser code execution, used for
              university and corporate assessment.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-stone-800">A billing engine</span> —
              GST-compliant invoicing for the Indian market, exposed through its own
              API so other products can embed it.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-stone-800">Our own HRMS</span> —
              employees, attendance, leave, payroll, and performance reviews. We run
              the company on it.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-stone-800">
                <Link href="/tools" className="text-amber-700 hover:text-amber-800">
                  A dozen free tools
                </Link>
              </span>{" "}
              — including a resume builder with AI parsing and ATS scoring.
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-amber-200/70 bg-white/80 p-7">
          <h2 className="flex items-center gap-2 text-lg font-bold text-stone-950">
            <Mail size={17} className="text-amber-700" /> Get in touch
          </h2>
          <p className="mt-3 leading-relaxed text-stone-600">
            Working on something in data, software, or AI? Email{" "}
            <a href="mailto:hr@codedmind.co.in" className="font-medium text-amber-700 hover:text-amber-800">
              hr@codedmind.co.in
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="font-medium text-amber-700 hover:text-amber-800">
              contact form
            </Link>
            . We reply within 1–2 business days.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/services" className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700">
              Our services
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400">
              <Wrench size={14} /> Free tools
            </Link>
            <Link href="/careers" className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400">
              Careers
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
