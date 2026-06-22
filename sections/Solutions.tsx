"use client";

import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const solutions = [
  { title: "Automated Business Reporting",    description: "Replace manual report generation with scheduled pipelines that deliver accurate reports on time, every time." },
  { title: "Operational Dashboards",          description: "Give teams real-time visibility into KPIs and operational metrics through clean, intuitive dashboards." },
  { title: "Data Migration & Transformation", description: "Safely migrate legacy data to modern platforms and transform it into well-structured, analysis-ready formats." },
  { title: "Financial Reconciliation",        description: "Automate complex financial reconciliation and compliance reporting with precision and full auditability." },
  { title: "AI / ML-Ready Pipelines",         description: "Prepare clean, well-documented datasets and feature stores that power your machine learning models." },
  { title: "Internal Analytics Tools",        description: "Lightweight internal tools and data apps that give your team self-serve access to business data." },
];

export default function Solutions() {
  return (
    <section id="solutions" className="bg-[#fafafa] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          <motion.div
            className="lg:col-span-4"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Use cases</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">
              Problems<br />we solve
            </h2>
            <p className="mt-5 text-stone-500 leading-relaxed text-sm">
              Practical, business-focused solutions designed to reduce friction and accelerate data-driven decisions.
            </p>
            <a href="#cta" className="inline-flex items-center gap-1.5 mt-8 text-sm font-semibold text-stone-950 hover:text-amber-600 transition-colors">
              Discuss your use case →
            </a>
          </motion.div>

          <motion.div
            className="lg:col-span-8 divide-y divide-stone-200"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {solutions.map(({ title, description }, i) => (
              <motion.div key={title} variants={fadeUp} className="group flex gap-6 py-5 first:pt-0 last:pb-0">
                <span className="shrink-0 text-xs font-bold text-stone-300 tabular-nums w-5 mt-0.5 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[14px] font-semibold text-stone-900 mb-1 group-hover:text-amber-600 transition-colors">{title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
