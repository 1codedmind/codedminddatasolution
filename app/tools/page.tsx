"use client";

import Link from "next/link";
import { Braces, Lock, Hash, AlignLeft, Clock, KeyRound, Globe, Files, Scissors, RotateCcw, FileImage, Minimize2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, container } from "@/lib/motion";

const resumeFeatures = [
  "5 professionally designed templates",
  "Live A4 preview as you type",
  "ATS score with actionable tips",
  "Instant PDF download — no watermarks",
];

function TemplateThumbs() {
  const templates = [
    {
      name: "Modern",
      render: (
        <div className="p-1.5 h-full flex flex-col" style={{ fontFamily: "sans-serif" }}>
          <div className="pb-1 mb-1 border-b border-blue-500 flex justify-between items-start">
            <div>
              <div className="h-1.5 w-8 rounded-sm bg-stone-900 mb-0.5" />
              <div className="h-1 w-5 rounded-sm bg-blue-500" />
            </div>
          </div>
          <div className="h-1 w-full rounded-sm bg-blue-600 mb-0.5" />
          <div className="h-px w-full bg-stone-200 mb-1" />
          {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          <div className="h-1 w-full rounded-sm bg-blue-600 mt-1 mb-0.5" />
          <div className="h-px w-full bg-stone-200 mb-1" />
          {[1,2,3].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          <div className="flex gap-0.5 mt-1">
            {["","",""].map((_,i)=><div key={i} className="h-1 w-3 rounded-sm bg-stone-200" />)}
          </div>
        </div>
      ),
    },
    {
      name: "Classic",
      render: (
        <div className="p-1.5 h-full flex flex-col items-center" style={{ fontFamily: "serif" }}>
          <div className="h-1.5 w-10 rounded-sm bg-stone-900 mb-0.5" />
          <div className="h-px w-full bg-stone-900 mb-1" />
          <div className="h-1 w-8 rounded-sm bg-stone-600 mb-1" />
          <div className="h-px w-full bg-stone-300 mb-1" />
          {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          <div className="h-px w-full bg-stone-300 mt-1 mb-1" />
          {[1,2,3].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
        </div>
      ),
    },
    {
      name: "Minimal",
      render: (
        <div className="p-1.5 h-full flex flex-col">
          <div className="h-1.5 w-12 rounded-sm bg-stone-900 mb-0.5" />
          <div className="h-1 w-8 rounded-sm bg-stone-400 mb-1.5" />
          <div className="h-[2px] w-4 rounded-sm bg-stone-300 mb-0.5" />
          {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          <div className="h-[2px] w-4 rounded-sm bg-stone-300 mt-1 mb-0.5" />
          {[1,2,3].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          <div className="h-[2px] w-4 rounded-sm bg-stone-300 mt-1 mb-0.5" />
          <div className="flex gap-0.5 mt-0.5">
            {["","",""].map((_,i)=><div key={i} className="h-1 w-3 rounded-sm bg-stone-100" />)}
          </div>
        </div>
      ),
    },
    {
      name: "Executive",
      render: (
        <div className="h-full flex">
          <div className="w-5 shrink-0 bg-stone-900 p-0.5 flex flex-col gap-0.5 items-center pt-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
            <div className="h-px w-3 bg-white/20 mt-0.5" />
            {[1,2,3].map(i=><div key={i} className="h-px w-3 bg-white/15" />)}
          </div>
          <div className="flex-1 p-1.5 flex flex-col">
            <div className="h-1.5 w-8 rounded-sm bg-stone-900 mb-0.5" />
            <div className="h-1 w-5 rounded-sm bg-stone-400 mb-1" />
            {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
            <div className="h-px w-4 bg-stone-300 mt-0.5 mb-0.5" />
            {[1,2,3].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
          </div>
        </div>
      ),
    },
    {
      name: "Creative",
      render: (
        <div className="p-0 h-full flex flex-col">
          <div className="h-4 w-full bg-violet-600 px-1.5 py-1 flex items-end">
            <div className="h-1.5 w-8 rounded-sm bg-white/70" />
          </div>
          <div className="p-1.5 flex flex-col flex-1">
            <div className="border-l-2 border-violet-500 pl-1 mb-1">
              <div className="h-1 w-8 rounded-sm bg-stone-700 mb-0.5" />
              {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
            </div>
            <div className="border-l-2 border-violet-500 pl-1">
              <div className="h-1 w-6 rounded-sm bg-stone-700 mb-0.5" />
              {[1,2].map(i=><div key={i} className="h-px w-full bg-stone-100 mb-0.5" />)}
            </div>
            <div className="flex gap-0.5 mt-1">
              {["","",""].map((_,i)=><div key={i} className="h-1 w-3 rounded-full bg-violet-100" />)}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex gap-2.5 justify-end">
      {templates.map((t) => (
        <div key={t.name} className="flex flex-col items-center gap-1.5">
          <div
            className="rounded-lg overflow-hidden shadow-md border border-white/10"
            style={{ width: 60, height: 85, background: "white" }}
          >
            {t.render}
          </div>
          <span className="text-[9px] font-medium text-white/30 uppercase tracking-wider">{t.name}</span>
        </div>
      ))}
    </div>
  );
}

function ResumeFeaturedCard() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="mb-12"
    >
      <Link
        href="/tools/resume-builder"
        className="group block relative rounded-2xl overflow-hidden border border-white/[0.06] transition-all duration-200 hover:border-white/[0.12] hover:shadow-2xl"
        style={{ background: "linear-gradient(135deg, #0f0f10 0%, #111827 60%, #1a1030 100%)" }}
      >
        {/* Subtle glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 70% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)" }} />

        <div className="relative px-8 py-8 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-400/20 bg-emerald-400/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                FREE — No login required
              </span>
              <span className="text-[10px] font-semibold text-violet-400 border border-violet-400/20 bg-violet-400/[0.08] px-2 py-1 rounded-full">NEW</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2">
              Resume Builder
            </h2>
            <p className="text-sm text-white/40 mb-5 max-w-sm leading-relaxed">
              Professional templates, ATS scoring, live preview, and one-click PDF export. Build a job-winning resume in minutes.
            </p>

            <ul className="flex flex-col gap-2 mb-6">
              {resumeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span className="text-[13px] text-white/60">{f}</span>
                </li>
              ))}
            </ul>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 group-hover:gap-3"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #7c3aed)" }}>
              Build my resume <ArrowRight size={14} />
            </div>
          </div>

          {/* Right — template thumbnails */}
          <div className="shrink-0 hidden sm:block">
            <TemplateThumbs />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

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

        <ResumeFeaturedCard />

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
