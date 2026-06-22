"use client";

import Link from "next/link";
import { Braces, Lock, Hash, AlignLeft, Clock, KeyRound, Globe, ArrowRight, Files, Scissors, RotateCcw, FileImage } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const devTools = [
  { href: "/tools/json-formatter",      icon: Braces,    label: "JSON Formatter",      description: "Format, validate & minify JSON instantly." },
  { href: "/tools/timezone-converter",  icon: Globe,     label: "Timezone Converter",  description: "500+ IANA timezones, DST-aware timeline." },
  { href: "/tools/timestamp",           icon: Clock,     label: "Timestamp Converter", description: "Unix timestamps ↔ human-readable dates." },
  { href: "/tools/base64",              icon: Lock,      label: "Base64 Encoder",      description: "Encode or decode Base64 strings." },
  { href: "/tools/uuid-generator",      icon: Hash,      label: "UUID Generator",      description: "Cryptographically secure v4 UUIDs in bulk." },
  { href: "/tools/word-counter",        icon: AlignLeft, label: "Word Counter",        description: "Words, characters, reading time — live." },
  { href: "/tools/password-generator",  icon: KeyRound,  label: "Password Generator",  description: "Strong random passwords, generated locally." },
];

const pdfTools = [
  { href: "/tools/pdf/merge",      icon: Files,     label: "Merge PDF",  description: "Combine multiple PDFs. Reorder pages before merging." },
  { href: "/tools/pdf/split",      icon: Scissors,  label: "Split PDF",  description: "Extract pages or custom ranges from any PDF." },
  { href: "/tools/pdf/rotate",     icon: RotateCcw, label: "Rotate PDF", description: "Rotate all pages 90°, 180°, or 270°." },
  { href: "/tools/pdf/jpg-to-pdf", icon: FileImage, label: "JPG to PDF", description: "Convert JPG, PNG, or WebP images to a PDF." },
];

function ToolCard({ href, icon: Icon, label, description }: { href: string; icon: React.ElementType; label: string; description: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Link
        href={href}
        className="group flex items-start gap-3.5 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-sm transition-all duration-150 h-full"
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-stone-950 flex items-center justify-center text-white group-hover:bg-amber-600 transition-colors duration-200">
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900 leading-tight">{label}</p>
          <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ToolsSection() {
  return (
    <section className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">

        {/* Developer tools */}
        <div>
          <motion.div
            className="flex items-end justify-between mb-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Developer tools</p>
              <h2 className="text-2xl font-bold text-stone-950 tracking-tight">Run in your browser. No login.</h2>
            </div>
            <Link href="/tools" className="hidden sm:flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-950 transition-colors">
              All tools <ArrowRight size={13} />
            </Link>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {devTools.map((t) => <ToolCard key={t.href} {...t} />)}
          </motion.div>
        </div>

        {/* PDF tools */}
        <div>
          <motion.div
            className="flex items-end justify-between mb-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">PDF tools</p>
              <h2 className="text-2xl font-bold text-stone-950 tracking-tight">Process PDFs locally. Files never leave your device.</h2>
            </div>
            <Link href="/tools/pdf" className="hidden sm:flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-950 transition-colors">
              All PDF tools <ArrowRight size={13} />
            </Link>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {pdfTools.map((t) => <ToolCard key={t.href} {...t} />)}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
