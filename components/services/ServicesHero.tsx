"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

const HEADLINE = ["Data", "platforms.", "Software.", "AI", "that", "earns", "its", "place."];

const CAPABILITY_TAGS = [
  "Data Engineering",
  "Full-Stack Development",
  "AI Solutions",
];

export default function ServicesHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax: the backdrop drifts slower than the copy, and the whole block
  // fades as it leaves. Disabled entirely when the user prefers less motion.
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-b border-stone-900 bg-stone-950"
    >
      {/* Backdrop */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: glowY }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className="absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(200,118,96,0.18) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -right-32 top-40 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
          }}
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity }}
        className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 lg:py-36"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-xs font-bold uppercase tracking-widest text-stone-500"
        >
          What we do
        </motion.p>

        {/* Word-by-word reveal */}
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
          {HEADLINE.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="mr-[0.28em] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-stone-400"
        >
          One team across the whole stack — the pipelines that move your data, the
          applications your people actually use, and the AI features that hold up
          in production. We build and run our own platforms on exactly this stack,
          so nothing here is theoretical.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-8 flex flex-wrap gap-2.5"
        >
          {CAPABILITY_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-stone-800 bg-stone-900/70 px-4 py-1.5 text-sm text-stone-300 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          className="mt-11 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#C87660] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#b5664f]"
          >
            Start a conversation
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="#capabilities"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-700 px-6 py-3.5 text-sm font-semibold text-stone-300 transition-colors hover:border-stone-600 hover:text-white"
          >
            See what we build
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-20 flex items-center gap-2 text-xs text-stone-600"
        >
          <motion.span
            animate={reduced ? undefined : { y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
            className="inline-flex"
          >
            <ArrowDown size={13} />
          </motion.span>
          Scroll
        </motion.div>
      </motion.div>
    </section>
  );
}
