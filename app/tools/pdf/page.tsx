import Link from "next/link";
import {
  Files, Scissors, Image, FileImage,
  RotateCcw, Minimize2, Droplets, Hash,
  ArrowRight, Lock,
} from "lucide-react";

const TOOLS = [
  {
    href: "/tools/pdf/merge",
    icon: Files,
    label: "Merge PDF",
    description: "Combine multiple PDFs into one file. Drag to reorder pages.",
    color: "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white",
    ready: true,
  },
  {
    href: "/tools/pdf/split",
    icon: Scissors,
    label: "Split PDF",
    description: "Split a PDF into individual pages or custom page ranges.",
    color: "bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white",
    ready: true,
  },
  {
    href: "/tools/pdf/rotate",
    icon: RotateCcw,
    label: "Rotate PDF",
    description: "Rotate pages in a PDF by 90°, 180°, or 270°.",
    color: "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white",
    ready: true,
  },
  {
    href: "/tools/pdf/jpg-to-pdf",
    icon: FileImage,
    label: "JPG to PDF",
    description: "Convert JPG, PNG, or WebP images into a PDF document.",
    color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    ready: true,
  },
  {
    href: "/tools/pdf/compress",
    icon: Minimize2,
    label: "Compress PDF",
    description: "Reduce PDF file size significantly. Powered by server-side Ghostscript.",
    color: "bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white",
    ready: false,
    badge: "Coming soon",
  },
  {
    href: "#",
    icon: Image,
    label: "PDF to JPG",
    description: "Convert each PDF page into a high-quality JPG image.",
    color: "bg-violet-50 text-violet-500 group-hover:bg-violet-500 group-hover:text-white",
    ready: false,
    badge: "Coming soon",
  },
  {
    href: "#",
    icon: Droplets,
    label: "Watermark PDF",
    description: "Add a custom text or image watermark to your PDF.",
    color: "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white",
    ready: false,
    badge: "Coming soon",
  },
  {
    href: "#",
    icon: Hash,
    label: "Page Numbers",
    description: "Add page numbers to your PDF with custom position and style.",
    color: "bg-pink-50 text-pink-500 group-hover:bg-pink-500 group-hover:text-white",
    ready: false,
    badge: "Coming soon",
  },
  {
    href: "#",
    icon: Lock,
    label: "Protect PDF",
    description: "Password-protect your PDF to restrict access.",
    color: "bg-stone-100 text-stone-500 group-hover:bg-stone-500 group-hover:text-white",
    ready: false,
    badge: "Coming soon",
  },
];

export default function PDFToolsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold mb-5">
          PDF Tools · Free · No upload required
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
          Every PDF tool<br />you&apos;ll ever need
        </h1>
        <p className="mt-4 text-stone-500 text-lg leading-relaxed">
          All tools run directly in your browser. Files never leave your device —
          no uploads, no accounts, no limits.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map(({ href, icon: Icon, label, description, color, ready, badge }) => {
          const inner = (
            <div className={[
              "group relative flex items-start gap-4 p-5 bg-white rounded-xl border transition-all duration-150",
              ready
                ? "border-stone-200 hover:border-rose-300 hover:shadow-sm cursor-pointer"
                : "border-stone-100 opacity-60 cursor-default",
            ].join(" ")}>
              <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-stone-900">{label}</p>
                  {badge && (
                    <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{description}</p>
              </div>
              {ready && (
                <ArrowRight size={14} className="shrink-0 text-stone-300 group-hover:text-rose-400 transition mt-1" />
              )}
            </div>
          );

          return ready ? (
            <Link key={label} href={href}>{inner}</Link>
          ) : (
            <div key={label}>{inner}</div>
          );
        })}
      </div>

      {/* Privacy callout */}
      <div className="mt-14 bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center">
        <p className="text-2xl font-bold text-stone-900 mb-2">100% private by design</p>
        <p className="text-stone-500 text-sm max-w-lg mx-auto">
          Every tool on this page processes your files locally in your browser using WebAssembly and
          JavaScript. Nothing is ever uploaded to our servers. Your documents stay yours.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-stone-500">
          {["No file uploads", "No account needed", "No file size tracking", "Works offline"].map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {s}
            </span>
          ))}
        </div>
      </div>

    </main>
  );
}
