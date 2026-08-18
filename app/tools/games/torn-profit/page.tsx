import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

import { getTornDeals } from "@/lib/torn/deals";
import TornDealsTable from "@/components/tools/torn/TornDealsTable";
import AdSlot from "@/components/ads/AdSlot";
import AdSidebar from "@/components/ads/AdSidebar";

export const metadata: Metadata = {
  title: "Torn Bazaar Profit Finder — Buy Low, Sell High",
  description:
    "Find Torn items selling in player bazaars below market value right now. Live cheapest-bazaar prices, profit and margin for every item, with both market-resale and vendor exit routes. Free, no API key needed.",
  keywords: [
    "torn city profit finder",
    "torn bazaar prices",
    "torn item market",
    "torn buy low sell high",
    "torn money making",
    "torn trading tool",
    "torn bazaar scanner",
  ],
  alternates: { canonical: "https://codedmind.co.in/tools/games/torn-profit" },
  openGraph: {
    title: "Torn Bazaar Profit Finder",
    description:
      "Every Torn item currently listed in a player bazaar below its market value, ranked by profit.",
    url: "https://codedmind.co.in/tools/games/torn-profit",
  },
};

function freshness(seconds: number): string {
  if (seconds <= 0) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

async function Deals() {
  const { deals, ageSeconds, degraded, error } = await getTornDeals();

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
          <AlertTriangle size={15} /> Prices are unavailable right now
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-800">
          {error} This tool depends on a public bazaar crawler; if it is down or
          rate limiting us, prices will return shortly. Please try again in a few
          minutes.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-xs text-stone-400">
        {deals.length.toLocaleString()} profitable items · prices updated {freshness(ageSeconds)}
        {degraded && " · item metadata unavailable server-side, add your own API key below for types and vendor prices"}
      </p>

      <TornDealsTable deals={deals} />
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-xl border border-stone-200 bg-stone-100" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-stone-200 bg-stone-100" />
      <div className="h-96 animate-pulse rounded-xl border border-stone-200 bg-stone-100" />
    </div>
  );
}

export default function TornProfitPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 xl:max-w-[88rem]">
      <Link href="/tools/games" className="text-sm text-stone-400 transition hover:text-stone-700">
        ← Game tools
      </Link>

      <div className="mb-8 mt-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <TrendingUp size={12} /> Live bazaar prices
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-950 sm:text-4xl">
          Torn Bazaar Profit Finder
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-stone-600">
          Every item currently listed in a player bazaar below what you can sell it
          for, ranked by profit. No API key, no login — prices come from a public
          bazaar crawler that sees far more bazaars than Torn&apos;s own item pages.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
          <Clock size={12} /> Prices are cached for a few minutes and shared across
          all visitors, to stay a polite guest of the upstream service.
        </p>
      </div>

      <div className="gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_160px]">
        <div className="min-w-0">
          <Suspense fallback={<LoadingSkeleton />}>
            <Deals />
          </Suspense>

          {/* Below the data, deliberately. An ad above a dense table is the
              quickest way to lose the visitor before the tool has proved useful. */}
          <AdSlot slot="1234567890" minHeight={110} className="mt-10" />
        </div>

        <AdSidebar slot="1234567892" />
      </div>
    </main>
  );
}
