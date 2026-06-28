"use client";

import Link from "next/link";
import { Globe, CalendarClock, Binary, ScanText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

/* ─── Custom SVG Icons ───────────────────────────────────────────────── */

function JsonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8.5 4C7 4 6.5 4.8 6.5 6.5V9.5C6.5 10.4 6 10.9 5 11C6 11.1 6.5 11.6 6.5 12.5V15.5C6.5 17.2 7 18 8.5 18"
        stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.5 4C17 4 17.5 4.8 17.5 6.5V9.5C17.5 10.4 18 10.9 19 11C18 11.1 17.5 11.6 17.5 12.5V15.5C17.5 17.2 17 18 15.5 18"
        stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="10" y1="8.5"  x2="14" y2="8.5"  stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <line x1="10" y1="11"   x2="12" y2="11"    stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <line x1="10" y1="13.5" x2="14" y2="13.5"  stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  );
}

function UuidIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1"  y="9" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.8"/>
      <rect x="9"  y="9" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.8"/>
      <rect x="17" y="9" width="6" height="6" rx="1.2" stroke={color} strokeWidth="1.8"/>
      <line x1="7.5"  y1="12" x2="8.5"  y2="12" stroke={color} strokeWidth="2"   strokeLinecap="round"/>
      <line x1="15.5" y1="12" x2="16.5" y2="12" stroke={color} strokeWidth="2"   strokeLinecap="round"/>
      <line x1="2.5"  y1="12" x2="5.5"  y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <line x1="10.5" y1="12" x2="13.5" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <line x1="18.5" y1="12" x2="21.5" y2="12" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function PasswordIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3L4 6.5V11C4 15.4 7.4 19.5 12 21C16.6 19.5 20 15.4 20 11V6.5L12 3Z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="9" y="11" width="6" height="5" rx="1" stroke={color} strokeWidth="1.6"/>
      <path d="M10 11V9.5A2 2 0 0 1 14 9.5V11" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="13.5" r="0.8" fill={color}/>
    </svg>
  );
}

function MergeIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1"  y="3" width="9" height="12" rx="1.5" stroke={color} strokeWidth="1.7"/>
      <line x1="3" y1="7"  x2="8" y2="7"  stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <line x1="3" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <path d="M10 9L13.5 12M10 15L13.5 12" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
      <rect x="14" y="6" width="9" height="12" rx="1.5" stroke={color} strokeWidth="1.7"/>
      <line x1="16" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <line x1="16" y1="13" x2="19" y2="13" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

function SplitIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="7.5" y="3" width="9" height="11" rx="1.5" stroke={color} strokeWidth="1.7"/>
      <line x1="9.5" y1="7"  x2="14.5" y2="7"  stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <line x1="9.5" y1="10" x2="13.5" y2="10" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <path d="M9 14.5L5 18M15 14.5L19 18" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
      <rect x="1.5"  y="18" width="7" height="3" rx="1" stroke={color} strokeWidth="1.5"/>
      <rect x="15.5" y="18" width="7" height="3" rx="1" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function RotateIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="12" height="15" rx="1.5" stroke={color} strokeWidth="1.7"/>
      <line x1="7.5" y1="8.5"  x2="14.5" y2="8.5"  stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <line x1="7.5" y1="12"   x2="12"   y2="12"   stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
      <path d="M19 8A9 9 0 0 1 19 16" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
      <polyline points="20.5,14.5 19,16 17.5,14.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ImageToPdfIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="12" height="10" rx="1.5" stroke={color} strokeWidth="1.7"/>
      <path d="M2.5 11.5L5.5 7.5L8 10L10 8L13 11.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" opacity="0.7"/>
      <path d="M14 9H16M15 7.5L16.5 9L15 10.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 5H22V19H17V5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M17 5L19.5 7.5H22" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="18.5" y1="11" x2="20.5" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
      <line x1="18.5" y1="14" x2="20.5" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

/* ─── Tool data ──────────────────────────────────────────────────────── */

