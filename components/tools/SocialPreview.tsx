"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Globe, MessageSquare, Smartphone, Briefcase } from "lucide-react";

import {
  countGraphemes,
  smsInfo,
  truncateGraphemes,
  twitterWeightedLength,
} from "@/lib/tools/platformLimits";

/**
 * Live previews of how text will actually appear once posted.
 *
 * Character counters tell you a number. What people actually want to know is
 * "where does it get cut off, and does the important bit survive?" — so this
 * renders the real thing: a Google result truncated by pixel width, an X
 * composer using weighted length, an SMS with its true segment count, and a
 * LinkedIn post cut at the "see more" fold.
 */

/* ── Google measures pixels, not characters ────────────────────────────── */

let ctx: CanvasRenderingContext2D | null | undefined;
function measurePx(text: string, font: string): number {
  if (typeof document === "undefined") return 0;
  if (ctx === undefined) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  return Math.round(ctx.measureText(text).width);
}

/** Google's desktop cut-offs, in pixels. Widely used approximations. */
const TITLE_PX = 600;
const DESC_PX = 960;
const TITLE_FONT = "20px Arial, sans-serif";
const DESC_FONT = "14px Arial, sans-serif";

/** Trim to a pixel budget one grapheme at a time, so emoji stay intact. */
function truncateToPx(text: string, budget: number, font: string) {
  if (measurePx(text, font) <= budget) return { shown: text, cut: false };
  let lo = 0;
  let hi = countGraphemes(text);
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measurePx(truncateGraphemes(text, mid) + "…", font) <= budget) lo = mid;
    else hi = mid - 1;
  }
  return { shown: truncateGraphemes(text, lo), cut: true };
}

type TabId = "google" | "x" | "sms" | "linkedin";

