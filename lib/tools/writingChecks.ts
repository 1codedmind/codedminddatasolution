/**
 * Style checks that different kinds of writer actually ask for.
 *
 * Researching what content writers, copywriters, journalists, novelists and
 * academics look for in a writing tool, the same handful of measures come up
 * again and again beyond raw counts:
 *
 *  - Passive voice — the single most requested metric after readability, and
 *    the flagship of Hemingway. Editors and style guides police it.
 *  - Adverbs — "-ly" words, the classic sign of a verb doing too little work.
 *  - Filler and hedging words — "very", "just", "basically". Cutting them is
 *    the fastest way to tighten a draft.
 *  - Complex words — three or more syllables, the lever behind most
 *    readability scores.
 *  - Sentence length variety — prose where every sentence is the same length
 *    reads as monotonous even when each sentence is fine on its own.
 *  - A focus keyword — SEO writers work to one, and want its density plus
 *    whether it appears early.
 *
 * All of it is heuristic. Passive detection in particular is pattern matching,
 * not parsing, so it finds most cases and will occasionally be wrong; the UI
 * says so rather than presenting it as certainty.
 */

import { countSyllables, splitSentences } from "@/lib/tools/textStats";

/* ── Passive voice ─────────────────────────────────────────────────────── */

const BE_VERBS = new Set([
  "am", "is", "are", "was", "were", "be", "been", "being",
  "get", "gets", "got", "gotten",
]);

/** Irregular past participles, which no "-ed" rule will catch. */
const IRREGULAR_PARTICIPLES = new Set([
  "awoken","beaten","become","begun","bent","bound","bitten","bled","blown","broken",
  "brought","built","burnt","burst","bought","caught","chosen","come","cost","cut",
  "dealt","dug","done","drawn","drunk","driven","eaten","fallen","fed","felt","fought",
  "found","flown","forbidden","forgotten","forgiven","frozen","given","gone","ground",
  "grown","hung","heard","hidden","hit","held","hurt","kept","known","laid","led","left",
  "lent","let","lain","lost","made","meant","met","paid","put","read","ridden","rung",
  "risen","run","said","seen","sold","sent","set","shaken","shed","shone","shot","shown",
  "shut","sung","sunk","sat","slept","slid","spoken","spent","split","spread","stood",
  "stolen","stuck","struck","sworn","swept","swum","taken","taught","torn","told","thought",
  "thrown","understood","woken","worn","won","written","withdrawn","undergone","overcome",
]);

/** "-ly" words that are not adverbs, so they are not miscounted. */
const NOT_ADVERBS = new Set([
  "only","family","apply","reply","supply","july","italy","ally","rely","holy","ugly",
  "early","likely","friendly","lonely","silly","daily","weekly","monthly","yearly",
  "lovely","costly","deadly","elderly","orderly","curly","jelly","belly","rally","fly",
  "multiply","imply","comply","assembly","anomaly","melancholy","italy","bully","fully",
]);

/**
 * Hedges, intensifiers and padding.
 *
 * These are not errors — they are the words most often removed in a second
 * draft, so counting them tells a writer where the slack is.
 */
const FILLER_WORDS = new Set([
  "very","really","quite","just","actually","basically","literally","simply","totally",
  "definitely","certainly","probably","somewhat","rather","fairly","extremely",
  "incredibly","absolutely","essentially","generally","particularly","specifically",
  "obviously","clearly","honestly","frankly","truly","virtually","relatively",
  "arguably","perhaps","maybe","somehow","somewhat","overall","indeed","surely",
]);

function isParticiple(word: string): boolean {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return false;
  if (IRREGULAR_PARTICIPLES.has(w)) return true;
  // "-ed" is the regular form. Three letters minimum avoids "red", "bed".
  return w.length > 3 && w.endsWith("ed");
}

export type PassiveHit = { sentence: string; match: string };

/**
 * Find likely passive constructions.
 *
 * Pattern: a "be" verb, optionally followed by an adverb or "not", then a past
 * participle — "was written", "is being reviewed", "has been quietly dropped".
 */
