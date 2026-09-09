"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Eye, Repeat, CalendarDays, TrendingUp, Info, Download, Sparkles, Loader2,
} from "lucide-react";

import type { PageAnalytics } from "@/lib/tools/visitors";

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

function dayString(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  return dayString(new Date(Date.now() - n * 86_400_000));
}

function StatCard({
  label, value, sub, icon: Icon, tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  tone?: "default" | "accent";
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-800 bg-stone-900 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-800">
        <Icon size={16} className={tone === "accent" ? "text-emerald-400" : "text-[#C87660]"} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tabular-nums text-white">{value}</p>
        <p className="mt-0.5 text-xs text-stone-500">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-stone-600">{sub}</p>}
      </div>
    </div>
  );
}

/**
 * Per-day bars.
 *
 * Each column is full height with the bar pinned to the bottom. The first
 * version set the row to `items-end`, which shrank every column to its content
 * — so the bar's percentage height had no definite parent to resolve against
 * and every bar computed to 0px.
 */
function Chart({ page, metric }: { page: PageAnalytics; metric: "visitors" | "visits" }) {
  const max = Math.max(1, ...page.series.map((p) => p[metric]));
  const empty = page.series.every((p) => p.visits === 0);

  if (empty) {
    return (
      <p className="py-12 text-center text-sm text-stone-600">
        No visits recorded for {page.label} in this range.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-40 items-stretch gap-[3px]">
        {page.series.map((p) => {
          const pct = (p[metric] / max) * 100;
          return (
            <div
              key={p.day}
              className="group flex h-full min-w-[4px] flex-1 flex-col justify-end"
              title={`${p.day} — ${p.visitors} visitors, ${p.visits} visits`}
            >
              <div
                className={`rounded-t transition-colors ${
                  p[metric] === 0
                    ? "bg-stone-800"
                    : "bg-stone-600 group-hover:bg-[#C87660]"
                }`}
                style={{ height: p[metric] === 0 ? "2px" : `${Math.max(2, pct)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-stone-600">
        <span>{page.series[0]?.day}</span>
        <span>peak {max}</span>
        <span>{page.series[page.series.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export default function AnalyticsClient({
  pages: initialPages,
  initialFrom,
  initialTo,
}: {
  pages: PageAnalytics[];
  initialFrom: string;
  initialTo: string;
}) {
  const [pages, setPages] = useState(initialPages);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState<"visitors" | "visits">("visitors");

  // Open on the busiest page rather than the first one. Defaulting to a page
  // with a single visitor renders a chart of flat zeroes, which reads as
  // broken even though it is accurate.
  const [active, setActive] = useState(
    () =>
      [...initialPages]
        .sort((a, b) => b.allTimeVisitors - a.allTimeVisitors)[0]?.slug ?? "",
  );

  const page = pages.find((p) => p.slug === active) ?? pages[0];

  const load = useCallback(async (nextFrom: string, nextTo: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/analytics?from=${nextFrom}&to=${nextTo}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (data?.ok) setPages(data.pages as PageAnalytics[]);
    } catch {
      // Leave the previous window on screen rather than blanking the dashboard.
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch whenever the range changes, debounced so typing a date does not
  // fire a query per keystroke.
  const [firstRun, setFirstRun] = useState(true);
  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      return;
    }
    const id = setTimeout(() => void load(from, to), 350);
    return () => clearTimeout(id);
  }, [from, to, load, firstRun]);

  function applyPreset(days: number) {
    setFrom(daysAgo(days));
    setTo(dayString(new Date()));
  }

  function exportCSV() {
    if (!page) return;
    const rows = [
      ["Day", "Unique visitors", "Total visits"],
      ...page.series.map((p) => [p.day, String(p.visitors), String(p.visits)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${page.slug}-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-stone-950 p-8">
        <p className="text-sm text-stone-500">No tracked pages configured.</p>
      </div>
    );
  }

  const recurringPct = page.visitors
    ? Math.round((page.recurring / page.visitors) * 100)
    : 0;
  const perVisitor = page.visitors ? (page.visits / page.visitors).toFixed(1) : "0";
  const activePreset = PRESETS.find(
    (p) => from === daysAgo(p.days) && to === dayString(new Date()),
  );

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin/leads" className="text-sm text-stone-500 transition hover:text-stone-300">
              ← Admin
            </Link>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              Page analytics
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Visitor counts for tracked tool pages, measured without cookies.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-stone-700 hover:text-white"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="mb-6 space-y-3 rounded-2xl border border-stone-800 bg-stone-900 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-stone-500">
              Page
            </span>
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActive(p.slug)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  p.slug === page.slug
                    ? "border-[#C87660] bg-[#C87660]/10 text-[#C87660]"
                    : "border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                {p.label}
                <span className="ml-1.5 text-[10px] text-stone-600">{p.allTimeVisitors}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-stone-500">
              Range
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => applyPreset(p.days)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  activePreset?.days === p.days
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-stone-800 text-stone-400 hover:text-stone-200"
                }`}
              >
                {p.label}
              </button>
            ))}

            <span className="mx-1 h-4 w-px bg-stone-800" />

            <label className="flex items-center gap-1.5 text-[11px] text-stone-500">
              From
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1.5 text-xs text-stone-200 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-1.5 text-[11px] text-stone-500">
              To
              <input
                type="date"
                value={to}
                min={from}
                max={dayString(new Date())}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-stone-800 bg-stone-950 px-2.5 py-1.5 text-xs text-stone-200 [color-scheme:dark] focus:border-blue-500 focus:outline-none"
              />
            </label>

            {loading && (
              <span className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <Loader2 size={12} className="animate-spin" /> updating
              </span>
            )}
          </div>
        </div>

        {/* ── Range stats ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Visitors in range"
            value={page.visitors.toLocaleString()}
            sub={`${page.allTimeVisitors.toLocaleString()} all time`}
            icon={Users}
          />
          <StatCard
            label="Visits in range"
            value={page.visits.toLocaleString()}
            sub={`${perVisitor} per visitor`}
            icon={Eye}
          />
          <StatCard
            label="Recurring in range"
            value={page.recurring.toLocaleString()}
            sub={`${recurringPct}% came back on another day`}
            icon={Repeat}
            tone="accent"
          />
          <StatCard
            label="New visitors"
            value={page.newVisitors.toLocaleString()}
            sub="first ever visit in this range"
            icon={Sparkles}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Today"
            value={page.todayVisitors.toLocaleString()}
            sub={`${page.todayVisits} visits · ${page.todayReturning} returning`}
            icon={CalendarDays}
          />
          <StatCard
            label="Busiest day in range"
            value={page.busiestDay ? page.busiestDay.visitors.toLocaleString() : "—"}
            sub={page.busiestDay ? page.busiestDay.day : "no data yet"}
            icon={TrendingUp}
          />
          <StatCard
            label="Recurring all time"
            value={page.allTimeRecurring.toLocaleString()}
            sub={`of ${page.allTimeVisitors.toLocaleString()} visitors ever`}
            icon={Repeat}
          />
        </div>

        {/* ── Chart ──────────────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white">
              {page.label} — daily {metric}
            </h2>
            <div className="flex items-center gap-2">
              {(["visitors", "visits"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                    metric === m
                      ? "border-stone-600 bg-stone-800 text-white"
                      : "border-stone-800 text-stone-500 hover:text-stone-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <Chart page={page} metric={metric} />
        </div>

        {/* How the numbers are produced, stated plainly — an analytics screen
            that does not explain its own definitions invites wrong decisions. */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
          <Info size={15} className="mt-0.5 shrink-0 text-stone-600" />
          <div className="space-y-2 text-xs leading-relaxed text-stone-500">
            <p>
              <span className="font-semibold text-stone-400">A visitor</span> is a distinct IP
              and browser combination, stored only as a keyed one-way digest. No cookie is set
              and no IP is retained, so this needs no consent banner — but it cannot tell two
              people apart on one office network, and treats the same person as new when their
              mobile IP changes.
            </p>
            <p>
              <span className="font-semibold text-stone-400">Recurring</span> means the same
              digest appeared on two or more separate UTC days within the selected range.
              Because a changed IP reads as a new visitor, this is a <em>floor</em> — the true
              number of people who came back is higher.
            </p>
            <p>
              <span className="font-semibold text-stone-400">Visits</span> counts every page
              load, including repeats by the same person on the same day. The per-visit counter
              was added on 8 September 2026; days before that record one visit per visitor, so
              early figures understate total visits. Obvious bot user-agents are excluded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
