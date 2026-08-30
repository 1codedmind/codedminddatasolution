"use client";

import { useState, useMemo, useCallback, useEffect, useSyncExternalStore } from "react";
import {
  Copy, Check, Trash2, Download, Search, Save, RotateCcw, AlertTriangle, Sparkles,
  CaseUpper, CaseLower, CaseSensitive, Pilcrow, Eraser, ListX, CopyMinus, ShieldAlert,
  ArrowDownAZ, ArrowUpAZ, ArrowLeftRight, SlidersHorizontal, X, Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { analyse, censorWord, formatDuration } from "@/lib/tools/textStats";
import { PLATFORMS, measureFor, countGraphemes, smsInfo } from "@/lib/tools/platformLimits";
import { audienceById, judge } from "@/lib/tools/audiences";
import { styleReport, analyseFocusKeyword } from "@/lib/tools/writingChecks";
import SocialPreview from "@/components/tools/SocialPreview";
import WordCounterFilters, {
  DEFAULT_SETTINGS,
  type Settings,
} from "@/components/tools/WordCounterFilters";

const STORAGE_TEXT = "cm_wc_text";
const STORAGE_SETTINGS = "cm_wc_settings";

/**
 * Transform actions.
 *
 * Each carries an icon: a row of text-only buttons reads as a wall of jargon,
 * whereas the glyph tells you what the button does before you read the label.
 */
const TRANSFORMS: { group: string; items: { label: string; title: string; Icon: LucideIcon; fn: (s: string) => string }[] }[] = [
  {
    group: "Case",
    items: [
      { label: "UPPER", title: "UPPERCASE", Icon: CaseUpper, fn: (s) => s.toUpperCase() },
      { label: "lower", title: "lowercase", Icon: CaseLower, fn: (s) => s.toLowerCase() },
      { label: "Title", title: "Title Case", Icon: CaseSensitive, fn: (s) => s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase()) },
      { label: "Sentence", title: "Sentence case", Icon: Pilcrow, fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()) },
    ],
  },
  {
    group: "Clean",
    items: [
      { label: "Fix spaces", title: "Collapse repeated spaces and blank lines", Icon: Eraser, fn: (s) => s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() },
      { label: "No empties", title: "Remove empty lines", Icon: ListX, fn: (s) => s.split("\n").filter((l) => l.trim()).join("\n") },
      { label: "No dupes", title: "Remove duplicate lines", Icon: CopyMinus, fn: (s) => [...new Set(s.split("\n"))].join("\n") },
      { label: "Censor", title: "Mask profanity", Icon: ShieldAlert, fn: (s) => s.replace(/\b[\w']+\b/g, censorWord) },
    ],
  },
  {
    group: "Order",
    items: [
      { label: "A–Z", title: "Sort lines A to Z", Icon: ArrowDownAZ, fn: (s) => s.split("\n").sort((a, b) => a.localeCompare(b)).join("\n") },
      { label: "Z–A", title: "Sort lines Z to A", Icon: ArrowUpAZ, fn: (s) => s.split("\n").sort((a, b) => b.localeCompare(a)).join("\n") },
      { label: "Reverse", title: "Reverse word order", Icon: ArrowLeftRight, fn: (s) => s.split(/\s+/).reverse().join(" ") },
    ],
  },
];

function escRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function loadSettings(): Settings {
  const raw = readStored(STORAGE_SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }; }
  catch { return DEFAULT_SETTINGS; }
}

/**
 * `false` while server-rendering and during hydration, `true` afterwards, so
 * stored state can seed useState without a hydration mismatch.
 */
const subscribeNever = () => () => {};
function useHydrated() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

const VERDICT_TONE = {
  "on-target": { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", marker: "bg-emerald-600" },
  "too-simple": { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", marker: "bg-blue-600" },
  "too-complex": { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", marker: "bg-amber-600" },
  unknown: { text: "text-stone-500", bg: "bg-stone-50", border: "border-stone-200", marker: "bg-stone-400" },
} as const;

function GoalRing({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-stone-100" />
      <circle
        cx="32" cy="32" r={r} fill="none" strokeWidth="5" strokeLinecap="round" stroke="currentColor"
        className={pct >= 100 ? "text-emerald-500" : "text-amber-500"}
        strokeDasharray={c}
        strokeDashoffset={c - (Math.min(100, pct) / 100) * c}
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
    </svg>
  );
}

type Tab = "keywords" | "phrases" | "sentences" | "style";

export default function WordCounterTool() {
  const [text, setText] = useState(() => readStored(STORAGE_TEXT) ?? "");
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("keywords");
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [saved, setSaved] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);

  const hydrated = useHydrated();
  const [hadStoredDraft] = useState(() => Boolean(readStored(STORAGE_TEXT)));

  const display = hydrated ? text : "";
  const restored = hydrated && hadStoredDraft;

  const audience = audienceById(settings.audienceId);
  const options = useMemo(
    () => ({
      wpm: settings.wpmOverride ?? audience.wpm,
      sentenceLimit: audience.sentenceLimit,
      minKeywordLength: settings.minKeywordLength,
      includeStopWords: settings.includeStopWords,
    }),
    [settings.wpmOverride, settings.minKeywordLength, settings.includeStopWords, audience],
  );

  const stats = useMemo(() => analyse(display, options), [display, options]);
  const graphemes = useMemo(() => countGraphemes(display), [display]);
  const sms = useMemo(() => smsInfo(display), [display]);
  const style = useMemo(() => styleReport(display), [display]);
  const focus = useMemo(
    () => analyseFocusKeyword(display, settings.focusKeyword, stats?.words ?? 0),
    [display, settings.focusKeyword, stats?.words],
  );
  const verdict = stats ? judge(stats.grade, stats.fkScore, audience, stats.words) : null;

  // Autosave, debounced — the reason someone returns tomorrow.
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      try {
        if (text) window.localStorage.setItem(STORAGE_TEXT, text);
        else window.localStorage.removeItem(STORAGE_TEXT);
        setSaved(true);
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(id);
  }, [text, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings, hydrated]);

  useEffect(() => {
    if (!restored) return;
    const id = setTimeout(() => setBadgeVisible(false), 5000);
    return () => clearTimeout(id);
  }, [restored]);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(id);
  }, [saved]);

  const matchCount = useMemo(() => {
    if (!findText || !display) return 0;
    try { return (display.match(new RegExp(escRe(findText), matchCase ? "g" : "gi")) || []).length; }
    catch { return 0; }
  }, [display, findText, matchCase]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const handleDownload = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text]);

  function handleReplaceAll() {
    if (!findText) return;
    try { setText(text.replace(new RegExp(escRe(findText), matchCase ? "g" : "gi"), replaceText)); }
    catch { /* noop */ }
  }

  const words = stats?.words ?? 0;
  const goalPct = settings.goal > 0 ? Math.round((words / settings.goal) * 100) : 0;
  const tone = verdict ? VERDICT_TONE[verdict.status] : null;

  // Target band, drawn with one band-width of headroom either side.
  const [gLo, gHi] = audience.grade;
  const span = Math.max(1, gHi - gLo);
  const bandMin = gLo - span;
  const bandMax = gHi + span;
  const toPct = (v: number) => Math.max(0, Math.min(100, ((v - bandMin) / (bandMax - bandMin)) * 100));

  return (
    <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-8">

      {/* ── Filter rail ──────────────────────────────────────────────────── */}
      <aside className="mb-4 lg:mb-0 lg:sticky lg:top-24">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="mb-2 flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-blue-600" />
            Filters · {audience.name}
          </span>
          {filtersOpen ? <X size={15} /> : <span className="text-xs text-stone-400">Change</span>}
        </button>
        <div className={filtersOpen ? "block" : "hidden lg:block"}>
          <WordCounterFilters settings={settings} onChange={setSettings} />
        </div>
      </aside>

      <div className="min-w-0 space-y-4">

        {/* ── Hero stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:gap-4 sm:p-5">
            {settings.goal > 0 && (
              <div className="relative">
                <GoalRing pct={goalPct} />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-stone-500">
                  {Math.min(999, goalPct)}%
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-3xl font-extrabold leading-none tabular-nums text-stone-950 sm:text-4xl">
                {words.toLocaleString()}
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
                {settings.goal > 0 ? (
                  <><Target size={11} /> of {settings.goal.toLocaleString()}</>
                ) : "Words"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <p className="text-3xl font-extrabold leading-none tabular-nums text-stone-950 sm:text-4xl">
              {graphemes.toLocaleString()}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Characters</p>
            <p className="mt-0.5 text-[11px] tabular-nums text-stone-400">
              {(stats?.charsNoSpaces ?? 0).toLocaleString()} without spaces
              {stats && stats.chars !== graphemes && <> · {stats.chars.toLocaleString()} UTF-16</>}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <p className="text-2xl font-extrabold leading-none text-stone-950 sm:text-4xl">
              {stats ? formatDuration(stats.readingSec) : "0 sec"}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Reading time</p>
            <p className="mt-0.5 text-[11px] text-stone-400">
              at {options.wpm} wpm · {stats ? formatDuration(stats.speakSec) : "0 sec"} aloud
            </p>
          </div>

          {/* Readability judged against the chosen audience, not an absolute. */}
          <div className={`rounded-2xl border p-4 sm:p-5 ${tone ? `${tone.bg} ${tone.border}` : "border-stone-200 bg-white"}`}>
            <p className={`text-xl font-extrabold leading-tight ${tone ? tone.text : "text-stone-300"}`}>
              {verdict ? verdict.label : "—"}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
              for {audience.name}
            </p>
            {stats && verdict?.status !== "unknown" && (
              <div className="mt-3">
                <div className="relative h-2 rounded-full bg-white/70 ring-1 ring-inset ring-stone-200">
                  <span
                    className="absolute h-full rounded-full bg-emerald-200"
                    style={{ left: `${toPct(gLo)}%`, width: `${toPct(gHi) - toPct(gLo)}%` }}
                  />
                  <span
                    className={`absolute -top-0.5 h-3 w-1.5 rounded-sm ${tone?.marker ?? "bg-stone-900"}`}
                    style={{ left: `calc(${toPct(stats.grade)}% - 3px)` }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-stone-400">
                  <span>grade {gLo}</span>
                  <span className="font-bold text-stone-600">you: {stats.grade}{stats.gradeCapped ? "+" : ""}</span>
                  <span>{gHi}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {verdict && tone && (
          <p className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${tone.bg} ${tone.border} ${tone.text}`}>
            {verdict.advice}
          </p>
        )}

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFindReplace((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              showFindReplace ? "border-amber-300 bg-amber-50 text-amber-700" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Search size={13} /> Find &amp; replace
          </button>

          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <span className="flex items-center gap-1.5 text-[11px] text-stone-400">
              {saved ? <><Check size={12} className="text-emerald-500" /> Saved</> : <><Save size={12} /> Saves in this browser</>}
            </span>
            <button onClick={handleCopy} disabled={!display}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={handleDownload} disabled={!display}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={13} /> Save .txt
            </button>
            <button
              onClick={() => { if (text && confirm("Clear all text? This cannot be undone.")) setText(""); }}
              disabled={!display}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40">
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {showFindReplace && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <input type="text" placeholder="Find…" value={findText} onChange={(e) => setFindText(e.target.value)}
                className="min-w-32 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none" />
              <input type="text" placeholder="Replace with…" value={replaceText} onChange={(e) => setReplaceText(e.target.value)}
                className="min-w-32 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none" />
              <label className="flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap text-xs text-stone-600">
                <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded" />
                Match case
              </label>
              <button onClick={handleReplaceAll} disabled={!findText || !display}
                className="whitespace-nowrap rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-40">
                Replace all
              </button>
              {findText && (
                <span className="whitespace-nowrap text-xs text-stone-500">
                  {matchCount === 0 ? "No matches" : `${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Editor ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <textarea
            className="min-h-[20rem] w-full resize-y rounded-xl border border-stone-200 bg-white p-5 text-base leading-relaxed text-stone-800 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            placeholder="Start typing, or paste your text here…"
            value={display}
            onChange={(e) => setText(e.target.value)}
            spellCheck
          />
          {restored && badgeVisible && display && (
            <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-stone-900/85 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
              <RotateCcw size={11} /> Restored your last draft
            </span>
          )}
        </div>

        {/* ── Transforms ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          {TRANSFORMS.map(({ group, items }) => (
            <div key={group} className="flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-[11px] font-bold uppercase tracking-wide text-stone-400">{group}</span>
              {items.map(({ label, title, Icon, fn }) => (
                <button
                  key={title}
                  onClick={() => setText((prev) => fn(prev))}
                  title={title}
                  disabled={!display}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon size={13} className="text-stone-400" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ── Secondary stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
          {[
            { label: "Sentences", value: (stats?.sentences ?? 0).toLocaleString() },
            { label: "Paragraphs", value: (stats?.paragraphs ?? 0).toLocaleString() },
            { label: "Lines", value: (stats?.lines ?? 0).toLocaleString() },
            { label: "Unique words", value: (stats?.uniqueWords ?? 0).toLocaleString() },
            { label: "Avg sentence", value: stats ? `${stats.avgSentenceLen} words` : "—" },
            { label: "Avg word", value: stats ? `${stats.avgWordLen} chars` : "—" },
            { label: "Pages", value: stats?.pages ?? "0" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-center">
              <p className="truncate text-base font-bold tabular-nums text-stone-800">{value}</p>
              <p className="mt-0.5 text-[11px] text-stone-400">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Platform limits ────────────────────────────────────────────── */}
        {settings.showLimits && (
          <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-stone-800">Will it fit?</h3>
              <p className="text-[11px] text-stone-400">Each platform measured with its own counting rules</p>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
              {PLATFORMS.map((platform) => {
                const used = measureFor(display, platform);
                const pct = Math.min(100, Math.round((used / platform.max) * 100));
                const over = used > platform.max;
                const close = !over && pct >= 85;
                const folded = platform.truncateAt != null && used > platform.truncateAt;
                return (
                  <div key={platform.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-stone-600">{platform.name}</span>
                      <span className={`shrink-0 text-xs tabular-nums ${over ? "font-semibold text-red-600" : close ? "text-amber-600" : "text-stone-400"}`}>
                        {over ? `${(used - platform.max).toLocaleString()} over` : `${(platform.max - used).toLocaleString()} left`}
                      </span>
                    </div>
                    <div className="relative h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : close ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                      {platform.truncateAt != null && platform.truncateAt < platform.max && (
                        <span aria-hidden="true" className="absolute top-0 h-full w-px bg-stone-400"
                          style={{ left: `${(platform.truncateAt / platform.max) * 100}%` }} />
                      )}
                    </div>
                    {platform.id === "sms" && sms.segments > 1 && (
                      <p className="mt-1 text-[10px] text-amber-600">
                        {sms.segments} messages · {sms.encoding}
                        {sms.encoding === "UCS-2" && " (an emoji or curly quote cut capacity to 70)"}
                      </p>
                    )}
                    {folded && platform.id !== "sms" && (
                      <p className="mt-1 text-[10px] text-stone-400">
                        Cut at {platform.truncateAt!.toLocaleString()} in the feed
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] leading-relaxed text-stone-400">
              Counts respect each platform&rsquo;s real rules: X weights links at 23 and emoji at 2, SMS
              switches encoding when you use a character outside the GSM alphabet, and the grey marker
              shows where a feed collapses the post behind &ldquo;see more&rdquo;.
            </p>
          </div>
        )}

        {/* ── Live previews ──────────────────────────────────────────────── */}
        {settings.showPreviews && (
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-stone-800">See it before you post it</h3>
              <p className="text-[11px] text-stone-400">Truncated exactly as each platform would</p>
            </div>
            <SocialPreview text={display} />
          </div>
        )}

        {/* ── Analysis tabs ──────────────────────────────────────────────── */}
        {settings.showAnalysis && (
          <div className="rounded-xl border border-stone-200 bg-white">
            <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-100 px-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {([["keywords", "Keywords"], ["phrases", "Phrases"], ["sentences", "Long sentences"], ["style", "Style"]] as [Tab, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`shrink-0 rounded-t-lg px-3.5 py-2 text-xs font-bold transition-colors ${tab === id ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:text-stone-600"}`}>
                  {label}
                  {id === "sentences" && stats && stats.hardSentences.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                      {stats.hardSentences.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {!stats && (
                <p className="py-6 text-center text-sm text-stone-400">
                  Start typing to see keyword density, repeated phrases, and sentences worth shortening.
                </p>
              )}

              {stats && tab === "keywords" && (
                stats.keywords.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">No repeated keywords yet — keep writing.</p>
                ) : (
                  <>
                    <div className="space-y-2.5">
                      {(showAllKeywords ? stats.keywords : stats.keywords.slice(0, 10)).map(({ term, count, pct, barWidth }) => (
                        <div key={term} className="flex items-center gap-3">
                          <span className="w-32 shrink-0 truncate text-sm font-medium text-stone-700">{term}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${barWidth}%` }} />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-stone-500">{count}×</span>
                          <span className="w-12 shrink-0 text-right text-xs tabular-nums text-stone-400">{pct}%</span>
                        </div>
                      ))}
                    </div>
                    {stats.keywords.length > 10 && (
                      <button onClick={() => setShowAllKeywords((v) => !v)}
                        className="mt-4 text-xs font-semibold text-stone-400 transition-colors hover:text-stone-700">
                        {showAllKeywords ? "Show fewer" : `Show all ${stats.keywords.length}`}
                      </button>
                    )}
                    <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                      {settings.includeStopWords ? "Filler words included" : "Filler words excluded"} ·{" "}
                      {settings.minKeywordLength}+ characters. For SEO, a main keyword usually sits between 1% and 2%.
                    </p>
                  </>
                )
              )}

              {stats && tab === "phrases" && (
                stats.phrases.length === 0 ? (
                  <p className="py-6 text-center text-sm text-stone-400">No phrase appears more than once yet.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {stats.phrases.map(({ term, count }) => (
                        <span key={term} className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
                          {term}
                          <span className="rounded bg-white px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-stone-500">{count}×</span>
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                      Two- and three-word phrases you have repeated — useful for spotting tics, and for the
                      long-tail phrases search engines match.
                    </p>
                  </>
                )
              )}

              {stats && tab === "style" && style && (
                <div className="space-y-5">
                  {/* Focus keyword — only when the writer has set one. */}
                  {focus && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold text-blue-900">
                        <Search size={13} className="text-blue-600" />
                        &ldquo;{focus.term}&rdquo;
                        <span className="text-xs font-normal text-blue-700">
                          {focus.count}× · {focus.density}% density
                        </span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px]">
                        <span className={focus.inFirstLine ? "text-emerald-700" : "text-stone-500"}>
                          {focus.inFirstLine ? "✓" : "○"} in the first line
                        </span>
                        <span className={focus.inOpening ? "text-emerald-700" : "text-stone-500"}>
                          {focus.inOpening ? "✓" : "○"} in the opening 100 words
                        </span>
                        <span className={Number(focus.density) >= 1 && Number(focus.density) <= 2.5 ? "text-emerald-700" : "text-stone-500"}>
                          {Number(focus.density) >= 1 && Number(focus.density) <= 2.5 ? "✓" : "○"} density in the 1–2.5% range
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Four style measures, each with the audience's own target. */}
                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                    {[
                      {
                        label: "Passive voice",
                        value: `${style.passivePct}%`,
                        good: style.passivePct <= audience.passiveMax,
                        note: `target under ${audience.passiveMax}%`,
                      },
                      {
                        label: "Adverbs",
                        value: String(style.adverbs.length),
                        good: style.adverbPct <= 5,
                        note: `${style.adverbPct}% of words`,
                      },
                      {
                        label: "Filler words",
                        value: String(style.fillerTotal),
                        good: style.fillerTotal <= Math.max(2, Math.round(stats.words / 100)),
                        note: "hedges and padding",
                      },
                      {
                        label: "Complex words",
                        value: `${style.complexPct}%`,
                        good: style.complexPct <= 20,
                        note: "3+ syllables",
                      },
                    ].map(({ label, value, good, note }) => (
                      <div
                        key={label}
                        className={`rounded-lg border p-3 ${good ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
                      >
                        <p className={`text-lg font-extrabold tabular-nums ${good ? "text-emerald-700" : "text-amber-700"}`}>
                          {value}
                        </p>
                        <p className="text-[11px] font-semibold text-stone-600">{label}</p>
                        <p className="text-[10px] text-stone-400">{note}</p>
                      </div>
                    ))}
                  </div>

                  {style.passive.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold text-stone-700">
                        Passive constructions found
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {style.passive.slice(0, 12).map((h, i) => (
                          <span key={i} className="rounded-md bg-stone-100 px-2.5 py-1 text-[11px] text-stone-700">
                            {h.match}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {style.fillers.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-bold text-stone-700">
                        Words a second draft usually cuts
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {style.fillers.slice(0, 15).map(({ word, count }) => (
                          <span key={word} className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-2.5 py-1 text-[11px] text-stone-700">
                            {word}
                            <span className="font-bold tabular-nums text-stone-400">{count}×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-xs font-bold text-stone-700">
                      Sentence rhythm{" "}
                      <span className="font-normal text-stone-400">
                        · variety {style.lengthVariety}
                      </span>
                    </p>
                    {/* Bars show each sentence's length in order, so a wall of
                        identical bars reads instantly as monotonous prose. */}
                    <div className="flex h-14 items-end justify-start gap-1 overflow-hidden">
                      {style.sentenceLengths.slice(0, 60).map((n, i) => (
                        <span
                          key={i}
                          title={`${n} words`}
                          className={`w-2.5 shrink-0 rounded-sm sm:w-3 ${n > audience.sentenceLimit ? "bg-amber-400" : "bg-stone-300"}`}
                          style={{ height: `${Math.max(6, Math.min(100, (n / 45) * 100))}%` }}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
                      Sentences of similar length read as monotonous even when each one is fine.
                      Amber bars are over {audience.sentenceLimit} words.
                    </p>
                  </div>

                  <p className="border-t border-stone-100 pt-3 text-[11px] leading-relaxed text-stone-400">
                    Targets follow your chosen audience — {audience.name.toLowerCase()} tolerates up to{" "}
                    {audience.passiveMax}% passive. Passive detection is pattern matching rather than
                    grammar parsing, so it catches most cases and occasionally misfires.
                  </p>
                </div>
              )}

              {stats && tab === "sentences" && (
                stats.hardSentences.length === 0 ? (
                  <p className="flex items-center justify-center gap-2 py-6 text-center text-sm text-emerald-700">
                    <Sparkles size={15} />
                    Every sentence is under {audience.sentenceLimit} words — right for {audience.name.toLowerCase()}.
                  </p>
                ) : (
                  <>
                    <ul className="space-y-2.5">
                      {stats.hardSentences.slice(0, 8).map((s, i) => (
                        <li key={i} className={`rounded-lg border p-3.5 ${s.veryHard ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                          <div className="mb-1.5 flex items-center gap-2">
                            <AlertTriangle size={13} className={s.veryHard ? "text-red-600" : "text-amber-600"} />
                            <span className={`text-[11px] font-bold uppercase tracking-wide ${s.veryHard ? "text-red-700" : "text-amber-700"}`}>
                              {s.words} words · {s.veryHard ? "very hard to follow" : "getting long"}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed text-stone-700">
                            {s.text.length > 260 ? `${s.text.slice(0, 260)}…` : s.text}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-stone-100 pt-3 text-[11px] text-stone-400">
                      Flagged against {audience.name.toLowerCase()}, where sentences over{" "}
                      {audience.sentenceLimit} words start to lose readers. Change the audience in the
                      filters to move this threshold.
                    </p>
                  </>
                )
              )}
            </div>
          </div>
        )}

        {stats && (stats.slurCount > 0 || stats.strongCount > 0 || stats.mildCount > 0) && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-800">
              Found{" "}
              {[
                stats.slurCount && `${stats.slurCount} slur${stats.slurCount > 1 ? "s" : ""}`,
                stats.strongCount && `${stats.strongCount} strong`,
                stats.mildCount && `${stats.mildCount} mild`,
              ].filter(Boolean).join(", ")}{" "}
              profanity. Use <strong>Censor</strong> above to mask them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
