"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";
import { trackContactSubmitted } from "@/lib/analytics";

type FormState = "idle" | "loading" | "success" | "error";

export default function CTA() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "cta_form" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong");
      }
      setState("success");
      trackContactSubmitted();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-[#C87660] focus:ring-1 focus:ring-[#C87660] transition-colors";

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
            <AnimatePresence mode="wait">
              {state === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center bg-stone-900 border border-stone-800 rounded-2xl p-12 min-h-[320px]"
                >
                  <CheckCircle2 size={40} className="text-[#C87660] mb-4" />
                  <p className="text-white font-semibold text-lg mb-2">Message received</p>
                  <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                    We&apos;ll review your message and get back to you within 1–2 business days.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="bg-stone-900 border border-stone-800 rounded-2xl p-8 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5">
                        Name <span className="text-[#C87660]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Alex Johnson"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1.5">
                        Work email <span className="text-[#C87660]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="alex@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">Company</label>
                    <input
                      type="text"
                      placeholder="Acme Corp (optional)"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1.5">
                      What are you building?
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about your data challenge — pipelines, dashboards, automation..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {state === "error" && (
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={state === "loading"}
                    whileHover={{ scale: state === "loading" ? 1 : 1.01 }}
                    whileTap={{ scale: state === "loading" ? 1 : 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-[#C87660] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#b5664f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {state === "loading" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </motion.button>

                  <p className="text-xs text-stone-600 text-center">
                    Or email us at{" "}
                    <a
                      href="mailto:hr@codedmind.co.in"
                      className="text-stone-400 hover:text-stone-300 underline underline-offset-2 transition-colors"
                    >
                      hr@codedmind.co.in
                    </a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
