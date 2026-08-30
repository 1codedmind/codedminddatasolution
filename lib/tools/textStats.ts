/**
 * Text analysis for the word counter.
 *
 * Pulled out of the component so the maths is testable and readable on its own,
 * and so the component file is about layout rather than linguistics.
 */

/**
 * Words treated as profanity.
 *
 * The previous version of this list also contained "hate", "kill", "murder",
 * "rape", "sex", "sexual", "nude", "naked", "stupid" and "dumb". Those are
 * ordinary English — a news article, a medical page, or a line about killing a
 * process would all be flagged, which made the "clean" badge meaningless. Only
 * words that are actually profane or slurs belong here.
 */
const STRONG = [
  "fuck", "fucking", "fucked", "fucker", "fuckers", "fucks", "fuckin",
  "shit", "shitting", "shitty", "shits", "bullshit",
  "asshole", "assholes", "arsehole",
  "bitch", "bitches", "bitching", "bitchy",
  "bastard", "bastards",
  "cunt", "cunts",
  "cock", "cocks", "cocksucker",
  "dick", "dicks", "dickhead",
  "piss", "pissed", "pissing",
  "prick", "pricks",
  "whore", "whores",
  "slut", "sluts",
  "dumbass", "jackass",
  "wanker", "twat", "bollocks",
];

/** Slurs — always worth flagging, and kept separate so we can say which. */
const SLURS = [
  "nigger", "niggers", "nigga", "niggas",
  "faggot", "faggots", "fag", "fags",
  "retard", "retarded", "retards",
  "tranny", "trannies",
  "spic", "chink", "kike", "wetback",
];

/** Mild — flagged, but reported separately so the badge can be proportionate. */
const MILD = ["damn", "damned", "dammit", "crap", "crappy", "goddamn", "arse"];

export const PROFANITY = new Set([...STRONG, ...SLURS, ...MILD]);
const SLUR_SET = new Set(SLURS);
const MILD_SET = new Set(MILD);

export function censorWord(word: string): string {
  const core = word.replace(/[^a-zA-Z]/g, "");
  if (core.length > 1 && PROFANITY.has(core.toLowerCase())) {
    return word.replace(core, core[0] + "*".repeat(core.length - 1));
  }
  return word;
}

