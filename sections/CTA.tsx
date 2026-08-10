"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";
import ContactForm from "@/components/ContactForm";

export default function CTA() {
  return (
    <section id="cta" className="bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
        >
          {/* Left: heading */}
          <motion.div variants={fadeUp}>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Get in touch</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.07]">
              Let&apos;s build your<br />data solution.
            </h2>
            <p className="mt-5 text-stone-400 text-base leading-relaxed max-w-md">
              From automated reporting to cloud data pipelines and custom analytics tools.
              No commitment required — tell us what you&apos;re working on.
            </p>

            <div className="mt-10">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link
                  href="/careers"
                  className="group flex items-center gap-3 px-5 py-3.5 bg-stone-800 border border-stone-700 text-white rounded-xl hover:border-stone-600 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold leading-none">Join our team</p>
                    <p className="text-xs text-stone-500 mt-0.5">View open positions</p>
                  </div>
                  <ArrowRight size={14} className="text-stone-500 group-hover:translate-x-0.5 transition-transform ml-2" />
                </Link>
              </motion.div>
            </div>

            <div className="mt-10 pt-8 border-t border-stone-800 text-xs text-stone-600 space-y-1">
              <p>Available for remote projects worldwide</p>
              <p>Built with precision. Powered by data.</p>
            </div>
          </motion.div>

          {/* Right: contact form */}
          <motion.div variants={fadeUp}>
            <ContactForm source="cta_form" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
