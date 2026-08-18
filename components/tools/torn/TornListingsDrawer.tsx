"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, AlertTriangle } from "lucide-react";

import type { TornDeal } from "@/lib/torn/types";
import type { TornListingsResult } from "@/lib/torn/listings";

function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/**
 * Every bazaar currently selling one item, cheapest first.
 *
 * The point of the drill-down is depth: the table shows the single cheapest
 * price, but what matters when you actually buy is how many units sit below
 * market value and across how many sellers.
 */
export default function TornListingsDrawer({
  deal,
  onClose,
}: {
  deal: TornDeal | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<TornListingsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!deal) return;

    let cancelled = false;

    // State updates happen in the promise callbacks only. Setting them
    // synchronously here would cascade an extra render on every open.
    fetch(`/api/tools/torn/listings/${deal.itemId}`)
      .then((r) => r.json())
      .then((json: TornListingsResult & { error?: string }) => {
        if (cancelled) return;
        if (json.error) setError(json.error);
        else setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load listings.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deal]);

  // Escape to close, and stop the page scrolling behind the panel.
  useEffect(() => {
    if (!deal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [deal, onClose]);

  if (!deal) return null;

  const value = data?.marketPrice || deal.value;
  const below = (data?.listings ?? []).filter((l) => value - l.price > 0);
  const units = below.reduce((n, l) => n + l.quantity, 0);
  const totalProfit = below.reduce((n, l) => n + (value - l.price) * l.quantity, 0);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-stone-950/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label={`Bazaar listings for ${deal.name}`}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(520px,94vw)] flex-col border-l border-stone-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-stone-900">{deal.name}</h2>
            <p className="mt-0.5 text-xs text-stone-500">
              {loading
                ? "Loading listings…"
                : data
                  ? `${data.listings.length} bazaar listing${data.listings.length === 1 ? "" : "s"} · cheapest first`
                  : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4" data-lenis-prevent>
          {/* Summary */}
          <dl className="space-y-1.5 text-sm">
            <Row label="Market value" value={money(value)} />
            <Row label="Bazaar average" value={data?.bazaarAverage ? money(data.bazaarAverage) : "—"} />
            {deal.vendorPrice > 0 && (
              <>
                <Row
                  label="Vendor pays"
                  value={money(deal.vendorPrice)}
                  hint={deal.vendorPrice > deal.marketValue ? "beats market" : undefined}
                  good={deal.vendorPrice > deal.marketValue}
                />
                <Row
                  label="Shop that stocks it"
                  value={
                    deal.vendorShop
                      ? `${deal.vendorShop}${deal.vendorCountry && deal.vendorCountry !== "Torn" ? ` (${deal.vendorCountry})` : ""}`
                      : "none — vendor sale unverified"
                  }
                  warn={!deal.vendorShop}
                />
              </>
            )}
            <div className="flex items-center justify-between gap-3 py-1">
              <dt className="text-stone-500">Item Market page</dt>
              <dd>
                <a
                  href={`https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID=${deal.itemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-amber-700 hover:text-amber-800"
                >
                  open <ExternalLink size={11} />
                </a>
              </dd>
            </div>
          </dl>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-400">
              <Loader2 size={15} className="animate-spin" /> Loading bazaars…
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {data && data.listings.length === 0 && !error && (
            <p className="py-12 text-center text-sm text-stone-400">
              No bazaar listings right now.
            </p>
          )}

          {data && data.listings.length > 0 && (
            <>
              <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-800">Total available below market</p>
                <p className="mt-0.5 font-semibold text-emerald-900">
                  {units.toLocaleString()} unit{units === 1 ? "" : "s"} · {money(totalProfit)} profit
                </p>
              </div>

              <p className="mt-4 mb-2 text-xs text-stone-400">
                Click a seller to open their bazaar with this item highlighted.
              </p>

              <ul className="divide-y divide-stone-100">
                {data.listings.map((l, i) => {
                  const profit = value - l.price;
                  return (
                    <li key={`${l.player}-${l.price}-${i}`}>
                      <a
                        href={l.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-stone-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-amber-700">
                            {l.playerName}
                          </span>
                          <span className="text-xs text-stone-400">
                            {l.quantity.toLocaleString()} available
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-sm tabular-nums text-stone-700">
                            {money(l.price)}
                          </span>
                          <span
                            className={`text-xs tabular-nums ${profit > 0 ? "text-emerald-600" : "text-stone-300"}`}
                          >
                            {profit > 0 ? `+${((profit / l.price) * 100).toFixed(0)}%` : "—"}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function Row({
  label, value, hint, good, warn,
}: {
  label: string; value: string; hint?: string; good?: boolean; warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <dt className="shrink-0 text-stone-500">{label}</dt>
      <dd className={`truncate text-right font-medium ${good ? "text-emerald-600" : warn ? "text-amber-700" : "text-stone-800"}`}>
        {value}
        {hint && <span className="ml-1 text-xs font-normal">— {hint}</span>}
      </dd>
    </div>
  );
}
