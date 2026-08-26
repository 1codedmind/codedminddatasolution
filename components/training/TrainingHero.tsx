"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

import LearningPath from "@/components/training/LearningPath";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Light, deliberately.
 *
 * Dark suits a page of short marketing copy; this page asks the reader to work
 * through five modules per course, and dark backgrounds cost legibility over
 * sustained reading.
 */
export default function TrainingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 20% 0%, black 15%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse at 20% 0%, black 15%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-bold uppercase tracking-widest text-stone-400"
        >
          Training
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
          className="mt-4 max-w-4xl text-[2.75rem] font-extrabold leading-[1.04] tracking-[-0.02em] text-stone-950 sm:text-6xl"
        >
          Learn data and AI from
          <br className="hidden sm:block" />{" "}
          <span className="relative whitespace-nowrap">
            the people who ship it.
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-[#2563EB] via-[#059669] to-[#9333EA]"
            />
          </span>
        </motion.h1>

        <div className="mt-9 flex max-w-5xl flex-col gap-x-10 gap-y-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: EASE }}
            className="max-w-xl text-lg leading-relaxed text-stone-600"
          >
            Three courses in data science, data engineering, and AI — taught on
            the same stack we use for client work, by engineers who build it the
            rest of the week.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26, ease: EASE }}
            className="flex shrink-0 flex-wrap items-center gap-3"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-stone-800"
            >
              Discuss a training plan
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-6 py-3.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50"
            >
              Compare the courses
              <ArrowDown size={15} />
            </a>
          </motion.div>
        </div>

        <div className="mt-14">
          <LearningPath />
        </div>
      </div>
    </section>
  );
}
