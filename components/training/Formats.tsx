"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Building2, User, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Format = {
  Icon: LucideIcon;
  title: string;
  audience: string;
  points: string[];
  accent: string;
};

/**
 * No durations or fees here on purpose — both are scoped per engagement, and a
 * published "8 weeks / X per seat" would be a commitment nobody has agreed to.
 */
const FORMATS: Format[] = [
  {
    Icon: Building2,
    title: "Corporate cohort",
    audience: "A team upskilled together",
    points: [
      "Run against your stack, and your data where you want it",
      "Scheduled around working hours",
      "Exercises drawn from problems your team recognises",
      "Sessions recorded for anyone who misses one",
    ],
    accent: "#2563EB",
  },
  {
    Icon: User,
    title: "Individual & small group",
    audience: "Someone changing direction",
    points: [
      "Live sessions, not pre-recorded video",
      "Written feedback on the work you submit",
      "More time on each person's own code",
      "A finished project you keep",
    ],
    accent: "#059669",
  },
  {
    Icon: Wrench,
    title: "Workshop or review",
    audience: "One specific gap",
    points: [
      "Scoped to a single topic and outcome",
      "Works as a follow-on after a cohort",
      "Can review something you have already built",
      "Shortest way to unblock a team",
    ],
    accent: "#9333EA",
  },
];

export default function Formats() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="max-w-2xl"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
            How it runs
          </p>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
            Three ways to learn with us.
          </h2>
          <p className="mt-4 leading-relaxed text-stone-600">
            Length, schedule and depth are agreed with you before anything starts.
            We would rather scope it around your team than sell a fixed course
            half the room already knows.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {FORMATS.map(({ Icon, title, audience, points, accent }) => (
            <motion.article
              key={title}
              variants={{
                hidden: { opacity: 0, y: reduced ? 0 : 18 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
              }}
              className="rounded-2xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-sm"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
              >
                <Icon size={19} style={{ color: accent }} />
              </span>

              <h3 className="mt-5 text-lg font-bold text-stone-950">{title}</h3>
              <p
                className="mt-1 text-[11px] font-bold uppercase tracking-wide"
                style={{ color: accent }}
              >
                {audience}
              </p>

              <ul className="mt-5 space-y-2.5 border-t border-stone-200 pt-5">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-600">
                    <span
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
