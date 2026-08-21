import Link from "next/link";

/**
 * Cross-links between tools, rendered under every /tools page.
 *
 * Internal linking is the cheapest SEO lever available here: it spreads
 * authority from the pages that rank to the ones that do not, and gives a
 * visitor who finished one task somewhere obvious to go next. Living in the
 * shared layout means one edit covers every tool rather than twelve.
 */

const TOOLS = [
  { href: "/tools/json-formatter", label: "JSON Formatter" },
  { href: "/tools/base64", label: "Base64 Encoder" },
  { href: "/tools/uuid-generator", label: "UUID Generator" },
  { href: "/tools/timezone-converter", label: "Timezone Converter" },
  { href: "/tools/timestamp", label: "Timestamp Converter" },
  { href: "/tools/word-counter", label: "Word Counter" },
  { href: "/tools/password-generator", label: "Password Generator" },
  { href: "/tools/resume-builder", label: "Resume Builder" },
  { href: "/tools/pdf/merge", label: "Merge PDF" },
  { href: "/tools/pdf/split", label: "Split PDF" },
  { href: "/tools/pdf/sign", label: "Sign PDF" },
  { href: "/tools/games/torn-profit", label: "Torn Profit Finder" },
];

export default function MoreTools() {
  return (
    <section className="border-t border-stone-100 bg-stone-50/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
          More free tools
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="inline-block rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 transition hover:border-stone-300 hover:text-stone-900"
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-stone-400">
          Every tool runs in your browser. No login, nothing uploaded.{" "}
          <Link href="/tools" className="text-amber-700 hover:text-amber-800">
            See all tools
          </Link>
          {" · "}
          <Link href="/services" className="text-amber-700 hover:text-amber-800">
            What we build for clients
          </Link>
        </p>
      </div>
    </section>
  );
}
