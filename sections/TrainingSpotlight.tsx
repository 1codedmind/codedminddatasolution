"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, Database, BrainCircuit, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Track = {
  Icon: LucideIcon;
  name: string;
  line: string;
  topics: string[];
  accent: string;
  href: string;
};

const TRACKS: Track[] = [
  {
    Icon: BarChart3,
    name: "Data Science",
    line: "From an ambiguous question to an analysis that holds up under scrutiny.",
    topics: ["Python & pandas", "Statistics", "Modelling", "Communicating results"],
    accent: "#10B981",
    href: "/training#data-science",
  },
  {
    Icon: Database,
    name: "Data Engineering",
    line: "Pipelines and warehouses that fail loudly instead of quietly.",
    topics: ["Advanced SQL", "Airflow", "dbt", "Quality & cost"],
    accent: "#3B82F6",
    href: "/training#data-engineering",
  },
  {
    Icon: BrainCircuit,
    name: "AI & Machine Learning",
    line: "AI features that survive real users, not just a demo.",
    topics: ["LLM behaviour", "RAG", "Evaluation", "Safeguards"],
    accent: "#A855F7",
    href: "/training#ai",
  },
];

/**
 * Training on the landing page.
 *
 * Sits dark between the exam portal and the tools rail, breaking up three
 * consecutive light sections. The training page itself is light — a curriculum
 * is too much sustained reading for a dark background — so this section is a
 * contrast band on the landing page rather than a preview of that page.
 */
export default function TrainingSpotlight() {
  const reduced = useReducedMotion();

  return (
    <section
      id="training"
      className="scroll-mt-20 overflow-hidden border-b border-stone-900 bg-stone-950"
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
            <Users size={12} />
            TRAINING
          </div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            We also train the teams
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              who build this themselves.
            </span>
          </h2>
          <p className="mt-5 leading-relaxed text-stone-400">
            Data science, data engineering, and AI — taught by the engineers who
            do this for clients the rest of the week, using the same stack. For a
            whole team, or for one person changing direction.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {TRACKS.map(({ Icon, name, line, topics, accent, href }) => (
            <motion.div
              key={name}
              variants={{
                hidden: { opacity: 0, y: reduced ? 0 : 22 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
            >
              <Link
                href={href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/40 p-7 transition-colors hover:border-stone-700"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: accent }}
                />

                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${accent}1a`, border: `1px solid ${accent}40` }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>

                <h3 className="relative mt-5 text-lg font-bold text-white">{name}</h3>
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-stone-400">
                  {line}
                </p>

                <div className="relative mt-6 flex flex-wrap gap-1.5 border-t border-stone-800 pt-5">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg border border-stone-800 px-2.5 py-1 text-[11px] text-stone-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <span className="relative mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 transition-colors group-hover:text-white">
                  See the curriculum
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-stone-800 bg-stone-900/40 p-7 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-base font-bold text-white">
              Upskilling a team, or starting from scratch?
            </p>
            <p className="mt-1.5 text-sm text-stone-400">
              Length and depth are scoped with you — not sold as a fixed course.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/training"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#C87660] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b5664f]"
            >
              Explore training
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-300 transition-colors hover:border-stone-600 hover:text-white"
            >
              Talk to us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
