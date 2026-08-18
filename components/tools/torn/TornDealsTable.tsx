"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowUpDown, ArrowUp, ArrowDown, Search, Store, TrendingUp, Wallet, RefreshCw } from "lucide-react";

import type { TornDeal } from "@/lib/torn/types";
import { bestExit } from "@/lib/torn/profit";
import {
  fetchCatalogue,
  loadStoredKey,
  storeKey,
  clearStoredCatalogue,
  type Catalogue,
} from "@/lib/torn/clientCatalogue";
import TornKeyPanel from "@/components/tools/torn/TornKeyPanel";
import TornListingsDrawer from "@/components/tools/torn/TornListingsDrawer";

type SortKey = "profit" | "margin" | "price" | "value" | "name";
type Dir = "asc" | "desc";

function money(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}b`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 10_000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString("en-US")}`;
}


const BUDGETS = [
  { label: "Any", value: 0 },
  { label: "$100k", value: 100_000 },
  { label: "$1m", value: 1_000_000 },
  { label: "$10m", value: 10_000_000 },
  { label: "$100m", value: 100_000_000 },
];

export default function TornDealsTable({ deals: serverDeals }: { deals: TornDeal[] }) {
  // ── Optional API key, entirely client-side ────────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [keyStatus, setKeyStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    const stored = loadStoredKey();
    if (!stored) return;

    // setState lives in the promise callbacks, never synchronously in the
    // effect body, which would trigger a cascading re-render.
    let cancelled = false;
    fetchCatalogue(stored)
      .then((c) => {
        if (cancelled) return;
        setApiKey(stored);
        setCatalogue(c);
        setKeyStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setKeyStatus("idle");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function saveKey(key: string) {
    setKeyStatus("loading");
    setKeyError("");
    try {
      const c = await fetchCatalogue(key, true);
      setCatalogue(c);
      setApiKey(key);
      storeKey(key);
      setKeyStatus("ready");
    } catch (err) {
      setKeyStatus("error");
      setKeyError(err instanceof Error ? err.message : "Could not verify that key.");
    }
  }

  function clearKey() {
    storeKey("");
    clearStoredCatalogue();
    setApiKey("");
    setCatalogue(null);
    setKeyStatus("idle");
  }

  // ── Enrich with the catalogue when we have one ───────────────────────────
  const deals = useMemo(() => {
    if (!catalogue) return serverDeals;

    return serverDeals
      .map((d) => {
        const item = catalogue[d.itemId];
        if (!item) return d;
        const marketValue = d.marketValue || item.marketValue;
        const exit = bestExit(d.price, marketValue, item.vendorPrice);
        return {
          ...d,
          type: item.type || d.type,
          marketValue,
          vendorPrice: item.vendorPrice,
          vendorShop: item.vendorShop,
          vendorCountry: item.vendorCountry,
          enriched: true,
          ...exit,
        };
      })
      .filter((d) => d.profit > 0);
  }, [serverDeals, catalogue]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(0);
  const [minMargin, setMinMargin] = useState(0);
  const [exit, setExit] = useState<"all" | "Market" | "Vendor">("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortKey>("profit");
  const [dir, setDir] = useState<Dir>("desc");
  const [limit, setLimit] = useState(50);
  const [openDeal, setOpenDeal] = useState<TornDeal | null>(null);

  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [refreshNote, setRefreshNote] = useState("");

  async function refreshPrices() {
    setRefreshNote("");
    try {
      const res = await fetch("/api/tools/torn/refresh", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      setRefreshNote(json.message ?? json.error ?? "");
      // Re-render the server component so the newly fetched prices appear.
      startRefresh(() => router.refresh());
    } catch {
      setRefreshNote("Could not refresh right now.");
    }
  }

  // If a key is stored, let the visitor re-pull their own item catalogue too.
  async function refreshCatalogue() {
    if (!apiKey) return;
    setKeyStatus("loading");
    try {
      const c = await fetchCatalogue(apiKey, true);
      setCatalogue(c);
      setKeyStatus("ready");
    } catch {
      setKeyStatus("ready");
    }
  }

  const types = useMemo(() => {
    const set = new Set(deals.map((d) => d.type).filter((t) => t && t !== "Unknown"));
    return [...set].sort();
  }, [deals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = deals.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q) && !d.type.toLowerCase().includes(q)) return false;
      if (budget > 0 && d.price > budget) return false;
      if (d.margin < minMargin) return false;
      if (exit !== "all" && d.exit !== exit) return false;
      if (type !== "all" && d.type !== type) return false;
      return true;
    });

    const factor = dir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name) * factor;
      if (sort === "price") return (a.price - b.price) * factor;
      if (sort === "value") return (a.value - b.value) * factor;
      if (sort === "margin") return (a.margin - b.margin) * factor;
      return (a.profit - b.profit) * factor;
    });
    return rows;
  }, [deals, query, budget, minMargin, exit, type, sort, dir]);

  const visible = filtered.slice(0, limit);

  function toggleSort(key: SortKey) {
    if (sort === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "name" || key === "price" ? "asc" : "desc");
    }
  }

  // ── Stats that mean something ────────────────────────────────────────────
  // Deliberately not "biggest margin" or "sum of the top 20": the former is
  // always some $2 item, the latter needs billions in capital. These describe
  // what the current filter actually offers.
  const stats = useMemo(() => {
    if (filtered.length === 0) return null;
    const best = filtered.reduce((a, b) => (b.profit > a.profit ? b : a));
    const margins = [...filtered].sort((a, b) => a.margin - b.margin);
    const median = margins[Math.floor(margins.length / 2)]?.margin ?? 0;
    const affordable = filtered.filter((d) => d.price <= 1_000_000).length;
    return { best, median, affordable };
  }, [filtered]);

  return (
    <div className="space-y-4">
      <TornKeyPanel
        hasKey={Boolean(apiKey)}
        enrichedCount={catalogue ? deals.filter((d) => d.enriched).length : 0}
        status={keyStatus}
        error={keyError}
        onSave={saveKey}
        onClear={clearKey}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-500">{refreshNote}</p>
        <div className="flex items-center gap-2">
          {apiKey && (
            <button
              onClick={refreshCatalogue}
              disabled={keyStatus === "loading"}
              className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-60"
            >
              {keyStatus === "loading" ? "Reloading items…" : "Reload item data"}
            </button>
          )}
          <button
            onClick={refreshPrices}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh prices"}
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Matching items" value={filtered.length.toLocaleString()} />
          <Stat label="Best single profit" value={money(stats.best.profit)} hint={stats.best.name} />
          <Stat label="Median margin" value={`${stats.median.toFixed(0)}%`} hint="half are above this" />
          <Stat label="Under $1m to buy" value={stats.affordable.toLocaleString()} hint="low capital needed" />
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="w-full rounded-lg border border-stone-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-stone-500">
            <Wallet size={12} /> Budget per item
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BUDGETS.map((b) => (
              <button
                key={b.label}
                onClick={() => setBudget(b.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  budget === b.value ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-500">
              Min margin %
            </span>
            <input
              type="number"
              min={0}
              value={minMargin || ""}
              onChange={(e) => setMinMargin(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm tabular-nums outline-none focus:border-amber-400"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-500">
              Exit route
            </span>
            <select
              value={exit}
              onChange={(e) => setExit(e.target.value as typeof exit)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
            >
              <option value="all">Any</option>
              <option value="Market">Market resale</option>
              <option value="Vendor">Vendor sell</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-stone-500">
              Item type
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={types.length === 0}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-400 disabled:bg-stone-50 disabled:text-stone-400"
            >
              <option value="all">{types.length ? "All types" : "Needs API key"}</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 py-16 text-center">
          <p className="text-sm text-stone-500">No items match those filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <SortHeader label="Item" sortKey="name" active={sort === "name"} dir={dir} onSort={toggleSort} align="left" />
                  <SortHeader label="Buy" sortKey="price" active={sort === "price"} dir={dir} onSort={toggleSort} />
                  <SortHeader label="Sell for" sortKey="value" active={sort === "value"} dir={dir} onSort={toggleSort} />
                  <SortHeader label="Profit" sortKey="profit" active={sort === "profit"} dir={dir} onSort={toggleSort} />
                  <SortHeader label="Margin" sortKey="margin" active={sort === "margin"} dir={dir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500">Exit</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((d) => (
                  <tr
                    key={d.itemId}
                    onClick={() => setOpenDeal(d)}
                    className="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-amber-50/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-900">{d.name}</p>
                      <p className="mt-0.5 text-xs text-stone-400">
                        {d.type !== "Unknown" ? d.type : ""}
                        {d.type !== "Unknown" && d.bazaars > 0 ? " · " : ""}
                        {d.bazaars > 0 ? `${d.bazaars} bazaars` : ""}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-stone-600">{money(d.price)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-stone-600">{money(d.value)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-emerald-600">+{money(d.profit)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-stone-600">{d.margin.toFixed(0)}%</td>
                    <td className="px-4 py-3"><ExitBadge deal={d} /></td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-amber-700">
                        {d.bazaars > 0 ? `${d.bazaars} bazaars` : "View"} <ArrowUpRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile — a table this wide is unusable on a phone */}
          <div className="divide-y divide-stone-100 md:hidden">
            {visible.map((d) => (
              <button key={d.itemId} onClick={() => setOpenDeal(d)}
                className="block w-full p-4 text-left active:bg-stone-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900">{d.name}</p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {money(d.price)} → {money(d.value)}
                      {d.bazaars > 0 && ` · ${d.bazaars} bazaars`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums text-emerald-600">+{money(d.profit)}</p>
                    <p className="text-xs tabular-nums text-stone-400">{d.margin.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="mt-2"><ExitBadge deal={d} /></div>
              </button>
            ))}
          </div>

          {filtered.length > visible.length && (
            <button
              onClick={() => setLimit((n) => n + 100)}
              className="w-full border-t border-stone-200 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              Show more ({(filtered.length - visible.length).toLocaleString()} remaining)
            </button>
          )}
        </div>
      )}

      <TornListingsDrawer key={openDeal?.itemId ?? "none"} deal={openDeal} onClose={() => setOpenDeal(null)} />

      <p className="text-xs leading-relaxed text-stone-500">
        Prices come from a public bazaar crawler and can be a few minutes stale — a
        listing may already be gone. Market-exit profit ignores listing fees and the
        wait to sell. A <span className="font-medium">Vendor ?</span> badge means no
        shop is known to stock that item, so the sell price may not be realisable.
      </p>
    </div>
  );
}

/** Hoisted: a component declared inside the parent is a new type every render. */
function SortHeader({
  label, sortKey, active, dir, align = "right", onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: Dir;
  align?: "left" | "right";
  onSort: (k: SortKey) => void;
}) {
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest transition ${
          active ? "text-stone-900" : "text-stone-500 hover:text-stone-700"
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />
        ) : (
          <ArrowUpDown size={11} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3.5">
      <p className="text-lg font-extrabold tabular-nums text-stone-900">{value}</p>
      <p className="mt-0.5 text-xs text-stone-500">{label}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-stone-400">{hint}</p>}
    </div>
  );
}

function ExitBadge({ deal }: { deal: TornDeal }) {
  const unverified = deal.exit === "Vendor" && !deal.vendorShop;
  return (
    <span
      title={
        deal.exit === "Vendor"
          ? deal.vendorShop
            ? `Sell to ${deal.vendorShop}${deal.vendorCountry ? ` (${deal.vendorCountry})` : ""}`
            : "Vendor price reported, but no shop is known to stock this item"
          : "Relist on the item market"
      }
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        deal.exit === "Vendor" ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"
      }`}
    >
      {deal.exit === "Vendor" ? <Store size={11} /> : <TrendingUp size={11} />}
      {deal.exit}{unverified && " ?"}
    </span>
  );
}
