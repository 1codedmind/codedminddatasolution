"use client";

import Link from "next/link";
import { Braces, Lock, Hash, AlignLeft, Clock, KeyRound, Globe, Files, Scissors, RotateCcw, FileImage, Minimize2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const devTools = [
  { href: "/tools/json-formatter",     icon: Braces,    label: "JSON Formatter",      description: "Format, validate, and minify JSON. Highlights syntax errors instantly.", badge: "Popular" },
  { href: "/tools/timezone-converter", icon: Globe,     label: "Timezone Converter",  description: "500+ IANA timezones, DST-aware. Search by city, country, or abbreviation.", badge: "Popular" },
  { href: "/tools/timestamp",          icon: Clock,     label: "Timestamp Converter", description: "Convert Unix timestamps to human-readable dates and back." },
  { href: "/tools/base64",             icon: Lock,      label: "Base64 Encoder",      description: "Encode or decode Base64 strings entirely in your browser." },
  { href: "/tools/uuid-generator",     icon: Hash,      label: "UUID Generator",      description: "Generate cryptographically secure v4 UUIDs. Bulk up to 100 at once." },
  { href: "/tools/word-counter",       icon: AlignLeft, label: "Word Counter",        description: "Count words, characters, sentences, and estimated reading time." },
  { href: "/tools/password-generator", icon: KeyRound,  label: "Password Generator",  description: "Strong, random passwords with custom rules. Never transmitted." },
];

const pdfTools = [
  { href: "/tools/pdf/merge",      icon: Files,     label: "Merge PDF",    description: "Combine PDFs into one. Drag pages to set the order.", badge: "New" },
  { href: "/tools/pdf/split",      icon: Scissors,  label: "Split PDF",    description: "Extract individual pages or custom page ranges." },
  { href: "/tools/pdf/rotate",     icon: RotateCcw, label: "Rotate PDF",   description: "Rotate all pages by 90°, 180°, or 270°." },
  { href: "/tools/pdf/jpg-to-pdf", icon: FileImage, label: "JPG to PDF",   description: "Convert JPG, PNG, or WebP images to a PDF document." },
  { href: "/tools/pdf/compress",   icon: Minimize2, label: "Compress PDF", description: "Reduce file size with server-side Ghostscript.", badge: "Soon" },
];

function ToolCard({ href, icon: Icon, label, description, badge }: { href: string; icon: React.ElementType; label: string; description: string; badge?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={href}
        className="group relative flex flex-col gap-4 p-5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all duration-150 h-full"
      >
        {badge && (
          <span className={`absolute top-3.5 right-3.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            badge === "Popular" ? "text-amber-700 bg-amber-50" :
            badge === "New"     ? "text-emerald-700 bg-emerald-50" :
                                  "text-stone-400 bg-stone-100"
          }`}>
            {badge}
          </span>
        )}
        <div className="w-9 h-9 rounded-xl bg-stone-950 group-hover:bg-amber-600 flex items-center justify-center text-white transition-colors duration-200">
          <Icon size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-semibold text-stone-900 leading-tight">{label}</h2>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ToolsPage() {
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
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Tools</p>
          <h1 className="text-4xl font-extrabold text-stone-950 tracking-tight">Free developer tools</h1>
          <p className="mt-3 text-stone-500 leading-relaxed">
            Everything runs in your browser. No account, no data sent to any server.
          </p>
        </motion.div>

        {/* Developer tools */}
        <div className="mb-14">
          <motion.div
            className="flex items-center justify-between mb-5"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Developer utilities</h2>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {devTools.map((t) => <ToolCard key={t.href} {...t} />)}
          </motion.div>
        </div>

        {/* PDF tools */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-5"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest">PDF tools</h2>
            <Link href="/tools/pdf" className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-950 transition-colors">
              View all PDF tools <ArrowRight size={12} />
            </Link>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {pdfTools.map((t) => <ToolCard key={t.href} {...t} />)}
          </motion.div>
        </div>

        <motion.p
          className="mt-12 text-center text-xs text-stone-400"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          All tools run entirely in your browser · Zero data transmitted · No account required
        </motion.p>

      </div>
    </main>
  );
}
