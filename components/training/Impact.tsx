"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Impact, shown as a shift rather than a statistic.
 *
 * The honest version of "impact" for a training page is what a team can do
 * afterwards that it could not do before. We do not publish placement rates or
 * satisfaction scores, because we would be making them up — a concrete
 * before/after is both more useful to a buyer and actually true.
 */
const SHIFTS = [
  {
    before: "Reports rebuilt by hand every month",
    after: "Scheduled pipelines that run, test and alert themselves",
  },
  {
    before: "Nobody can explain why two dashboards disagree",
    after: "Tested transformations with lineage you can point at",
  },
  {
    before: "One person is the only one who can fix the pipeline",
    after: "Runbooks and code the whole team can operate",
  },
  {
    before: "Analysis that falls apart under a hard question",
    after: "Stated assumptions, quantified uncertainty, a defensible answer",
  },
  {
    before: "AI features that demo well and fail with real users",
    after: "Grounded retrieval with an evaluation set behind every change",
  },
  {
    before: "A cloud bill nobody can account for",
    after: "Costs traced to the queries and jobs causing them",
  },
];

export default function Impact() {
  const reduced = useReducedMotion();

  return (
    <section id="impact" className="scroll-mt-20 border-y border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
            The impact
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
            What should be different afterwards.
          </h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            Training is only worth the time it costs if something changes. These
            are the shifts the courses are built to produce — stated as
            capabilities you can check for, not scores we would have to invent.
          </p>
        </motion.div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-12 grid grid-cols-1 gap-3 lg:grid-cols-2"
        >
          {SHIFTS.map(({ before, after }) => (
            <motion.li
              key={before}
              variants={{
                hidden: { opacity: 0, y: reduced ? 0 : 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
              }}
              className="group grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-stone-200 bg-white sm:grid-cols-[1fr_auto_1fr]"
            >
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                  Before
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{before}</p>
              </div>

              <div className="flex items-center justify-center border-stone-200 px-3 py-2 sm:border-x sm:py-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 transition-colors group-hover:bg-emerald-50">
                  <ArrowRight
                    size={14}
                    className="text-stone-400 transition-colors group-hover:text-emerald-600"
                  />
                </span>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  After
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-stone-800">
                  {after}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
