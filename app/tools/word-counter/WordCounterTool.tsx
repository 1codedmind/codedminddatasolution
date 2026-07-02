"use client";

import { useState, useMemo, useCallback } from "react";
import { Copy, Check, Trash2, ChevronDown, ChevronUp, Download, Search } from "lucide-react";

// Common profanity list for abuse-free check (censored in source for safety)
const PROFANITY = new Set([
  "fuck","fucking","fucked","fucker","fucks","fuckin",
  "shit","shitting","shitty","shits","bullshit",
  "ass","asshole","assholes","asses",
  "bitch","bitches","bitching","bitchy",
  "bastard","bastards",
  "damn","damned","dammit",
  "crap","crappy","crap",
  "dick","dicks","dickhead",
  "cock","cocks","cocksucker",
  "cunt","cunts",
  "whore","whores",
  "slut","sluts",
  "piss","pissed","pissing",
  "prick","pricks",
  "nigger","niggers","nigga",
  "faggot","faggots","fag","fags",
  "retard","retarded","retards",
  "idiot","idiots","moron","morons","imbecile",
  "stupid","dumbass","dumb",
  "hate","hater","haters",
  "kill","killing","murder",
  "rape","raped","raping","rapist",
  "porn","porno",
  "sex","sexy","sexual",
  "nude","naked","nudity",
]);