export function findPassive(sentences: string[]): PassiveHit[] {
  const hits: PassiveHit[] = [];
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length - 1; i++) {
      const w = words[i].toLowerCase().replace(/[^a-z]/g, "");
      if (!BE_VERBS.has(w)) continue;

      // Allow one adverb or negation between the be-verb and the participle.
      for (let skip = 1; skip <= 2 && i + skip < words.length; skip++) {
        const candidate = words[i + skip];
        const bare = candidate.toLowerCase().replace(/[^a-z]/g, "");
        if (skip === 2) {
          const middle = words[i + 1].toLowerCase().replace(/[^a-z]/g, "");
          const skippable = middle === "not" || middle === "being" || middle.endsWith("ly");
          if (!skippable) break;
        }
        if (isParticiple(bare)) {
          const phrase = words.slice(i, i + skip + 1).join(" ").replace(/[.,;:!?]+$/, "");
          hits.push({ sentence, match: phrase });
          i += skip;
          break;
        }
      }
    }
  }
  return hits;
}

/* ── Focus keyword ─────────────────────────────────────────────────────── */

export type FocusKeyword = {
  term: string;
  count: number;
  /** Share of total words, as a percentage string. */
  density: string;
  /** Present within the opening 100 words, where search engines weight it. */
  inOpening: boolean;
  /** Appears in the first line, which doubles as the title. */
  inFirstLine: boolean;
};

export function analyseFocusKeyword(
  text: string,
  term: string,
  totalWords: number,
): FocusKeyword | null {
  const needle = term.trim().toLowerCase();
  if (!needle) return null;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, "gi");
  const count = (text.match(re) ?? []).length;

  const opening = text.split(/\s+/).slice(0, 100).join(" ").toLowerCase();
  const firstLine = (text.split("\n")[0] ?? "").toLowerCase();

  return {
    term: term.trim(),
    count,
    density: totalWords ? ((count / totalWords) * 100).toFixed(1) : "0.0",
    inOpening: opening.includes(needle),
    inFirstLine: firstLine.includes(needle),
  };
}

/* ── The whole style pass ──────────────────────────────────────────────── */

export type StyleReport = {
  passive: PassiveHit[];
  /** Passive sentences as a share of all sentences. */
  passivePct: number;
  adverbs: string[];
  adverbPct: number;
  fillers: { word: string; count: number }[];
  fillerTotal: number;
  complexWords: string[];
  complexPct: number;
  /** Standard deviation of sentence length — higher means more varied rhythm. */
  lengthVariety: number;
  sentenceLengths: number[];
};

export function styleReport(text: string): StyleReport | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const sentences = splitSentences(trimmed);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const clean = words.map((w) => w.toLowerCase().replace(/[^a-z']/g, "")).filter(Boolean);

  const passive = findPassive(sentences);
  const passiveSentences = new Set(passive.map((h) => h.sentence));

  // Words that are both an adverb and a filler ("really", "simply") are
  // reported only under fillers, so the same word is not counted twice in two
  // different panels.
  const adverbs = clean.filter(
    (w) => w.length > 4 && w.endsWith("ly") && !NOT_ADVERBS.has(w) && !FILLER_WORDS.has(w),
  );

  const fillerCounts = new Map<string, number>();
  for (const w of clean) {
    if (FILLER_WORDS.has(w)) fillerCounts.set(w, (fillerCounts.get(w) ?? 0) + 1);
  }
  const fillers = [...fillerCounts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const complexWords = clean.filter((w) => countSyllables(w) >= 3);

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const mean = sentenceLengths.length
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0;
  const variance = sentenceLengths.length
    ? sentenceLengths.reduce((sum, n) => sum + (n - mean) ** 2, 0) / sentenceLengths.length
    : 0;

  return {
    passive,
    passivePct: sentences.length ? Math.round((passiveSentences.size / sentences.length) * 100) : 0,
    adverbs,
    adverbPct: clean.length ? Math.round((adverbs.length / clean.length) * 100) : 0,
    fillers,
    fillerTotal: fillers.reduce((s, f) => s + f.count, 0),
    complexWords,
    complexPct: clean.length ? Math.round((complexWords.length / clean.length) * 100) : 0,
    lengthVariety: Math.round(Math.sqrt(variance) * 10) / 10,
    sentenceLengths,
  };
}
