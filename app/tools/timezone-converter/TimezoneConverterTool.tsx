"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Plus, RotateCcw, Clock } from "lucide-react";
import { searchTZ, type TZEntry } from "@/lib/timezone-data";

type Zone = { tz: string; label: string; sub: string };

const DEFAULTS: Zone[] = [
  { tz: "UTC",                label: "UTC",          sub: "Coordinated Universal Time" },
  { tz: "America/New_York",   label: "New York",     sub: "Eastern Time · US" },
  { tz: "Europe/London",      label: "London",       sub: "United Kingdom" },
  { tz: "Europe/Paris",       label: "Paris",        sub: "Central Europe" },
  { tz: "Asia/Kolkata",       label: "India",        sub: "IST · UTC+5:30" },
  { tz: "Asia/Dubai",         label: "Dubai",        sub: "UAE · UTC+4" },
  { tz: "Asia/Singapore",     label: "Singapore",    sub: "SGT · UTC+8" },
  { tz: "Asia/Tokyo",         label: "Tokyo",        sub: "Japan · UTC+9" },
  { tz: "Australia/Sydney",   label: "Sydney",       sub: "Australia East" },
  { tz: "America/Los_Angeles",label: "Los Angeles",  sub: "Pacific Time · US" },
];

const STORAGE_KEY = "codedmind-tz-v2";

// Number of slots on each side of NOW
const SIDE = 12;
const TOTAL = SIDE * 2 + 1; // 25 slots: -12h … NOW … +12h
const NOW_IDX = SIDE;        // index 12 = NOW column
const CELL_W = 52;           // px per column
const ROW_H  = 80;           // px per timezone row — must match EXACTLY on both sides
const HDR_H  = 56;           // px for the header row

// ── Pure helpers ──────────────────────────────────────────────────────────

function hourOfTs(tz: string, ts: number): number {
  // Returns 0–23 local hour for given timestamp in tz
  try {
    const s = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour: "numeric", hour12: false,
    }).format(new Date(ts));
    return parseInt(s, 10) % 24;
  } catch { return 0; }
}

function fmtTime(tz: string, ts: number, secs = false): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric", minute: "2-digit",
      ...(secs ? { second: "2-digit" } : {}),
      hour12: true,
    }).format(new Date(ts));
  } catch { return "—"; }
}

function fmtDate(tz: string, ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz, weekday: "short", month: "short", day: "numeric",
    }).format(new Date(ts));
  } catch { return "—"; }
}

function fmtShortDate(tz: string, ts: number): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz, month: "short", day: "numeric",
    }).format(new Date(ts));
  } catch { return ""; }
}

function fmtOffset(tz: string, ts: number): string {
  try {
    return (
      new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "shortOffset" })
        .formatToParts(new Date(ts))
        .find((p) => p.type === "timeZoneName")?.value ?? ""
    );
  } catch { return ""; }
}

// "3a" / "12p" / "9p" etc.
function h12(utcHour: number): string {
  const n = ((utcHour % 24) + 24) % 24;
  if (n === 0) return "12a";
  if (n === 12) return "12p";
  return n < 12 ? `${n}a` : `${n - 12}p`;
}

// Cell background color based on LOCAL hour in that timezone row
function cellBg(localH: number, sel: boolean, isNow: boolean): string {
  if (sel)   return "bg-amber-500";
  if (isNow) return "bg-amber-400";
  const h = ((localH % 24) + 24) % 24;
  if (h < 6 || h >= 22) return "bg-slate-800";  // sleeping
  if (h < 9 || h >= 20) return "bg-slate-500";  // early/late
  return "bg-stone-100";                          // work day
}

function cellFg(localH: number, sel: boolean, isNow: boolean): string {
  if (sel || isNow) return "text-white";
  const h = ((localH % 24) + 24) % 24;
  if (h < 6 || h >= 22) return "text-slate-500";
  if (h < 9 || h >= 20) return "text-slate-300";
  return "text-stone-600";
}