function censorWord(word: string): string {
  const core = word.replace(/[^a-zA-Z]/g, "");
  if (PROFANITY.has(core.toLowerCase())) {
    return word.replace(core, core[0] + "*".repeat(core.length - 1));
  }
  return word;
}

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
  if (score >= 90) return { label: "Very Easy",  color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" };
  if (score >= 80) return { label: "Easy",        color: "text-green-600",   bg: "bg-green-50",    border: "border-green-200" };
  if (score >= 70) return { label: "Fairly Easy", color: "text-lime-600",    bg: "bg-lime-50",     border: "border-lime-200" };
  if (score >= 60) return { label: "Standard",    color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200" };
  if (score >= 50) return { label: "Fairly Hard", color: "text-orange-500",  bg: "bg-orange-50",   border: "border-orange-200" };
  if (score >= 30) return { label: "Difficult",   color: "text-red-500",     bg: "bg-red-50",      border: "border-red-200" };
  return              { label: "Very Hard",   color: "text-red-700",     bg: "bg-red-50",      border: "border-red-300" };
}

const PLATFORM_LIMITS = [
  { name: "Twitter / X",       limit: 280   },
  { name: "SMS",                limit: 160   },
  { name: "Instagram bio",      limit: 150   },
  { name: "YouTube title",      limit: 100   },
  { name: "SEO title tag",      limit: 60    },
  { name: "Email subject",      limit: 78    },
  { name: "Meta description",   limit: 155   },
  { name: "LinkedIn post",      limit: 3000  },
];

function escRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TRANSFORM_BUTTONS = [
  { label: "ABC",         title: "UPPERCASE",              fn: (s: string) => s.toUpperCase() },
  { label: "abc",         title: "lowercase",              fn: (s: string) => s.toLowerCase() },
  { label: "Abc",         title: "Title Case",             fn: (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
  { label: "A·",          title: "Sentence case",          fn: (s: string) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()) },
  { label: "Fix spaces",  title: "Remove extra spaces",    fn: (s: string) => s.replace(/ +/g, " ").replace(/\n{3,}/g, "\n\n").trim() },
  { label: "↑ Sort A–Z", title: "Sort lines A to Z",      fn: (s: string) => s.split("\n").sort((a, b) => a.localeCompare(b)).join("\n") },
  { label: "↓ Sort Z–A", title: "Sort lines Z to A",      fn: (s: string) => s.split("\n").sort((a, b) => b.localeCompare(a)).join("\n") },
  { label: "◌ Empties",  title: "Remove empty lines",     fn: (s: string) => s.split("\n").filter((l) => l.trim()).join("\n") },
  { label: "◌ Dupes",    title: "Remove duplicate lines", fn: (s: string) => [...new Set(s.split("\n"))].join("\n") },
  { label: "⇄ Reverse",  title: "Reverse words",          fn: (s: string) => s.split(/\s+/).reverse().join(" ") },
  { label: "⊘ Censor",   title: "Censor abusive words",   fn: (s: string) => s.replace(/\b\w+\b/g, censorWord) },
];

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const wordList = trimmed.split(/\s+/).filter(Boolean);
    const words = wordList.length;
    const lines = text.split("\n").length;
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);

    const cleanWords = wordList.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
    const uniqueWords = new Set(cleanWords).size;
    const avgSentenceLen = sentences > 0 ? Math.round(words / sentences) : 0;
    const avgWordLen = cleanWords.length > 0
      ? (cleanWords.reduce((s, w) => s + w.length, 0) / cleanWords.length).toFixed(1)
      : "0";
    const longestWord = cleanWords.reduce((a, b) => a.length >= b.length ? a : b, "");

    const readingMin = Math.ceil(words / 200);
    const speakMin = Math.ceil(words / 130);
    const pages = (words / 300).toFixed(1);

    // Flesch-Kincaid Reading Ease
    const fkRaw = sentences > 0 ? 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words) : 0;
    const fkScore = Math.round(Math.max(0, Math.min(100, fkRaw)));
    const readability = readabilityInfo(fkScore);

    // FK Grade Level
    const gradeRaw = sentences > 0 ? 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59 : 0;
    const grade = Math.max(1, Math.round(gradeRaw * 10) / 10);

    // Profanity check
    const abuseWords = wordList.filter((w) => PROFANITY.has(w.toLowerCase().replace(/[^a-z]/g, "")));
    const abuseCount = abuseWords.length;

    // Keyword frequency
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
        word, count,
        pct: ((count / words) * 100).toFixed(1),
        barWidth: Math.round((count / maxFreq) * 100),
      }));

    return {
      words, chars: text.length, charsNoSpaces: text.replace(/\s/g, "").length,
      sentences, paragraphs, lines, uniqueWords, avgSentenceLen, avgWordLen, longestWord,
      readingMin, speakMin, pages, fkScore, readability, grade, abuseCount, keywords,
    };
  }, [text]);

  const matchCount = useMemo(() => {
    if (!findText || !text) return 0;
    try {
      return (text.match(new RegExp(escRe(findText), matchCase ? "g" : "gi")) || []).length;
    } catch { return 0; }
  }, [text, findText, matchCase]);

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

  function handleReplaceFirst() {
    if (!findText) return;
    try { setText(text.replace(new RegExp(escRe(findText), matchCase ? "" : "i"), replaceText)); } catch { /* noop */ }
  }

  function handleReplaceAll() {
    if (!findText) return;
    try { setText(text.replace(new RegExp(escRe(findText), matchCase ? "g" : "gi"), replaceText)); } catch { /* noop */ }
  }

  const displayedKeywords = showAllKeywords ? stats?.keywords : stats?.keywords.slice(0, 10);

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-stone-400 mr-1 shrink-0">Transform:</span>
        {TRANSFORM_BUTTONS.map(({ label, title, fn }) => (
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
        <div className="ml-auto flex gap-1.5 flex-wrap justify-end">
          <button
            onClick={() => setShowFindReplace((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-lg transition-colors ${
              showFindReplace
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Search size={12} />
            Find &amp; Replace
          </button>
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!text}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={12} />
            Download
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

      {/* ── Find & Replace ───────────────────────────────────────────────── */}
      {showFindReplace && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Find…"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="flex-1 min-w-32 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 bg-white"
            />
            <input
              type="text"
              placeholder="Replace with…"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="flex-1 min-w-32 px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 bg-white"
            />
            <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer whitespace-nowrap select-none">
              <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="rounded" />
              Match case
            </label>
            <button
              onClick={handleReplaceFirst}
              disabled={!findText || !text}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Replace first
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!findText || !text}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Replace all
            </button>
            {findText && (
              <span className="text-xs text-stone-500 whitespace-nowrap">
                {matchCount === 0 ? "No matches" : `${matchCount} match${matchCount !== 1 ? "es" : ""}`}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Textarea ─────────────────────────────────────────────────────── */}
      <textarea
        className="w-full h-72 p-5 text-base text-stone-800 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
        placeholder="Start typing or paste your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      {stats ? (
        <>
          {/* Primary 6 */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {[
              { label: "Words",      value: stats.words.toLocaleString() },
              { label: "Characters", value: stats.chars.toLocaleString() },
              { label: "No Spaces",  value: stats.charsNoSpaces.toLocaleString() },
              { label: "Sentences",  value: stats.sentences.toLocaleString() },
              { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
              { label: "Lines",      value: stats.lines.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-stone-200 rounded-xl px-3 py-4 text-center">
                <p className="text-xl font-extrabold text-stone-900 tabular-nums">{value}</p>
                <p className="text-[11px] text-stone-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Secondary 5 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: "Read time",    value: `~${stats.readingMin} min` },
              { label: "Speak time",   value: `~${stats.speakMin} min` },
              { label: "Unique words", value: stats.uniqueWords.toLocaleString() },
              { label: "Avg sentence", value: `${stats.avgSentenceLen} words` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-center">
                <p className="text-base font-bold text-stone-700 tabular-nums">{value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{label}</p>
              </div>
            ))}
            <div className={`rounded-xl px-3 py-3 text-center border ${stats.readability.bg} ${stats.readability.border}`}>
              <p className={`text-base font-bold ${stats.readability.color}`}>{stats.readability.label}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Readability</p>
            </div>
          </div>

          {/* Writing Analysis 5 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: "Pages (300 wpm)", value: stats.pages },
              { label: "Avg word length",  value: `${stats.avgWordLen} chars` },
              { label: "Longest word",     value: stats.longestWord || "—" },
              { label: "Reading grade",    value: `Grade ${stats.grade}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-center">
                <p className="text-base font-bold text-stone-700 tabular-nums truncate">{value}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{label}</p>
              </div>
            ))}
            {/* Abuse-free indicator */}
            {stats.abuseCount === 0 ? (
              <div className="rounded-xl px-3 py-3 text-center border bg-emerald-50 border-emerald-200">
                <p className="text-base font-bold text-emerald-600">✓ Clean</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Abuse-free</p>
              </div>
            ) : (
              <div className="rounded-xl px-3 py-3 text-center border bg-red-50 border-red-200">
                <p className="text-base font-bold text-red-600">{stats.abuseCount} found</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Abusive words</p>
              </div>
            )}
          </div>

          {/* Platform Limits */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPlatforms((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <span>Platform character limits</span>
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-normal text-stone-400">Twitter, SMS, Instagram, SEO…</span>
                {showPlatforms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>
            {showPlatforms && (
              <div className="px-5 pb-5 pt-3 space-y-3.5 border-t border-stone-100">
                {PLATFORM_LIMITS.map(({ name, limit }) => {
                  const used = stats.chars;
                  const pct = Math.min(100, Math.round((used / limit) * 100));
                  const over = used > limit;
                  const close = !over && pct >= 85;
                  const barColor = over ? "bg-red-500" : close ? "bg-amber-400" : "bg-emerald-400";
                  const textColor = over ? "text-red-600 font-semibold" : close ? "text-amber-600" : "text-stone-400";
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-stone-600">{name}</span>
                        <span className={`text-xs tabular-nums ${textColor}`}>
                          {over
                            ? `${(used - limit).toLocaleString()} over`
                            : `${(limit - used).toLocaleString()} left`}
                          {" "}· {limit.toLocaleString()} max
                        </span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keyword Density */}
          {stats.keywords.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-stone-700">Keyword Density</h3>
                <span className="text-[11px] text-stone-400">stop words excluded</span>
              </div>
              <div className="space-y-2.5">
                {displayedKeywords?.map(({ word, count, pct, barWidth }) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className="w-28 text-sm font-medium text-stone-700 truncate shrink-0">{word}</span>
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-xs text-stone-500 w-8 text-right tabular-nums shrink-0">{count}×</span>
                    <span className="text-xs text-stone-400 w-12 text-right tabular-nums shrink-0">{pct}%</span>
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
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {["Words","Characters","No Spaces","Sentences","Paragraphs","Lines"].map((label) => (
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
