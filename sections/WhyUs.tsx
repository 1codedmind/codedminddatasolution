"use client";

import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const reasons = [
  { title: "Scalable architecture",        description: "Systems built to grow — from thousands of records today to billions tomorrow, without a rewrite." },
  { title: "Business-first mindset",       description: "Every technical decision is tied to a business outcome. We build what creates value, not what looks good in a deck." },
  { title: "Cloud & automation expertise", description: "Deep hands-on experience with leading cloud platforms and modern automation tooling." },
  { title: "Maintainable systems",         description: "Clean code, proper documentation, and tested pipelines your team can own and extend with confidence." },
  { title: "Performance-driven",           description: "We benchmark, profile, and optimise until your pipelines run fast and queries return in seconds." },
  { title: "Custom-built, not templated",  description: "No off-the-shelf solutions. Everything is designed around your data, your stack, and your specific goals." },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-stone-950 border-b border-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <motion.div
          className="max-w-xl mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Why us</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Why clients<br />choose Coded Mind
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-800 rounded-2xl overflow-hidden border border-stone-800"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {reasons.map(({ title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="bg-stone-950 p-7 hover:bg-stone-900 transition-colors duration-150 group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-5" />
              <h3 className="text-[14px] font-semibold text-stone-100 mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
