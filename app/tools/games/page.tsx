import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Gamepad2 } from "lucide-react";

import AdSlot from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/ads/slots";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Game Tools — Free Calculators & Helpers",
  description:
    "Free browser-based tools for online games. Torn bazaar profit finder and more. No login, no API key required.",
  alternates: { canonical: "https://codedmind.co.in/tools/games" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Game Tools — Coded Mind",
    description: "Free browser-based helpers for online games.",
    url: "https://codedmind.co.in/tools/games",
  },
};

const gameTools = [
  {
    href: "/tools/games/torn-profit",
    icon: TrendingUp,
    game: "Torn",
    label: "Bazaar Profit Finder",
    description:
      "Every item selling in a player bazaar below market value, ranked by profit. Shows both resale and vendor exit routes.",
    badge: "New",
  },
];

export default function GameToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <BreadcrumbJsonLd items={[{ name: "Tools", path: "/tools" }, { name: "Game Tools", path: "/tools/games" }]} />
      <Link href="/tools" className="text-sm text-stone-400 transition hover:text-stone-700">
        ← All tools
      </Link>

      <div className="mb-10 mt-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          <Gamepad2 size={12} /> Game tools
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl">
          Tools for online games
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-stone-600">
          Helpers that do the arithmetic so you can get on with playing. Free, in
          the browser, no account needed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {gameTools.map(({ href, icon: Icon, game, label, description, badge }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-stone-200 bg-white p-6 transition hover:border-stone-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 transition-colors group-hover:bg-amber-600">
                <Icon size={17} className="text-white" />
              </div>
              {badge && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-amber-700">
              {game}
            </p>
            <h2 className="mt-1 text-lg font-bold text-stone-900">{label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-stone-700">
              Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <AdSlot slot={AD_SLOTS.gamesIndex} minHeight={110} className="mt-10" />

      <p className="mt-10 text-xs leading-relaxed text-stone-400">
        Coded Mind is not affiliated with, endorsed by, or sponsored by any game
        publisher. Game names and trademarks belong to their respective owners.
      </p>
    </main>
  );
}