// ── Component ─────────────────────────────────────────────────────────────

export default function TimezoneConverterPage() {
  const [ianaZones, setIanaZones]   = useState<string[]>([]);
  const [zones, setZones]           = useState<Zone[]>(DEFAULTS);
  const [tick, setTick]             = useState(() => new Date());
  const [selSlot, setSelSlot]       = useState<number | null>(null);
  const [query, setQuery]           = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const dropRef   = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 25 timestamps: current UTC hour ±12. Computed once on mount.
  const [slots] = useState<number[]>(() => {
    const nowH = Math.floor(Date.now() / 3600000) * 3600000;
    return Array.from({ length: TOTAL }, (_, i) => nowH + (i - SIDE) * 3600000);
  });

  // Pre-compute which UTC slot index is "now" as time advances
  const nowIdx = useMemo(() => {
    const curH = Math.floor(tick.getTime() / 3600000) * 3600000;
    const idx = slots.indexOf(curH);
    return idx >= 0 ? idx : NOW_IDX;
  }, [tick, slots]);

  // Precomputed local hours per zone × slot (static, only changes when zones list changes)
  const cellData = useMemo(
    () => zones.map((z) => ({ ...z, hours: slots.map((ts) => hourOfTs(z.tz, ts)) })),
    [zones, slots]
  );

  // Date boundary: which columns cross UTC midnight → show a date label above
  const dateMark = useMemo<(string | null)[]>(() => {
    return slots.map((ts, i) => {
      if (i === 0) return null;
      const prev = new Date(slots[i - 1]).getUTCDate();
      const cur  = new Date(ts).getUTCDate();
      return prev !== cur ? fmtShortDate("UTC", ts) : null;
    });
  }, [slots]);

  // Reference timestamp for left panel: live tick OR the clicked slot's midpoint
  const refTs = selSlot !== null ? slots[selSlot] : tick.getTime();

  // ── Effects ──────────────────────────────────────────────────────────────

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // IANA zones list
  useEffect(() => {
    try { setIanaZones(Intl.supportedValuesOf("timeZone")); } catch { setIanaZones([]); }
  }, []);

  // Load persisted zones from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Zone[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setZones(parsed);
      }
    } catch {}
  }, []);

  // Persist whenever zones change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(zones)); } catch {}
  }, [zones]);

  // Auto-scroll to center the NOW column on first render
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = NOW_IDX * CELL_W - el.clientWidth / 2 + CELL_W / 2;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Click-outside closes search dropdown
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const toggleSlot = (i: number) => setSelSlot((p) => (p === i ? null : i));
  const addZone    = (e: TZEntry) => {
    setZones((p) => [...p, { tz: e.tz, label: e.label, sub: e.sub }]);
    setQuery(""); setShowDrop(false); inputRef.current?.focus();
  };
  const removeZone = (tz: string) => setZones((p) => p.filter((z) => z.tz !== tz));
  const reset      = () => { setZones(DEFAULTS); setSelSlot(null); try { localStorage.removeItem(STORAGE_KEY); } catch {} };
  const jumpToNow  = () => {
    setSelSlot(null);
    if (scrollRef.current)
      scrollRef.current.scrollLeft = nowIdx * CELL_W - scrollRef.current.clientWidth / 2 + CELL_W / 2;
  };

  // Search results
  const selectedSet = useMemo(() => new Set(zones.map((z) => z.tz)), [zones]);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchTZ(query, ianaZones).filter((r) => !selectedSet.has(r.tz));
  }, [query, ianaZones, selectedSet]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-6">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <div className="flex items-start justify-between mt-3 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Timezone Converter</h1>
            <p className="text-stone-500 mt-1 text-sm">
              Click any cell to pin a moment across all rows. Dark = sleeping · Light = working.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={jumpToNow} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Clock size={12} /> Jump to now
            </button>
            <button onClick={reset} className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Main grid ═══ */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm mb-3">
        <div className="flex">

          {/* ── Left sticky panel (labels) ── */}
          <div className="w-[210px] shrink-0 border-r-2 border-stone-200 bg-white">

            {/* Header cell */}
            <div style={{ height: HDR_H }} className="border-b-2 border-stone-200 flex flex-col justify-center px-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Location</p>
              <p className="text-[10px] text-stone-400 font-mono mt-0.5 leading-none">
                <span suppressHydrationWarning>
                  {selSlot !== null
                    ? `${fmtShortDate("UTC", slots[selSlot])} ${h12(new Date(slots[selSlot]).getUTCHours())} UTC`
                    : tick.toISOString().slice(0, 16).replace("T", " ") + " UTC"}
                </span>
              </p>
            </div>

            {/* One row per timezone */}
            {cellData.map(({ tz, label, sub }) => (
              <div key={tz} style={{ height: ROW_H }} className="flex items-center px-4 border-b border-stone-100 last:border-b-0 overflow-hidden">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-stone-800 truncate leading-none">{label}</p>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5 leading-none">{sub}</p>
                    </div>
                    <button
                      onClick={() => removeZone(tz)}
                      title={`Remove ${label}`}
                      className="shrink-0 p-0.5 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded transition ml-1 mt-0.5"
                    >
                      <X size={11} />
                    </button>
                  </div>
                  <p className="text-[14px] font-mono font-bold text-stone-900 mt-2 leading-none">
                    <span suppressHydrationWarning>{selSlot !== null ? fmtTime(tz, refTs) : fmtTime(tz, refTs, true)}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span suppressHydrationWarning className="text-[10px] text-stone-400">{fmtDate(tz, refTs)}</span>
                    <span suppressHydrationWarning className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1 rounded">{fmtOffset(tz, refTs)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Scrollable timeline ── */}
          <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
            <div style={{ width: TOTAL * CELL_W, minWidth: TOTAL * CELL_W }}>

              {/* Column header row */}
              <div className="flex border-b-2 border-stone-200" style={{ height: HDR_H }}>
                {slots.map((ts, i) => {
                  const isSel  = i === selSlot;
                  const isNow  = i === nowIdx;
                  const utcH   = new Date(ts).getUTCHours();
                  const mark   = dateMark[i];

                  return (
                    <button
                      key={i}
                      onClick={() => toggleSlot(i)}
                      style={{ width: CELL_W }}
                      className={[
                        "shrink-0 flex flex-col items-center justify-center border-l border-stone-200 first:border-l-0 select-none transition",
                        isSel  ? "bg-amber-500 text-white"
                        : isNow ? "bg-amber-400 text-white"
                        : "bg-stone-50 text-stone-400 hover:bg-stone-100",
                      ].join(" ")}
                    >
                      {isNow ? (
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 opacity-90">NOW</span>
                      ) : mark ? (
                        <span className="text-[9px] font-semibold leading-none mb-0.5 text-amber-600">{mark}</span>
                      ) : (
                        <span className="h-[12px]" />
                      )}
                      <span className="text-[12px] font-mono font-bold leading-none">{h12(utcH)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Timezone data rows */}
              {cellData.map(({ tz, hours }) => (
                <div key={tz} className="flex border-b border-stone-100 last:border-b-0" style={{ height: ROW_H }}>
                  {hours.map((lh, i) => {
                    const isSel  = i === selSlot;
                    const isNow  = selSlot === null && i === nowIdx;
                    // Show local date boundary within this timezone's row
                    const prevLh = i > 0 ? hours[i - 1] : -1;
                    const crosses = prevLh !== -1 && prevLh > lh && lh < 4; // crossed midnight locally

                    return (
                      <button
                        key={i}
                        onClick={() => toggleSlot(i)}
                        style={{ width: CELL_W, height: ROW_H }}
                        className={[
                          "shrink-0 relative flex flex-col items-center justify-center border-l border-black/[0.05] first:border-l-0",
                          "select-none transition hover:opacity-80",
                          cellBg(lh, isSel, isNow),
                          cellFg(lh, isSel, isNow),
                        ].join(" ")}
                      >
                        {/* Tiny date-flip indicator when local midnight is crossed */}
                        {crosses && !isSel && !isNow && (
                          <span className="text-[8px] leading-none mb-0.5 opacity-60 font-semibold">
                            {fmtShortDate(tz, slots[i])}
                          </span>
                        )}
                        <span className="text-[12px] font-mono font-bold leading-none">{h12(lh)}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

            </div>
          </div>

        </div>

        {/* Status / legend bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-stone-100 bg-stone-50 gap-4">
          <p suppressHydrationWarning className="text-[11px] font-mono text-stone-400 min-w-0 truncate">
            {selSlot !== null ? (
              <>
                <span className="text-amber-600 font-bold">
                  {fmtShortDate("UTC", slots[selSlot])} · {h12(new Date(slots[selSlot]).getUTCHours())} UTC
                </span>
                {" pinned — "}
                <button onClick={() => setSelSlot(null)} className="text-amber-600 font-bold hover:text-amber-700 underline underline-offset-2 transition">
                  unpin
                </button>
              </>
            ) : (
              <>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5 align-middle" />
                Live · {tick.toISOString().replace("T", " ").replace(/\.\d+Z$/, "")} UTC
              </>
            )}
          </p>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {[
              { bg: "bg-slate-800", label: "Sleep" },
              { bg: "bg-slate-500", label: "Early/Late" },
              { bg: "bg-stone-100 border border-stone-200", label: "Work day" },
              { bg: "bg-amber-400", label: "Now" },
              { bg: "bg-amber-500", label: "Pinned" },
            ].map(({ bg, label }) => (
              <span key={label} className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm shrink-0 ${bg}`} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <p className="text-[11px] text-stone-400 text-center mb-5">
        ← scroll to see past · click any cell to pin · scroll for future →
      </p>

      {/* ═══ Add / manage section ═══ */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-stone-700">
          Add timezone
          <span className="ml-2 text-xs font-normal text-stone-400">({zones.length} selected · saved automatically)</span>
        </p>
      </div>

      <div className="relative" ref={dropRef}>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-3 focus-within:border-amber-400 transition shadow-sm">
          <Search size={15} className="text-stone-300 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onKeyDown={(e) => e.key === "Escape" && (setShowDrop(false), setQuery(""))}
            placeholder='Search city, country, state or abbreviation — "New York", "India", "EST", "JST"…'
            className="flex-1 text-sm bg-transparent focus:outline-none text-stone-800 placeholder:text-stone-300"
          />
          {query && (
            <button onClick={() => { setQuery(""); setShowDrop(false); }} className="text-stone-300 hover:text-stone-600 transition">
              <X size={14} />
            </button>
          )}
        </div>

        {showDrop && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-20 max-h-72 overflow-y-auto">
            {results.length === 0 ? (
              <p className="px-4 py-4 text-sm text-stone-400">
                No results for &ldquo;{query}&rdquo; — try a city, country, US state, or abbreviation like EST or IST.
              </p>
            ) : (
              results.map((entry) => (
                <button
                  key={entry.tz}
                  onMouseDown={(e) => { e.preventDefault(); addZone(entry); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 text-left transition border-b border-stone-50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 leading-none">{entry.label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{entry.sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span suppressHydrationWarning className="text-xs font-mono text-stone-400">
                      {fmtTime(entry.tz, tick.getTime())}
                    </span>
                    <Plus size={13} className="text-stone-300" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400 mt-4 text-center">
        All conversions run in your browser · {ianaZones.length || "500+"}+ IANA timezones · DST-aware · No data sent anywhere
      </p>

    </main>
  );
}
