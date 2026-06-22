"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

export default function CTA() {
  return (
    <section id="cta" className="bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <motion.div variants={fadeUp} className="max-w-2xl mb-12">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Get in touch</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.07]">
              Let&apos;s build your<br />data solution.
            </h2>
            <p className="mt-5 text-stone-400 text-base leading-relaxed max-w-lg">
              From automated reporting to cloud data pipelines and custom analytics tools.
              No commitment required — tell us what you&apos;re working on.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <motion.a
              href="mailto:hr@codedmind.co.in"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center justify-between flex-1 px-5 py-4 bg-white text-stone-900 rounded-xl hover:bg-amber-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-stone-400" />
                <div>
                  <p className="text-sm font-semibold leading-none">Email us</p>
                  <p className="text-xs text-stone-400 mt-0.5">hr@codedmind.co.in</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-stone-300 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/careers"
                className="group flex items-center justify-between flex-1 px-5 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold leading-none">View openings</p>
                  <p className="text-xs text-amber-200 mt-0.5">Join our team</p>
                </div>
                <ArrowRight size={14} className="text-amber-300 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-600">
            <p>Available for remote projects worldwide</p>
            <p>Built with precision. Powered by data.</p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
