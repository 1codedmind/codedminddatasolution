"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Check, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "shall","can","this","that","these","those","it","its","i","you","he",
  "she","we","they","me","him","her","us","them","my","your","his","our",
  "their","who","what","which","when","where","why","how","all","any",
  "both","each","few","more","most","other","some","such","no","not",
  "only","own","same","so","than","too","very","just","as","if","then",
  "about","also","into","up","out","there","here","now","like","one",
  "two","get","got","s","t","re","ve","ll","d","m","n","even","still",
]);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

function readabilityInfo(score: number) {
  if (score >= 90) return { label: "Very Easy",   color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" };
  if (score >= 80) return { label: "Easy",         color: "text-green-600",   bg: "bg-green-50",    border: "border-green-200" };
  if (score >= 70) return { label: "Fairly Easy",  color: "text-lime-600",    bg: "bg-lime-50",     border: "border-lime-200" };
  if (score >= 60) return { label: "Standard",     color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200" };
  if (score >= 50) return { label: "Fairly Hard",  color: "text-orange-500",  bg: "bg-orange-50",   border: "border-orange-200" };
  if (score >= 30) return { label: "Difficult",    color: "text-red-500",     bg: "bg-red-50",      border: "border-red-200" };
  return             { label: "Very Hard",   color: "text-red-700",     bg: "bg-red-50",      border: "border-red-300" };
}

const TOOL_BUTTONS = [
  {
    label: "ABC",
    title: "UPPERCASE",
    fn: (s: string) => s.toUpperCase(),
  },
  {
    label: "abc",
    title: "lowercase",
    fn: (s: string) => s.toLowerCase(),
  },
  {
    label: "Abc",
    title: "Title Case",
    fn: (s: string) =>
      s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
  },
  {
    label: "A·",
    title: "Sentence case",
    fn: (s: string) =>
      s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
  },
  {
    label: "Fix spaces",
    title: "Remove extra spaces",
    fn: (s: string) => s.replace(/ +/g, " ").replace(/\n{3,}/g, "\n\n").trim(),
  },
];

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const wordList = trimmed.split(/\s+/).filter(Boolean);
    const words = wordList.length;
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);

    const uniqueWords = new Set(
      wordList.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean)
    ).size;

    const avgSentenceLen = sentences > 0 ? Math.round(words / sentences) : 0;

    const readingMin = Math.ceil(words / 200);
    const speakMin = Math.ceil(words / 130);
    const pages = (words / 300).toFixed(1);

    // Flesch-Kincaid Reading Ease
    const fkRaw =
      sentences > 0
        ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
        : 0;
    const fkScore = Math.round(Math.max(0, Math.min(100, fkRaw)));
    const readability = readabilityInfo(fkScore);

    // Keyword frequency — exclude stop words and short tokens
    const freq: Record<string, number> = {};
    wordList.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z']/g, "").replace(/^'+|'+$/g, "");
      if (clean.length > 2 && !STOP_WORDS.has(clean)) {
        freq[clean] = (freq[clean] || 0) + 1;
      }
    });
    const maxFreq = Math.max(1, ...Object.values(freq));
    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        pct: ((count / words) * 100).toFixed(1),
        barWidth: Math.round((count / maxFreq) * 100),
      }));

    return {
      words, chars: text.length, charsNoSpaces: text.replace(/\s/g, "").length,
      sentences, paragraphs, uniqueWords, avgSentenceLen,
      readingMin, speakMin, pages, fkScore, readability, keywords,
    };
  }, [text]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  const displayedKeywords = showAllKeywords
    ? stats?.keywords
    : stats?.keywords.slice(0, 10);

  return (
    <div className="space-y-4">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400 mr-1 shrink-0">Transform:</span>
        {TOOL_BUTTONS.map(({ label, title, fn }) => (
          <button
            key={title}
            onClick={() => setText((prev) => fn(prev))}
            title={title}
            disabled={!text}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied
              ? <Check size={12} className="text-emerald-500" />
              : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setText("")}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white border border-stone-200 text-stone-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={12} />
            Clear
          </button>
        </div>
      </div>

      {/* ── Textarea ────────────────────────────────────────────────────── */}
      <textarea
        className="w-full h-72 p-5 text-base text-stone-800 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
        placeholder="Start typing or paste your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      {stats ? (
        <>
          {/* Primary: 6 cards */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {[
              { label: "Words",      value: stats.words.toLocaleString() },
              { label: "Characters", value: stats.chars.toLocaleString() },
              { label: "No Spaces",  value: stats.charsNoSpaces.toLocaleString() },
              { label: "Sentences",  value: stats.sentences.toLocaleString() },
              { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
              { label: "Pages",      value: stats.pages },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-stone-200 rounded-xl px-3 py-4 text-center">
                <p className="text-xl font-extrabold text-stone-900 tabular-nums">{value}</p>
                <p className="text-[11px] text-stone-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Secondary: 5 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: "Read time",     value: `~${stats.readingMin} min` },
              { label: "Speak time",    value: `~${stats.speakMin} min` },
              { label: "Unique words",  value: stats.uniqueWords.toLocaleString() },
              { label: "Avg sentence",  value: `${stats.avgSentenceLen} words` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-center">
                <p className="text-base font-bold text-stone-700 tabular-nums">{value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{label}</p>
              </div>
            ))}
            {/* Readability — coloured */}
            <div className={`rounded-xl px-3 py-3 text-center border ${stats.readability.bg} ${stats.readability.border}`}>
              <p className={`text-base font-bold ${stats.readability.color}`}>
                {stats.readability.label}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Readability</p>
            </div>
          </div>

          {/* Keyword density */}
          {stats.keywords.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-700">Keyword Density</h3>
                <span className="text-[11px] text-stone-400">stop words excluded</span>
              </div>
              <div className="space-y-2.5">
                {displayedKeywords?.map(({ word, count, pct, barWidth }) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className="w-28 text-sm font-medium text-stone-700 truncate shrink-0">
                      {word}
                    </span>
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs text-stone-500 w-8 text-right tabular-nums shrink-0">
                      {count}×
                    </span>
                    <span className="text-xs text-stone-400 w-12 text-right tabular-nums shrink-0">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
              {stats.keywords.length > 10 && (
                <button
                  onClick={() => setShowAllKeywords((v) => !v)}
                  className="mt-4 text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                >
                  {showAllKeywords
                    ? <><ChevronUp size={12} /> Show fewer</>
                    : <><ChevronDown size={12} /> Show all {stats.keywords.length} keywords</>}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {["Words", "Characters", "No Spaces", "Sentences", "Paragraphs", "Pages"].map((label) => (
            <div key={label} className="bg-white border border-stone-200 rounded-xl px-3 py-4 text-center">
              <p className="text-xl font-extrabold text-stone-200 tabular-nums">0</p>
              <p className="text-[11px] text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