type IconFn = React.ComponentType<{ size: number; color: string }>;

type Tool = {
  href:        string;
  name:        string;
  tagline:     string;
  description: string;
  accent:      string;
  darkEnd:     string;
  Icon:        IconFn;
};

const devTools: Tool[] = [
  {
    href: "/tools/json-formatter",
    name: "JSON Formatter",
    tagline: "Paste messy JSON, get clean output",
    description: "Instantly format, validate, and highlight errors in any JSON. Works with large files.",
    Icon: JsonIcon,
    accent: "#4ADE80", darkEnd: "#052E16",
  },
  {
    href: "/tools/timezone-converter",
    name: "Timezone Converter",
    tagline: "What time is it in Tokyo right now?",
    description: "See the current time in any city worldwide. Plan meetings across 500+ timezones with ease.",
    Icon: ({ size, color }) => <Globe size={size} color={color} strokeWidth={1.75} />,
    accent: "#60A5FA", darkEnd: "#0F1E40",
  },
  {
    href: "/tools/timestamp",
    name: "Timestamp Converter",
    tagline: "Turn numbers into readable dates",
    description: "Convert Unix timestamps to human-readable dates and back — in any timezone you choose.",
    Icon: ({ size, color }) => <CalendarClock size={size} color={color} strokeWidth={1.75} />,
    accent: "#C084FC", darkEnd: "#1E0A40",
  },
  {
    href: "/tools/base64",
    name: "Base64 Encoder",
    tagline: "Encode or decode any text instantly",
    description: "Convert text and files to Base64 format, or decode Base64 strings back to plain text.",
    Icon: ({ size, color }) => <Binary size={size} color={color} strokeWidth={1.75} />,
    accent: "#FCD34D", darkEnd: "#1C1000",
  },
  {
    href: "/tools/uuid-generator",
    name: "UUID Generator",
    tagline: "Unique IDs for your database or API",
    description: "Generate one or hundreds of cryptographically secure unique identifiers in a single click.",
    Icon: UuidIcon,
    accent: "#F87171", darkEnd: "#200000",
  },
  {
    href: "/tools/word-counter",
    name: "Word Counter",
    tagline: "How long is your text, really?",
    description: "See word count, character count, sentence count, and estimated reading time as you type.",
    Icon: ({ size, color }) => <ScanText size={size} color={color} strokeWidth={1.75} />,
    accent: "#2DD4BF", darkEnd: "#001A18",
  },
  {
    href: "/tools/password-generator",
    name: "Password Generator",
    tagline: "Strong passwords you didn't have to think up",
    description: "Generate secure, random passwords with your choice of length, symbols, and character types.",
    Icon: PasswordIcon,
    accent: "#818CF8", darkEnd: "#0A0A20",
  },
];

const pdfTools: Tool[] = [
  {
    href: "/tools/pdf/merge",
    name: "Merge PDF",
    tagline: "Combine multiple PDFs into one file",
    description: "Drag in your PDFs, reorder pages however you like, and download a single merged document.",
    Icon: MergeIcon,
    accent: "#FB7185", darkEnd: "#200010",
  },
  {
    href: "/tools/pdf/split",
    name: "Split PDF",
    tagline: "Pull out specific pages from a PDF",
    description: "Extract one page, a range, or specific pages (e.g. 1, 3–5, 9) from any PDF file.",
    Icon: SplitIcon,
    accent: "#FB923C", darkEnd: "#1E0800",
  },
  {
    href: "/tools/pdf/rotate",
    name: "Rotate PDF",
    tagline: "Fix sideways or upside-down pages",
    description: "Rotate all pages or individual pages by 90°, 180°, or 270° — then download instantly.",
    Icon: RotateIcon,
    accent: "#4ADE80", darkEnd: "#002010",
  },
  {
    href: "/tools/pdf/jpg-to-pdf",
    name: "JPG to PDF",
    tagline: "Turn your images into a PDF file",
    description: "Upload JPG, PNG, or WebP images and combine them into a single, shareable PDF document.",
    Icon: ImageToPdfIcon,
    accent: "#38BDF8", darkEnd: "#001018",
  },
];

