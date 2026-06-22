"use client";

import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const steps = [
  { number: "01", title: "Discover", description: "We understand your business goals, existing infrastructure, and the specific problems you need to solve — before writing a line of code." },
  { number: "02", title: "Design",   description: "We architect a solution tailored to your stack — right tools, right patterns, right data models." },
  { number: "03", title: "Build",    description: "We develop, test, and deploy with clean, well-documented, production-ready code." },
  { number: "04", title: "Optimize", description: "We monitor performance and continuously improve your systems as your business grows." },
];

export default function Process() {
  return (
    <section id="process" className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <motion.div
          className="max-w-xl mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Process</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">How we work</h2>
          <p className="mt-4 text-stone-500 text-sm leading-relaxed">Structured and transparent — you know exactly where things stand at every stage.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {steps.map(({ number, title, description }, i) => (
            <motion.div key={number} variants={fadeUp} className="relative">
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-5 h-px bg-stone-200 -translate-y-px z-0"
                  style={{ width: "calc(100% - 1.25rem)", left: "calc(100% - 0.75rem)" }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-stone-200 bg-white mb-6">
                <span className="text-xs font-extrabold text-amber-600 tabular-nums">{number}</span>
              </div>
              <h3 className="text-[15px] font-semibold text-stone-900 mb-2">{title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
