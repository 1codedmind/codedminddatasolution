"use client";

import Link from "next/link";
import { ArrowRight, Braces, Globe, Files, Clock, Lock, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container, containerFast } from "@/lib/motion";

const featuredTools = [
  { icon: Braces, label: "JSON Formatter",     href: "/tools/json-formatter" },
  { icon: Globe,  label: "Timezone Converter",  href: "/tools/timezone-converter" },
  { icon: Files,  label: "Merge PDF",           href: "/tools/pdf/merge" },
  { icon: Clock,  label: "Timestamp Converter", href: "/tools/timestamp" },
  { icon: Lock,   label: "Base64 Encoder",      href: "/tools/base64" },
  { icon: Hash,   label: "UUID Generator",      href: "/tools/uuid-generator" },
];

export default function Hero() {
  return (
    <section className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Free tools · Professional data services
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-[4.25rem] font-extrabold text-stone-950 tracking-tight leading-[1.05] max-w-3xl mx-auto mb-6"
          >
            Tools for developers.
            <br />
            <span className="text-amber-600">Data systems</span> for teams.
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="text-lg text-stone-500 leading-relaxed max-w-xl mx-auto mb-10">
            Browser-based developer utilities that work instantly — no login, no data sent.
            Plus expert data engineering when your team needs to scale.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mb-16">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-950 rounded-xl hover:bg-stone-800 transition-colors"
              >
                Explore free tools <ArrowRight size={14} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <a
                href="/#cta"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
              >
                Work with us
              </a>
            </motion.div>
          </motion.div>

          {/* Tool chips */}
          <motion.div
            variants={containerFast}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            {featuredTools.map(({ icon: Icon, label, href }) => (
              <motion.div key={href} variants={fadeUp}>
                <Link
                  href={href}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all duration-150"
                >
                  <Icon size={13} className="text-stone-400 group-hover:text-amber-500 transition-colors" />
                  {label}
                </Link>
              </motion.div>
            ))}
            <motion.div variants={fadeUp}>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                +8 more →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