/* ─── Card ───────────────────────────────────────────────────────────── */

function ToolCard({ href, name, tagline, description, accent, darkEnd, Icon }: Tool) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: `0 28px 56px ${accent}1A` }}
      transition={{ duration: 0.2 }}
      className="shrink-0 w-[260px]"
    >
      <Link
        href={href}
        className="group flex flex-col bg-[#0D1117] border border-white/[0.07] rounded-2xl overflow-hidden h-full hover:border-white/[0.14] transition-colors duration-200"
      >
        {/* Icon area */}
        <div
          className="h-[88px] flex items-end px-5 pb-4"
          style={{ background: `linear-gradient(160deg, #0D1117 0%, ${darkEnd} 100%)` }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `${accent}18`,
              border: `1.5px solid ${accent}35`,
              boxShadow: `0 0 20px ${accent}25`,
            }}
          >
            <Icon size={24} color={accent} />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-1.5">
          {/* Tool name */}
          <p className="text-[15px] font-extrabold text-white tracking-tight leading-tight">{name}</p>

          {/* Tagline — one-liner in plain language */}
          <p className="text-[12px] font-semibold leading-snug" style={{ color: accent }}>
            {tagline}
          </p>

          {/* Full description */}
          <p className="text-[12px] text-stone-500 leading-relaxed mt-1 flex-1">{description}</p>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">Free · No login</span>
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:gap-1.5 transition-all duration-150"
              style={{ color: accent }}
            >
              Open <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Strip ──────────────────────────────────────────────────────────── */

function ViewAllCard({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group shrink-0 w-[160px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-700 hover:border-stone-500 hover:bg-stone-800/20 transition-all duration-200 text-center p-6"
    >
      <div className="w-12 h-12 rounded-xl bg-stone-800 group-hover:bg-stone-700 flex items-center justify-center transition-colors">
        <ArrowRight size={18} className="text-stone-400 group-hover:text-white transition-colors" />
      </div>
      <div>
        <p className="text-[11px] font-bold text-stone-500 group-hover:text-stone-300 uppercase tracking-widest transition-colors">View all</p>
        <p className="text-xs text-stone-600 group-hover:text-stone-400 transition-colors mt-0.5">{label}</p>
      </div>
    </Link>
  );
}

function ToolStrip({ tools, label, heading, sub, viewAllHref }: {
  tools: Tool[];
  label: string;
  heading: string;
  sub: string;
  viewAllHref: string;
}) {
  return (
    <div>
      <motion.div
        className="mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
      >
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-950 tracking-tight leading-tight">{heading}</h2>
            <p className="text-stone-500 mt-1.5 text-sm">{sub}</p>
          </div>
          <Link href={viewAllHref} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors shrink-0">
            All tools <ArrowRight size={13} />
          </Link>
        </div>
      </motion.div>

      <div className="overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none" />
        <div className="flex gap-3 w-max animate-marquee-slow pb-4">
          {[...tools, ...tools].map((t, i) => <ToolCard key={`${t.href}-${i}`} {...t} />)}
          <ViewAllCard href={viewAllHref} label={label} />
          <ViewAllCard href={viewAllHref} label={label} />
        </div>
      </div>
    </div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────── */

export default function ToolsSection() {
  return (
    <section className="bg-stone-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-20">
        <ToolStrip
          tools={devTools}
          label="Developer tools"
          heading="The tools your browser tab deserves"
          sub="No login. No upload. Everything runs locally in your browser."
          viewAllHref="/tools"
        />
        <ToolStrip
          tools={pdfTools}
          label="PDF tools"
          heading="PDF editing without the software"
          sub="Your files never leave your device. Processed entirely in your browser."
          viewAllHref="/tools/pdf"
        />
      </div>
    </section>
  );
}