const TABS: { id: TabId; label: string; Icon: typeof Globe }[] = [
  { id: "google", label: "Google", Icon: Globe },
  { id: "x", label: "X / Twitter", Icon: MessageSquare },
  { id: "sms", label: "SMS", Icon: Smartphone },
  { id: "linkedin", label: "LinkedIn", Icon: Briefcase },
];

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
        ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
      }`}
    >
      {ok ? (
        <Check size={14} className="mt-px shrink-0 text-emerald-600" />
      ) : (
        <AlertTriangle size={14} className="mt-px shrink-0 text-amber-600" />
      )}
      <span>{children}</span>
    </p>
  );
}

export default function SocialPreview({ text }: { text: string }) {
  const [tab, setTab] = useState<TabId>("google");

  const trimmed = text.trim();

  // First line becomes the headline, the rest the body — which is how people
  // actually draft a post or a page title in a scratch box.
  const [firstLine, ...restLines] = trimmed.split("\n");
  const title = firstLine ?? "";
  const body = restLines.join(" ").trim() || trimmed;

  const google = useMemo(() => {
    const t = truncateToPx(title, TITLE_PX, TITLE_FONT);
    const d = truncateToPx(body, DESC_PX, DESC_FONT);
    return {
      ...t,
      titlePx: measurePx(title, TITLE_FONT),
      desc: d.shown,
      descCut: d.cut,
      descPx: measurePx(body, DESC_FONT),
    };
  }, [title, body]);

  const xWeight = useMemo(() => twitterWeightedLength(trimmed), [trimmed]);
  const sms = useMemo(() => smsInfo(text), [text]);
  const liChars = countGraphemes(trimmed);
  const liShown = truncateGraphemes(trimmed, 140);

  const xOver = xWeight > 280;
  const xPct = Math.min(100, (xWeight / 280) * 100);
  const r = 12;
  const circ = 2 * Math.PI * r;

  if (!trimmed) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-sm text-stone-400">
          Type something to see how it will look on Google, X, SMS and LinkedIn.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-100 px-3 pt-3">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              tab === id ? "bg-stone-100 text-stone-900" : "text-stone-400 hover:text-stone-600"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-5">
        {/* ── Google search result ──────────────────────────────────────── */}
        {tab === "google" && (
          <>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-200 text-[10px] font-bold text-stone-500">
                  C
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] text-stone-800">Your site</p>
                  <p className="text-[12px] text-stone-500">https://example.com › page</p>
                </div>
              </div>
              <p
                className="mt-1.5 text-[20px] leading-snug text-[#1a0dab]"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {google.shown}
                {google.cut && "…"}
              </p>
              <p
                className="mt-1 text-[14px] leading-snug text-[#4d5156]"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {google.desc}
                {google.descCut && "…"}
              </p>
            </div>

            <Verdict ok={!google.cut && !google.descCut}>
              {google.cut || google.descCut ? (
                <>
                  Google will cut{" "}
                  {[google.cut && "your title", google.descCut && "your description"]
                    .filter(Boolean)
                    .join(" and ")}
                  . Title is {google.titlePx}px of {TITLE_PX}px, description {google.descPx}px of {DESC_PX}px.
                </>
              ) : (
                <>
                  Both fit. Title {google.titlePx}px of {TITLE_PX}px, description {google.descPx}px of{" "}
                  {DESC_PX}px.
                </>
              )}
            </Verdict>
            <p className="text-[11px] leading-relaxed text-stone-400">
              Google truncates by <strong>pixel width</strong>, not character count — which is why a
              title of wide letters can be cut while a longer one of narrow letters survives. Widths
              here are measured with Google&rsquo;s desktop font and are a close approximation, not a
              guarantee. Your first line is treated as the title.
            </p>
          </>
        )}

        {/* ── X / Twitter ───────────────────────────────────────────────── */}
        {tab === "x" && (
          <>
            <div className="rounded-lg border border-stone-200 p-4">
              <div className="flex gap-3">
                <span className="h-10 w-10 shrink-0 rounded-full bg-stone-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-tight">
                    <span className="font-bold text-stone-900">Your name</span>{" "}
                    <span className="text-stone-500">@you</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-normal text-stone-900">
                    {trimmed}
                  </p>
                </div>
                <svg width="32" height="32" viewBox="0 0 32 32" className="shrink-0 -rotate-90">
                  <circle cx="16" cy="16" r={r} fill="none" strokeWidth="2.5" className="stroke-stone-200" />
                  <circle
                    cx="16" cy="16" r={r} fill="none" strokeWidth="2.5" strokeLinecap="round"
                    className={xOver ? "stroke-red-500" : xWeight > 260 ? "stroke-amber-500" : "stroke-sky-500"}
                    strokeDasharray={circ}
                    strokeDashoffset={circ - (xPct / 100) * circ}
                  />
                </svg>
              </div>
            </div>

            <Verdict ok={!xOver}>
              {xOver
                ? `${xWeight - 280} over the 280 limit.`
                : `${280 - xWeight} left of 280.`}{" "}
              X counts a <strong>weighted</strong> length: every link counts as 23 no matter how long,
              and emoji or CJK characters count as two.
            </Verdict>
            {xWeight !== countGraphemes(trimmed) && (
              <p className="text-[11px] leading-relaxed text-stone-400">
                Your text is {countGraphemes(trimmed).toLocaleString()} characters but weighs{" "}
                {xWeight.toLocaleString()} to X. Counters that just measure length get this wrong.
              </p>
            )}
          </>
        )}

        {/* ── SMS ───────────────────────────────────────────────────────── */}
        {tab === "sms" && (
          <>
            <div className="rounded-lg bg-stone-100 p-4">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-[#2563EB] px-4 py-2.5">
                <p className="whitespace-pre-wrap break-words text-[15px] leading-snug text-white">
                  {trimmed}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Encoding", value: sms.encoding },
                { label: "Segments", value: String(sms.segments) },
                { label: `Left in segment`, value: String(sms.remaining) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-stone-200 px-3 py-2 text-center">
                  <p className="text-sm font-bold tabular-nums text-stone-800">{value}</p>
                  <p className="text-[10px] text-stone-400">{label}</p>
                </div>
              ))}
            </div>

            <Verdict ok={sms.segments <= 1}>
              {sms.segments <= 1 ? (
                <>Sends as a single message ({sms.units} of {sms.perSegment} units).</>
              ) : (
                <>
                  Sends as <strong>{sms.segments} messages</strong> — most providers bill each one.
                </>
              )}
              {sms.encoding === "UCS-2" && (
                <>
                  {" "}
                  The character <strong>{sms.forcedBy}</strong> is outside the GSM alphabet, which
                  switches the whole message to UCS-2 and drops capacity from 160 to 70 per segment.
                </>
              )}
            </Verdict>
            <p className="text-[11px] leading-relaxed text-stone-400">
              This is why &ldquo;SMS = 160 characters&rdquo; is misleading: one emoji or a curly
              apostrophe more than doubles the cost of the same message.
            </p>
          </>
        )}

        {/* ── LinkedIn ──────────────────────────────────────────────────── */}
        {tab === "linkedin" && (
          <>
            <div className="rounded-lg border border-stone-200 p-4">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 shrink-0 rounded-full bg-stone-200" />
                <div className="leading-tight">
                  <p className="text-[14px] font-semibold text-stone-900">Your name</p>
                  <p className="text-[12px] text-stone-500">Your headline · 1st</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-stone-900">
                {liShown}
                {liChars > 140 && (
                  <>
                    …<span className="ml-1 font-semibold text-stone-500">see more</span>
                  </>
                )}
              </p>
            </div>

            <Verdict ok={liChars <= 140}>
              {liChars <= 140 ? (
                <>All {liChars} characters show in the feed without a click.</>
              ) : (
                <>
                  Only the first ~140 characters show. {(liChars - 140).toLocaleString()} characters
                  sit behind &ldquo;see more&rdquo; — put the hook before the fold.
                </>
              )}
            </Verdict>
            <p className="text-[11px] leading-relaxed text-stone-400">
              LinkedIn accepts 3,000 characters, but the feed collapses at roughly 140. The limit that
              matters for reach is the fold, not the maximum.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
