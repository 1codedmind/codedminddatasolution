"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Hammer, GraduationCap, GitBranch, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Reason = {
  Icon: LucideIcon;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

/**
 * Three of the four link to something live on this domain. That is the whole
 * argument: we are not asserting experience, we are pointing at it.
 */
const REASONS: Reason[] = [
  {
    Icon: Hammer,
    title: "Working engineers teach it",
    body: "The people running sessions spend the rest of the week building this for clients.",
    href: "/services",
    linkLabel: "What we build",
  },
  {
    Icon: GitBranch,
    title: "Real systems, not toy data",
    body: "Late-arriving rows, schemas that change without warning, models that flatter themselves.",
  },
  {
    Icon: GraduationCap,
    title: "Assessed on our own platform",
    body: "Coding and MCQ assessments that run in the browser, with per-topic analytics.",
    href: "/exams/preview",
    linkLabel: "Try the exam portal",
  },
  {
    Icon: Package,
    title: "You keep what you build",
    body: "Notebooks, pipelines, project code and written material are yours at the end.",
    href: "/tools",
    linkLabel: "See our free tools",
  },
];

export default function WhyTraining() {
  const reduced = useReducedMotion();

  return (
    <section className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Why us
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
            We teach it because we ship it.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {REASONS.map(({ Icon, title, body, href, linkLabel }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: reduced ? 0 : 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
              }}
              className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6"
            >
              <Icon size={18} className="text-[#C87660]" />
              <h3 className="mt-4 text-[15px] font-bold text-stone-950">{title}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-600">{body}</p>
              {href && (
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition-colors hover:text-stone-900"
                >
                  {linkLabel}
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
