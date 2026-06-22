import Link from "next/link";
import { Braces, Lock, Hash, AlignLeft, Clock, KeyRound, Globe, ArrowRight, Files, Scissors, RotateCcw, FileImage } from "lucide-react";

const devTools = [
  { href: "/tools/json-formatter", icon: Braces, label: "JSON Formatter", description: "Format & validate JSON instantly." },
  { href: "/tools/base64", icon: Lock, label: "Base64 Encoder", description: "Encode or decode Base64 strings." },
  { href: "/tools/uuid-generator", icon: Hash, label: "UUID Generator", description: "Generate secure v4 UUIDs in bulk." },
  { href: "/tools/word-counter", icon: AlignLeft, label: "Word Counter", description: "Words, chars, reading time — live." },
  { href: "/tools/timestamp", icon: Clock, label: "Timestamp Converter", description: "Unix timestamps ↔ readable dates." },
  { href: "/tools/timezone-converter", icon: Globe, label: "Timezone Converter", description: "All 500+ IANA timezones, DST-aware." },
  { href: "/tools/password-generator", icon: KeyRound, label: "Password Generator", description: "Strong random passwords, locally." },
];

const pdfTools = [
  { href: "/tools/pdf/merge",      icon: Files,      label: "Merge PDF",    description: "Combine multiple PDFs into one." },
  { href: "/tools/pdf/split",      icon: Scissors,   label: "Split PDF",    description: "Extract pages or custom ranges." },
  { href: "/tools/pdf/rotate",     icon: RotateCcw,  label: "Rotate PDF",   description: "Rotate pages by 90°, 180°, 270°." },
  { href: "/tools/pdf/jpg-to-pdf", icon: FileImage,  label: "JPG to PDF",   description: "Convert images to a PDF document." },
];

function ToolCard({ href, icon: Icon, label, description, accent }: { href: string; icon: React.ElementType; label: string; description: string; accent: string }) {
  return (
    <Link
      href={href}
      className={`group flex items-start gap-4 p-5 bg-[#fcfaf6] rounded-xl border border-stone-200 hover:bg-white hover:shadow-sm transition-all duration-150 ${accent}`}
    >
      <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-stone-100 text-stone-500 group-hover:text-white transition-all duration-150 group-hover:bg-current">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-semibold text-stone-900">{label}</p>
        <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

export default function ToolsSection() {
  return (
    <section className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">

        {/* Developer tools */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">Developer tools</h2>
              <p className="mt-2 text-stone-500 text-base max-w-md">Everything runs in your browser. No account, no data sent.</p>
            </div>
            <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-amber-700 transition-colors shrink-0">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devTools.map((t) => <ToolCard key={t.href} {...t} accent="hover:border-amber-400 [&_.group-hover\\:bg-current]:group-hover:bg-amber-600" />)}
          </div>
        </div>

        {/* PDF tools */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">PDF tools</h2>
              <p className="mt-2 text-stone-500 text-base max-w-md">Process PDFs locally in your browser. Files never leave your device.</p>
            </div>
            <Link href="/tools/pdf" className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-rose-600 transition-colors shrink-0">
              All PDF tools <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pdfTools.map((t) => <ToolCard key={t.href} {...t} accent="hover:border-rose-300 [&_.group-hover\\:bg-current]:group-hover:bg-rose-500" />)}
          </div>
        </div>

      </div>
    </section>
  );
}
