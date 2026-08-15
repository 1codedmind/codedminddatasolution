import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cloud,
  Users,
  Smartphone,
  Layers,
  GitBranch,
  ShieldCheck,
  Gauge,
  Boxes,
  Workflow,
  LineChart,
  Headset,
} from "lucide-react";

import CTA from "@/sections/CTA";

export const metadata: Metadata = {
  title: "IT Services — Software Development, Cloud & DevOps, Consulting",
  description:
    "Custom software and app development, cloud migration and DevOps, and IT consulting or staff augmentation. Senior engineers, fixed scope or dedicated team, delivered remotely worldwide.",
  keywords: [
    "custom software development",
    "web application development",
    "mobile app development",
    "cloud migration services",
    "DevOps consulting",
    "CI/CD pipeline setup",
    "Kubernetes consulting",
    "IT staff augmentation",
    "IT consulting services",
    "dedicated development team",
  ],
  alternates: { canonical: "https://codedmind.co.in/it-services" },
  openGraph: {
    title: "IT Services — Coded Mind",
    description:
      "Custom software, cloud and DevOps, and consulting or staff augmentation — senior engineers, delivered remotely.",
    url: "https://codedmind.co.in/it-services",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Information Technology Services",
  provider: {
    "@type": "Organization",
    name: "Coded Mind",
    url: "https://codedmind.co.in",
    email: "hr@codedmind.co.in",
  },
  areaServed: "Worldwide",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "IT services",
    itemListElement: [
      "Custom Software & Application Development",
      "Cloud & DevOps Engineering",
      "IT Consulting & Staff Augmentation",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

const pillars = [
  {
    Icon: Code2,
    title: "Custom Software & App Development",
    lead: "Products built to fit how your team actually works, not how a SaaS vendor assumed it does.",
    accent: "#F59E0B",
    points: [
      { Icon: Layers, text: "Web applications and internal tools — dashboards, portals, admin systems" },
      { Icon: Smartphone, text: "Mobile and responsive front-ends built to work on the devices your users have" },
      { Icon: Workflow, text: "APIs and integrations that connect the systems you already run" },
      { Icon: Boxes, text: "Legacy modernisation — replacing spreadsheets and ageing tools without a big-bang rewrite" },
    ],
    proof:
      "We build and run our own products this way: a multi-tenant examination platform with in-browser code execution, and a GST-compliant billing engine used through its own API.",
  },
  {
    Icon: Cloud,
    title: "Cloud & DevOps",
    lead: "Infrastructure that deploys predictably, scales when it needs to, and doesn't quietly drain your budget.",
    accent: "#3B82F6",
    points: [
      { Icon: GitBranch, text: "CI/CD pipelines so releases are routine rather than an event" },
      { Icon: Boxes, text: "Cloud migration and architecture on AWS, GCP, or Azure" },
      { Icon: Layers, text: "Infrastructure as code with Terraform, and container orchestration on Kubernetes" },
      { Icon: Gauge, text: "Monitoring, alerting, and cost optimisation — so you find out before your customers do" },
    ],
    proof:
      "Every engagement leaves you with infrastructure defined in code and a documented path to run it yourself.",
  },
  {
    Icon: Users,
    title: "IT Consulting & Staff Augmentation",
    lead: "Senior engineers embedded in your team, or an outside read on a decision you only get to make once.",
    accent: "#10B981",
    points: [
      { Icon: ShieldCheck, text: "Architecture and code reviews before a build gets expensive to change" },
      { Icon: Users, text: "Dedicated engineers working inside your stand-ups, tools, and sprint cadence" },
      { Icon: LineChart, text: "Technology selection and roadmap planning grounded in what you already run" },
      { Icon: Headset, text: "Handover and enablement, so your team owns the system when we step back" },
    ],
    proof:
      "Engagements are scoped monthly and either side can end them with 30 days' notice. No long lock-ins.",
  },
];

const engagementModels = [
  {
    title: "Fixed scope",
    body: "A defined deliverable, a fixed price, and an agreed date. Best when the requirements are clear and the boundary is real.",
  },
  {
    title: "Dedicated team",
    body: "One or more engineers working only on your roadmap, billed monthly. Best for continuing product work with shifting priorities.",
  },
  {
    title: "Advisory retainer",
    body: "A set number of hours each month for reviews, architecture calls, and unblocking. Best when you have a team and need senior judgement.",
  },
];

const stack = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "PostgreSQL",
  "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform",
  "GitHub Actions", "Redis", "REST & GraphQL APIs",
];

export default function ITServicesPage() {
  return (
    <main className="bg-stone-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <section className="border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            IT Services
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] max-w-3xl">
            Engineering teams that ship, without the hiring cycle.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-400">
            Software built to your requirements, cloud infrastructure that behaves,
            and senior engineers who can join your team next week. Remote-first, and
            the same people who build our own products.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C87660] text-white text-sm font-semibold hover:bg-[#b5664f] transition-colors"
            >
              Discuss your project <ArrowRight size={15} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-stone-700 text-stone-300 text-sm font-semibold hover:border-stone-600 hover:text-white transition-colors"
            >
              Data services
            </Link>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-6">
          {pillars.map(({ Icon, title, lead, accent, points, proof }) => (
            <article
              key={title}
              className="rounded-2xl border border-stone-800 bg-stone-900 p-8 lg:p-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}
                  >
                    <Icon size={19} style={{ color: accent }} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                  <p className="mt-3 text-stone-400 leading-relaxed">{lead}</p>
                </div>

                <div className="lg:col-span-7">
                  <ul className="space-y-3.5">
                    {points.map(({ Icon: PointIcon, text }) => (
                      <li key={text} className="flex items-start gap-3">
                        <PointIcon size={15} className="mt-0.5 shrink-0 text-stone-500" />
                        <span className="text-sm leading-relaxed text-stone-300">{text}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 pt-5 border-t border-stone-800 text-sm leading-relaxed text-stone-500">
                    {proof}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Engagement models */}
      <section className="border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            How we work together
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl">
            Three ways to engage.
          </h2>
          <p className="mt-4 max-w-2xl text-stone-400 leading-relaxed">
            Pick the one that matches how well-defined the work is. We&apos;ll tell you
            honestly if you&apos;ve picked the wrong one.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {engagementModels.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-stone-800 bg-stone-900 p-7"
              >
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
            What we build with
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl">
            Boring technology, chosen on purpose.
          </h2>
          <p className="mt-4 max-w-2xl text-stone-400 leading-relaxed">
            We favour tools with long support horizons and large hiring pools, so the
            system stays maintainable after we hand it over.
          </p>

          <ul className="mt-10 flex flex-wrap gap-2.5">
            {stack.map((tech) => (
              <li
                key={tech}
                className="rounded-lg border border-stone-800 bg-stone-900 px-3.5 py-2 text-sm text-stone-400"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTA />
    </main>
  );
}
