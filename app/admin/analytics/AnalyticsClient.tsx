"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Eye, Repeat, CalendarDays, TrendingUp, Info, Download } from "lucide-react";

import type { PageAnalytics } from "@/lib/tools/visitors";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-stone-800 bg-stone-900 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-800">
        <Icon size={16} className="text-[#C87660]" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tabular-nums text-white">{value}</p>
        <p className="mt-0.5 text-xs text-stone-500">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-stone-600">{sub}</p>}
      </div>
    </div>
  );
}

/** Per-day bars. Height is relative to the busiest day in the window. */
function Sparkline({ page }: { page: PageAnalytics }) {
  const max = Math.max(1, ...page.series.map((p) => p.visits));
  if (page.series.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-600">
        No visits recorded yet in this window.
      </p>
    );
  }
  return (
    <div>
      <div className="flex h-32 items-end gap-1 overflow-x-auto">
        {page.series.map((p) => (
          <div
            key={p.day}
            className="group relative flex min-w-[8px] flex-1 flex-col justify-end"
            title={`${p.day} — ${p.visitors} visitors, ${p.visits} visits`}
          >
            <div
              className="rounded-t bg-stone-700 transition-colors group-hover:bg-[#C87660]"
              style={{ height: `${Math.max(3, (p.visits / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-stone-600">
        <span>{page.series[0]?.day}</span>
        <span>{page.series[page.series.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export default function AnalyticsClient({ pages }: { pages: PageAnalytics[] }) {
  const [active, setActive] = useState(pages[0]?.slug ?? "");
  const page = pages.find((p) => p.slug === active) ?? pages[0];

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
    a.download = `${page.slug}-visitors.csv`;
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

  // Share of all-time visitors who came back on a separate day.
  const recurringPct = page.uniqueVisitors
    ? Math.round((page.recurringVisitors / page.uniqueVisitors) * 100)
    : 0;
  const visitsPerVisitor = page.uniqueVisitors
    ? (page.totalVisits / page.uniqueVisitors).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
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

        {pages.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {pages.map((p) => (
              <button
                key={p.slug}
                onClick={() => setActive(p.slug)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  p.slug === page.slug
                    ? "border-[#C87660] bg-[#C87660]/10 text-[#C87660]"
                    : "border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Unique visitors"
            value={page.uniqueVisitors.toLocaleString()}
            sub="all time"
            icon={Users}
          />
          <StatCard
            label="Total visits"
            value={page.totalVisits.toLocaleString()}
            sub={`${visitsPerVisitor} per visitor`}
            icon={Eye}
          />
          <StatCard
            label="Recurring visitors"
            value={page.recurringVisitors.toLocaleString()}
            sub={`${recurringPct}% came back on another day`}
            icon={Repeat}
          />
          <StatCard
            label="Today"
            value={page.todayVisitors.toLocaleString()}
            sub={`${page.todayVisits} visits · ${page.todayReturning} returning`}
            icon={CalendarDays}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Last 7 days" value={page.last7.toLocaleString()} sub="unique visitors" icon={TrendingUp} />
          <StatCard label="Last 30 days" value={page.last30.toLocaleString()} sub="unique visitors" icon={TrendingUp} />
          <StatCard
            label="Busiest day"
            value={page.busiestDay ? page.busiestDay.visitors.toLocaleString() : "—"}
            sub={page.busiestDay ? page.busiestDay.day : "no data yet"}
            icon={CalendarDays}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-white">Daily visits — last 30 days</h2>
            <p className="text-[11px] text-stone-600">Hover a bar for the exact figures</p>
          </div>
          <Sparkline page={page} />
        </div>

        {/* How the numbers are produced, stated plainly — an analytics screen
            that does not explain its own definitions invites wrong decisions. */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-stone-800 bg-stone-900/50 p-5">
          <Info size={15} className="mt-0.5 shrink-0 text-stone-600" />
          <div className="space-y-2 text-xs leading-relaxed text-stone-500">
            <p>
              <span className="font-semibold text-stone-400">A visitor</span> is a distinct
              IP and browser combination, stored only as a keyed one-way digest. No cookie is
              set and no IP is retained, so this needs no consent banner — but it also cannot
              tell two people apart on one office network, and treats the same person as new
              when their mobile IP changes.
            </p>
            <p>
              <span className="font-semibold text-stone-400">Recurring</span> means the same
              digest appeared on two or more separate UTC days. Because a changed IP reads as
              a new visitor, this is a <em>floor</em> — the true number of people who came
              back is higher.
            </p>
            <p>
              <span className="font-semibold text-stone-400">Total visits</span> counts every
              page load, including repeat loads by the same person on the same day. Obvious
              bot user-agents are excluded before anything is recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
