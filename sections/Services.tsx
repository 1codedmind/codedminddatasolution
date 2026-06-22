"use client";

import { GitBranch, Cloud, BarChart2, Zap, Package, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const services = [
  { icon: GitBranch,   title: "Data Engineering",           description: "Robust, scalable pipelines that reliably move and transform data across your systems — Airflow, dbt, Spark, and modern ELT tooling." },
  { icon: Cloud,       title: "Cloud Data Solutions",       description: "Cloud-native data infrastructure on AWS, GCP, or Azure, architected to your workloads and cost profile." },
  { icon: BarChart2,   title: "Reporting & Dashboards",     description: "Interactive dashboards and automated reports that give stakeholders real-time visibility into business performance." },
  { icon: Zap,         title: "Data Automation",            description: "Eliminate manual data work with end-to-end automation — from ingestion and transformation through to scheduled delivery." },
  { icon: Package,     title: "Custom Data Products",       description: "Internal tools, APIs, and analytics applications purpose-built around your team's specific data needs." },
  { icon: ShieldCheck, title: "Data Quality & Optimization",description: "Validation, monitoring, and performance tuning that keeps your data clean, accurate, and fast at any scale." },
];

export default function Services() {
  return (
    <section id="services" className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <motion.div
          className="max-w-xl mb-14"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Services</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight leading-tight">What we build</h2>
          <p className="mt-4 text-stone-500 leading-relaxed">
            End-to-end data services — from architecture through to deployment and ongoing optimization.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {services.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="bg-white p-7 hover:bg-stone-50 transition-colors duration-150 group"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-950 flex items-center justify-center text-white mb-5 group-hover:bg-amber-600 transition-colors duration-200">
                <Icon size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-stone-900 mb-2">{title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
