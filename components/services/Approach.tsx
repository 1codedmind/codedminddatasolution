"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Search, PenTool, Hammer, Rocket, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Step = {
  Icon: LucideIcon;
  title: string;
  duration: string;
  body: string;
};

const STEPS: Step[] = [
  {
    Icon: Search,
    title: "Understand",
    duration: "Week 1",
    body: "We look at what you actually run today — the systems, the spreadsheets, the workarounds people have built. Most briefs change once someone reads the real data.",
  },
  {
    Icon: PenTool,
    title: "Shape",
    duration: "Week 1–2",
    body: "A written scope with the architecture, the trade-offs we considered, and what we are deliberately not building. You approve it before anyone writes code.",
  },
  {
    Icon: Hammer,
    title: "Build",
    duration: "Ongoing",
    body: "Short cycles with something working at the end of each one. You see progress in a real environment, not in a status document.",
  },
  {
    Icon: Rocket,
    title: "Ship",
    duration: "On agreement",
    body: "Deployed with monitoring, alerting, and rollback in place. Infrastructure is defined in code, so the environment is reproducible rather than hand-assembled.",
  },
  {
    Icon: LifeBuoy,
    title: "Hand over",
    duration: "Always",
    body: "Documentation, a walkthrough with your team, and access to everything. You should be able to end the engagement without the system becoming a mystery.",
  },
];

export default function Approach() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 60%"],
  });

  // Spring smooths the line so it glides rather than tracking the wheel exactly.
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });

  return (
    <section className="border-b border-stone-900 bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">How we work</p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            No surprises, by construction.
          </h2>
          <p className="mt-4 leading-relaxed text-stone-400">
            The same five steps on every engagement, whether it is a two-week
            pipeline or a platform build lasting months.
          </p>
        </motion.div>

        <div ref={ref} className="relative mt-16">
          {/* Track */}
          <div
            aria-hidden="true"
            className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-stone-800 sm:left-[23px]"
          />
          {/* Fill — follows scroll position through the section */}
          <motion.div
            aria-hidden="true"
            style={{ scaleY: reduced ? 1 : progress }}
            className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-[#C87660] via-[#C87660] to-[#F59E0B] sm:left-[23px]"
          />

          <ol className="space-y-10">
            {STEPS.map(({ Icon, title, duration, body }, i) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, x: reduced ? 0 : 22 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-6 sm:gap-8"
              >
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 sm:h-12 sm:w-12">
                  <Icon size={16} className="text-[#C87660]" />
                </span>

                <div className="pt-1.5 sm:pt-2.5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-stone-600">
                      {duration}
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">{body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
