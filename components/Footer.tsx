import Link from "next/link";
import { Mail } from "lucide-react";

const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Why us", href: "/#why-us" },
  { label: "Process", href: "/#process" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/#cta" },
];

const toolLinks = [
  { label: "JSON Formatter", href: "/tools/json-formatter" },
  { label: "Timezone Converter", href: "/tools/timezone-converter" },
  { label: "Base64 Encoder", href: "/tools/base64" },
  { label: "UUID Generator", href: "/tools/uuid-generator" },
  { label: "Merge PDF", href: "/tools/pdf/merge" },
  { label: "Split PDF", href: "/tools/pdf/split" },
];

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-stone-800">

          {/* Brand */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 180 180" fill="none" aria-hidden="true">
                <polygon points="90,8 125,43 90,78 55,43"      stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="90,102 125,137 90,172 55,137"  stroke="#C87660" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="8,90 43,55 78,90 43,125"       stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="miter"/>
                <polygon points="102,90 137,55 172,90 137,125"  stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="miter"/>
              </svg>
              <span className="text-sm font-bold tracking-tight">
                <span className="text-white">CODED</span><span className="text-[#C87660]"> MIND</span>
              </span>
            </Link>
            <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
              Data engineering, cloud pipelines, automated reporting, and free
              developer tools — built for teams that run on data.
            </p>
            <a
              href="mailto:hr@codedmind.co.in"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-400 transition-colors"
            >
              <Mail size={12} />
              hr@codedmind.co.in
            </a>
          </div>

          {/* Company nav */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-stone-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/tools" className="text-sm text-stone-600 hover:text-amber-400 transition-colors">
                  View all →
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-600">
          <p>&copy; 2026 Coded Mind. All rights reserved.</p>
          <p>Built with precision. Powered by data.</p>
        </div>

      </div>
    </footer>
  );
}
