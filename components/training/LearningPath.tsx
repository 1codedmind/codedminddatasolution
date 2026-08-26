"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Database, BarChart3, BrainCircuit, FileStack } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Stage = {
  id: string;
  Icon: LucideIcon;
  /** The work, not the course. */
  stage: string;
  detail: string;
  /** Null for the source node, which is not something we teach. */
  course: string | null;
  href?: string;
  accent: string;
};

/**
 * Where each course sits in the real lifecycle of a data product.
 *
 * This exists because three courses listed side by side read as three
 * unrelated products. Laid out as one flow — raw data becomes pipelines,
 * pipelines feed models, models ship as features — it becomes obvious why a
 * team might want one, two, or all three, and which one covers the part they
 * are currently stuck on.
 *
 * Note the order here is the order of the WORK, not the order of the courses;
 * the nodes carry no course numbers, so there is nothing to contradict.
 */
const STAGES: Stage[] = [
  {
    id: "source",
    Icon: FileStack,
    stage: "Raw data",
    detail: "Logs, exports, third-party APIs, the spreadsheet someone maintains by hand.",
    course: null,
    accent: "#a8a29e",
  },
  {
    id: "data-engineering",
    Icon: Database,
    stage: "Pipelines & warehouse",
    detail: "Moved, modelled and tested on a schedule, so the numbers can be trusted.",
    course: "Data Engineering",
    href: "#data-engineering",
    accent: "#2563EB",
  },
  {
    id: "data-science",
    Icon: BarChart3,
    stage: "Analysis & models",
    detail: "Questions answered, patterns found, predictions validated before anyone acts on them.",
    course: "Data Science",
    href: "#data-science",
    accent: "#059669",
  },
  {
    id: "ai",
    Icon: BrainCircuit,
    stage: "Shipped in the product",
    detail: "An AI feature real users touch, grounded in your data and measured in production.",
    course: "AI & Machine Learning",
    href: "#ai",
    accent: "#9333EA",
  },
];

function Connector({ accent, delay, reduced }: { accent: string; delay: number; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center justify-center md:w-10">
      {/* Vertical on mobile, horizontal from md up. Each dot is scoped to one
          breakpoint — leaving the vertical one mounted on desktop parked it on
          the 1px-tall rail as a stray dash. */}
      <div className="relative h-7 w-px bg-stone-200 md:hidden">
        {!reduced && (
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
            style={{ background: accent }}
            animate={{ top: ["-4px", "calc(100% - 4px)"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay }}
          />
        )}
      </div>

      <div
        className="relative hidden h-px w-full md:block"
        style={{ background: `linear-gradient(to right, #e7e5e4, ${accent}66)` }}
      >
        {!reduced && (
          <motion.span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ background: accent }}
            animate={{ left: ["-4px", "calc(100% - 4px)"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay }}
          />
        )}
      </div>
    </div>
  );
}

export default function LearningPath() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [active, setActive] = useState(1);

  // Slowly walks the three taught stages so the eye is drawn along the flow.
  // Paused once scrolled past: this page is ~8000px tall, and there is no
  // reason to re-render a diagram nobody can see every 2.6 seconds.
  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setActive((a) => (a >= 3 ? 1 : a + 1)), 2600);
    return () => clearInterval(id);
  }, [reduced, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
      className="relative overflow-hidden rounded-3xl border border-stone-200 bg-gradient-to-b from-stone-50 to-white p-6 sm:p-8"
    >
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Where each course fits
        </p>
        <p className="text-xs text-stone-400">
          One pipeline, three places to join it
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-stretch">
        {STAGES.map((s, i) => {
          const isActive = !reduced && i === active;
          const isSource = s.course === null;
          const Tag = s.href ? motion.a : motion.div;

          return (
            <Fragment key={s.id}>
              {i > 0 && (
                <Connector accent={s.accent} delay={i * 0.35} reduced={!!reduced} />
              )}

              <Tag
                {...(s.href ? { href: s.href } : {})}
                onMouseEnter={() => !isSource && setActive(i)}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  borderColor: isActive ? `${s.accent}66` : "#e7e5e4",
                }}
                transition={{ duration: 0.4, ease: EASE }}
                className={`group relative flex flex-1 flex-col rounded-2xl border bg-white p-5 ${
                  isSource ? "border-dashed" : "cursor-pointer"
                }`}
                style={{
                  boxShadow: isActive ? `0 8px 30px -12px ${s.accent}55` : "none",
                }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: `${s.accent}14`,
                    border: `1px solid ${s.accent}33`,
                  }}
                >
                  <s.Icon size={18} style={{ color: s.accent }} />
                </span>

                <p className="mt-4 text-[15px] font-bold leading-snug text-stone-950">
                  {s.stage}
                </p>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-stone-500">
                  {s.detail}
                </p>

                <div className="mt-4 border-t border-stone-100 pt-3.5">
                  {s.course ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: s.accent }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: s.accent }}
                      />
                      {s.course}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                      What you start with
                    </span>
                  )}
                </div>
              </Tag>
            </Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