export const STOP_WORDS = new Set([
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

export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

export type ReadabilityBand = {
  label: string;
  tone: "good" | "ok" | "warn" | "bad";
  blurb: string;
};

export function readabilityInfo(score: number): ReadabilityBand {
  if (score >= 80) return { label: "Very easy", tone: "good", blurb: "Reads like conversation." };
  if (score >= 70) return { label: "Easy", tone: "good", blurb: "Comfortable for most readers." };
  if (score >= 60) return { label: "Standard", tone: "ok", blurb: "Plain English. A good target." };
  if (score >= 50) return { label: "Fairly hard", tone: "warn", blurb: "Long sentences are creeping in." };
  if (score >= 30) return { label: "Difficult", tone: "warn", blurb: "Academic. Consider shorter sentences." };
  return { label: "Very hard", tone: "bad", blurb: "Dense. Most readers will struggle." };
}

/**
 * Sentence splitting that survives abbreviations.
 *
 * A naive split on [.!?] turns "Dr. Smith arrived." into two sentences, which
 * then skews average sentence length and every readability score built on it.
 * Protecting a short list of common abbreviations fixes the majority of cases.
 */
const ABBREVIATIONS = /\b(mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|approx|fig|no|inc|ltd|co|dept|est|min|max|vol|ch|pp|ed)\.\s/gi;

/** Sentinel standing in for a dot we do not want to split on. */
const DOT = "\u0001";

export function splitSentences(text: string): string[] {
  // Hide abbreviation dots behind a sentinel, split, then put them back so the
  // sentence text we display is still exactly what the user wrote.
  const guarded = text.replace(ABBREVIATIONS, (m) => m.replace(".", DOT));
  return guarded
    .split(/(?<=[.!?])[\s\n]+|\n{2,}/)
    .map((s) => s.split(DOT).join(".").trim())
    .filter((s) => s.length > 0 && /[a-z0-9]/i.test(s));
}

export type Keyword = { term: string; count: number; pct: string; barWidth: number };

function rank(freq: Map<string, number>, totalWords: number, limit: number): Keyword[] {
  const entries = [...freq.entries()].filter(([, c]) => c > 1 || freq.size < 5);
  const max = Math.max(1, ...entries.map(([, c]) => c));
  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({
      term,
      count,
      pct: ((count / Math.max(1, totalWords)) * 100).toFixed(1),
      barWidth: Math.round((count / max) * 100),
    }));
}

export type SentenceInfo = { text: string; words: number; hard: boolean; veryHard: boolean };

export type AnalyseOptions = {
  /** Reading speed, so the estimate matches the intended audience. */
  wpm: number;
  /** Words per sentence beyond which a sentence is flagged as long. */
  sentenceLimit: number;
  /** Ignore keywords shorter than this. */
  minKeywordLength: number;
  /** Count filler words ("the", "and") as keywords. */
  includeStopWords: boolean;
};

export const DEFAULT_OPTIONS: AnalyseOptions = {
  wpm: 200,
  sentenceLimit: 25,
  minKeywordLength: 3,
  includeStopWords: false,
};

export type TextStats = ReturnType<typeof analyse>;

export function analyse(text: string, opts: AnalyseOptions = DEFAULT_OPTIONS) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const wordList = trimmed.split(/\s+/).filter(Boolean);
  const words = wordList.length;
  const lines = text.split("\n").length;
  const sentenceTexts = splitSentences(trimmed);
  const sentences = Math.max(1, sentenceTexts.length);
  const paragraphs = Math.max(1, text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length);
  const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);

  const cleanWords = wordList
    .map((w) => w.toLowerCase().replace(/[^a-z']/g, "").replace(/^'+|'+$/g, ""))
    .filter(Boolean);
  const uniqueWords = new Set(cleanWords).size;

  const avgSentenceLen = Math.round(words / sentences);
  const avgWordLen = cleanWords.length
    ? (cleanWords.reduce((s, w) => s + w.length, 0) / cleanWords.length).toFixed(1)
    : "0";
  const longestWord = cleanWords.reduce((a, b) => (b.length > a.length ? b : a), "");

  const readingSec = Math.round((words / Math.max(50, opts.wpm)) * 60);
  const speakSec = Math.round((words / 130) * 60);
  const pages = (words / 300).toFixed(1);

  const fkRaw = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / Math.max(1, words));
  const fkScore = Math.round(Math.max(0, Math.min(100, fkRaw)));
  const readability = readabilityInfo(fkScore);

  // Flesch-Kincaid is unbounded above: a single 30-word sentence of long words
  // scores past grade 30, which is not a real reading level and made every
  // audience read "too complex". Cap at 20 — beyond that the number carries no
  // extra meaning — and tell callers we did.
  const gradeRaw = 0.39 * (words / sentences) + 11.8 * (syllables / Math.max(1, words)) - 15.59;
  const gradeUncapped = Math.max(1, Math.round(gradeRaw * 10) / 10);
  const grade = Math.min(20, gradeUncapped);
  const gradeCapped = gradeUncapped > 20;

  // Per-sentence detail. A single 60-word sentence is the most common reason
  // otherwise-plain writing scores badly, and pointing at it is far more
  // actionable than showing a score alone.
  const sentenceInfos: SentenceInfo[] = sentenceTexts.map((s) => {
    const n = s.split(/\s+/).filter(Boolean).length;
    return {
      text: s,
      words: n,
      hard: n > opts.sentenceLimit,
      veryHard: n > opts.sentenceLimit + 10,
    };
  });
  const hardSentences = sentenceInfos.filter((s) => s.hard).sort((a, b) => b.words - a.words);

  // Profanity, split by severity so the badge can be honest about what it found.
  let slurCount = 0;
  let strongCount = 0;
  let mildCount = 0;
  for (const w of cleanWords) {
    if (!PROFANITY.has(w)) continue;
    if (SLUR_SET.has(w)) slurCount++;
    else if (MILD_SET.has(w)) mildCount++;
    else strongCount++;
  }

  // Single words
  const freq = new Map<string, number>();
  for (const w of cleanWords) {
    if (w.length < opts.minKeywordLength) continue;
    if (!opts.includeStopWords && STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const keywords = rank(freq, words, 25);

  // Two- and three-word phrases. Phrases made only of stop words are noise
  // ("of the", "in the"), so at least one real word has to appear.
  function ngrams(n: number) {
    const map = new Map<string, number>();
    for (let i = 0; i + n <= cleanWords.length; i++) {
      const parts = cleanWords.slice(i, i + n);
      if (parts.some((p) => !p || p.length < 2)) continue;
      if (!opts.includeStopWords && parts.every((p) => STOP_WORDS.has(p))) continue;
      const phrase = parts.join(" ");
      map.set(phrase, (map.get(phrase) ?? 0) + 1);
    }
    return map;
  }
  const phrases = [...rank(ngrams(2), words, 12), ...rank(ngrams(3), words, 8)]
    .filter((p) => p.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    words,
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    avgSentenceLen,
    avgWordLen,
    longestWord,
    readingSec,
    speakSec,
    pages,
    fkScore,
    readability,
    grade,
    gradeCapped,
    slurCount,
    strongCount,
    mildCount,
    keywords,
    phrases,
    sentenceInfos,
    hardSentences,
  };
}

/** "45 sec", "3 min", "1 hr 5 min" — reading times below a minute matter. */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${Math.max(1, totalSeconds)} sec`;
  const mins = Math.round(totalSeconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}
