"use client";

import Link from "next/link";
import {
  Files, Scissors, FileImage,
  RotateCcw, Minimize2, Image,
  Droplets, Hash, Lock, ArrowRight, ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const TOOLS = [
  { href: "/tools/pdf/merge",      icon: Files,     label: "Merge PDF",    description: "Combine multiple PDFs into one. Drag pages to reorder.", ready: true,  badge: "New"  },
  { href: "/tools/pdf/split",      icon: Scissors,  label: "Split PDF",    description: "Extract individual pages or custom ranges from a PDF.", ready: true               },
  { href: "/tools/pdf/rotate",     icon: RotateCcw, label: "Rotate PDF",   description: "Rotate all pages or specific pages by 90°, 180°, or 270°.", ready: true           },
  { href: "/tools/pdf/jpg-to-pdf", icon: FileImage, label: "JPG to PDF",   description: "Convert JPG, PNG, or WebP images into a PDF document.", ready: true              },
  { href: "/tools/pdf/compress",   icon: Minimize2, label: "Compress PDF", description: "Reduce file size significantly with server-side Ghostscript.", ready: false, badge: "Soon" },
  { href: "#",                     icon: Image,     label: "PDF to JPG",   description: "Convert each PDF page to a high-quality JPG image.",    ready: false, badge: "Soon" },
  { href: "#",                     icon: Droplets,  label: "Watermark PDF",description: "Add a custom text or image watermark to your PDF.",     ready: false, badge: "Soon" },
  { href: "#",                     icon: Hash,      label: "Page Numbers", description: "Insert page numbers with custom position and formatting.", ready: false, badge: "Soon" },
  { href: "#",                     icon: Lock,      label: "Protect PDF",  description: "Password-protect your PDF to restrict access.",         ready: false, badge: "Soon" },
];

const privacyPoints = ["No file uploads", "No account needed", "No size limits", "Works offline"];

export default function PDFToolsPage() {
  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <motion.div
          className="max-w-xl mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <Link href="/tools" className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors mb-4 inline-block">
            ← All tools
          </Link>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">PDF Tools</p>
          <h1 className="text-4xl font-extrabold text-stone-950 tracking-tight">Every PDF tool you need</h1>
          <p className="mt-3 text-stone-500 leading-relaxed">
            All processing happens in your browser. Files never leave your device.
          </p>
        </motion.div>

        {/* Tools grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-14"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {TOOLS.map(({ href, icon: Icon, label, description, ready, badge }) => {
            const card = (
              <motion.div
                key={label}
                variants={fadeUp}
                whileHover={ready ? { y: -2, transition: { duration: 0.15 } } : undefined}
                whileTap={ready ? { scale: 0.98 } : undefined}
              >
                <div className={[
                  "group relative flex items-start gap-4 p-5 bg-white rounded-xl border transition-all duration-150 h-full",
                  ready
                    ? "border-stone-200 hover:border-stone-300 hover:shadow-sm cursor-pointer"
                    : "border-stone-100 opacity-50 cursor-default",
                ].join(" ")}>
                  <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 ${
                    ready
                      ? "bg-stone-950 text-white group-hover:bg-amber-600"
                      : "bg-stone-100 text-stone-400"
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-stone-900">{label}</p>
                      {badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          badge === "New"  ? "text-emerald-700 bg-emerald-50" :
                                            "text-stone-400 bg-stone-100"
                        }`}>
                          {badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">{description}</p>
                  </div>
                  {ready && (
                    <ArrowRight size={13} className="shrink-0 text-stone-300 group-hover:text-stone-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  )}
                </div>
              </motion.div>
            );

            return ready ? <Link key={label} href={href}>{card}</Link> : <div key={label}>{card}</div>;
          })}
        </motion.div>

        {/* Privacy callout */}
        <motion.div
          className="border border-stone-200 rounded-2xl p-8"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-10 h-10 rounded-xl bg-stone-950 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-900 mb-1">100% private by design</p>
              <p className="text-xs text-stone-400 leading-relaxed">
                All tools use WebAssembly and JavaScript running locally in your browser.
                Nothing is ever sent to our servers. Your documents stay on your device.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 sm:text-right shrink-0">
              {privacyPoints.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
