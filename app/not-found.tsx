import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Home, Wrench, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const suggestions = [
  { Icon: Home, label: "Home", description: "Back to the start", href: "/" },
  { Icon: Wrench, label: "Free tools", description: "12 browser-based utilities", href: "/tools" },
  { Icon: ArrowRight, label: "Data services", description: "What we build for teams", href: "/services" },
  { Icon: Mail, label: "Contact", description: "Talk to a human", href: "/contact" },
];

export default function NotFound() {
  return (
    <main className="bg-stone-950 flex-1 flex items-center">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.07]">
          We couldn&apos;t find that page.
        </h1>
        <p className="mt-5 max-w-lg text-stone-400 leading-relaxed">
          The link may be out of date, or the page may have moved. Here&apos;s where most
          people are heading:
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map(({ Icon, label, description, href }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-stone-800 bg-stone-900 px-5 py-4 transition-colors hover:border-stone-700"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-800">
                <Icon size={15} className="text-[#C87660]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white leading-none">{label}</p>
                <p className="mt-1 truncate text-xs text-stone-500">{description}</p>
              </div>
              <ArrowRight
                size={14}
                className="ml-auto shrink-0 text-stone-600 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>

        <p className="mt-10 text-xs text-stone-600">
          Think this is a broken link on our side? Tell us at{" "}
          <a
            href="mailto:hr@codedmind.co.in"
            className="text-stone-400 underline underline-offset-2 hover:text-stone-300"
          >
            hr@codedmind.co.in
          </a>
          .
        </p>
      </div>
    </main>
  );
}
