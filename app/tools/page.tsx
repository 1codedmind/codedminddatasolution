import Link from "next/link";
import type { Metadata } from "next";
import {
  Braces,
  Lock,
  Hash,
  AlignLeft,
  Clock,
  KeyRound,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Developer Tools — Coded Mind",
  description:
    "Free online developer tools: JSON formatter, Base64 encoder, UUID generator, word counter, timestamp converter, timezone converter, and password generator.",
};

const tools = [
  {
    href: "/tools/json-formatter",
    icon: Braces,
    label: "JSON Formatter",
    description: "Format, validate, and minify JSON. Highlights syntax errors instantly.",
    badge: "Popular",
  },
  {
    href: "/tools/base64",
    icon: Lock,
    label: "Base64 Encoder / Decoder",
    description: "Encode or decode Base64 strings and files right in the browser.",
  },
  {
    href: "/tools/uuid-generator",
    icon: Hash,
    label: "UUID Generator",
    description: "Generate cryptographically secure UUIDs (v4). Bulk generate up to 100 at once.",
  },
  {
    href: "/tools/word-counter",
    icon: AlignLeft,
    label: "Word Counter",
    description: "Count words, characters, sentences, and estimated reading time.",
  },
  {
    href: "/tools/timestamp",
    icon: Clock,
    label: "Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and back.",
  },
  {
    href: "/tools/timezone-converter",
    icon: Globe,
    label: "Timezone Converter",
    description: "Convert times across all 500+ IANA timezones. DST-aware.",
  },
  {
    href: "/tools/password-generator",
    icon: KeyRound,
    label: "Password Generator",
    description: "Generate strong, random passwords with custom length and character rules.",
  },
];

export default function ToolsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
          Developer Tools
        </h1>
        <p className="text-stone-500 text-lg max-w-xl">
          Free, fast, and privacy-first — everything runs in your browser.
          No data is ever sent to a server.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(({ href, icon: Icon, label, description, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative flex flex-col gap-4 p-6 bg-white rounded-xl border border-stone-200 hover:border-amber-400 hover:shadow-sm transition-all duration-150"
          >
            {badge && (
              <span className="absolute top-4 right-4 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-150">
              <Icon size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-stone-900 mb-1">{label}</h2>
              <p className="text-sm text-stone-400 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
