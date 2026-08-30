/**
 * Audience-aware writing targets.
 *
 * "Readability: Difficult" is only meaningful once you know who is reading. A
 * Flesch score of 35 is a failure for a marketing page and completely normal
 * for a research paper — so a single fixed verdict is either wrong for half
 * the people using the tool, or so vague it says nothing.
 *
 * Picking an audience changes what counts as good: the target Flesch band, the
 * expected US grade level, and the sentence length at which readers start to
 * lose the thread. Every downstream verdict reads from here.
 *
 * The bands are the conventional targets used in plain-language and editorial
 * guidance rather than anything we measured ourselves; they are a sensible
 * default to write against, not a law.
 */

export type Audience = {
  id: string;
  name: string;
  /** Icon name, resolved in the component so this file stays DOM-free. */
  icon: string;
  blurb: string;
  /** Target Flesch Reading Ease band, inclusive. */
  flesch: [number, number];
  /** Target US grade level band, inclusive. */
  grade: [number, number];
  /** Words per sentence beyond which a sentence is flagged. */
  sentenceLimit: number;
  /** Reading speed in words per minute for this audience. */
  wpm: number;
  /**
   * Share of sentences that may be passive before it is worth flagging.
   * Plain-language guidance pushes for near-zero; academic and legal writing
   * uses the passive deliberately, so a single global threshold would be wrong
   * for half the audiences here.
   */
  passiveMax: number;
};

export const AUDIENCES: Audience[] = [
  {
    id: "general",
    name: "General public",
    icon: "Users",
    blurb: "Plain English for a broad web audience.",
    flesch: [60, 75],
    grade: [7, 9],
    sentenceLimit: 25,
    wpm: 200,
    passiveMax: 10,
  },
  {
    id: "children",
    name: "Children (8–12)",
    icon: "Baby",
    blurb: "Short sentences, everyday words.",
    flesch: [80, 100],
    grade: [3, 5],
    sentenceLimit: 12,
    wpm: 120,
    passiveMax: 5,
  },
  {
    id: "teen",
    name: "Teens (13–17)",
    icon: "BookOpen",
    blurb: "Accessible but not simplified.",
    flesch: [70, 85],
    grade: [6, 8],
    sentenceLimit: 18,
    wpm: 180,
    passiveMax: 8,
  },
  {
    id: "marketing",
    name: "Marketing & social",
    icon: "Megaphone",
    blurb: "Punchy, scannable, low friction.",
    flesch: [70, 85],
    grade: [5, 8],
    sentenceLimit: 15,
    wpm: 220,
    passiveMax: 5,
  },
  {
    id: "news",
    name: "News & journalism",
    icon: "Newspaper",
    blurb: "Newsroom style, around grade 9.",
    flesch: [60, 75],
    grade: [8, 10],
    sentenceLimit: 22,
    wpm: 220,
    passiveMax: 10,
  },
  {
    id: "business",
    name: "Business & professional",
    icon: "Briefcase",
    blurb: "Clear writing for a working audience.",
    flesch: [50, 65],
    grade: [10, 12],
    sentenceLimit: 22,
    wpm: 210,
    passiveMax: 15,
  },
  {
    id: "technical",
    name: "Technical & developer",
    icon: "Code2",
    blurb: "Precision first, but still readable.",
    flesch: [40, 60],
    grade: [10, 14],
    sentenceLimit: 26,
    wpm: 180,
    passiveMax: 20,
  },
  {
    id: "academic",
    name: "Academic & research",
    icon: "GraduationCap",
    blurb: "Dense prose is expected here.",
    flesch: [25, 50],
    grade: [13, 17],
    sentenceLimit: 35,
    wpm: 150,
    passiveMax: 30,
  },
  {
    id: "legal",
    name: "Legal & compliance",
    icon: "Scale",
    blurb: "Formal register, long clauses.",
    flesch: [20, 45],
    grade: [14, 18],
    sentenceLimit: 40,
    wpm: 130,
    passiveMax: 35,
  },
  {
    id: "email",
    name: "Email & newsletter",
    icon: "Mail",
    blurb: "Conversational, quick to skim.",
    flesch: [65, 80],
    grade: [6, 9],
    sentenceLimit: 18,
    wpm: 220,
    passiveMax: 5,
  },
];

export const DEFAULT_AUDIENCE = AUDIENCES[0];

export function audienceById(id: string): Audience {
  return AUDIENCES.find((a) => a.id === id) ?? DEFAULT_AUDIENCE;
}

/** Below this, readability formulas are noise rather than signal. */
export const MIN_WORDS_FOR_VERDICT = 25;

export type Verdict = {
  status: "on-target" | "too-simple" | "too-complex" | "unknown";
  /** Short headline shown on the readability card. */
  label: string;
  /** One line saying what to actually do about it. */
  advice: string;
};

/**
 * Judge a piece of writing against its intended audience.
 *
 * Grade level leads because it is the more stable of the two measures on short
 * text — Flesch swings wildly when there are only a couple of sentences.
 */
export function judge(
  grade: number,
  flesch: number,
  audience: Audience,
  words: number,
): Verdict {
  const [gLo, gHi] = audience.grade;

  // Flesch-Kincaid swings wildly on a couple of sentences — a single long
  // sentence can read as postgraduate. Saying nothing beats saying something
  // confident and wrong.
  if (words < MIN_WORDS_FOR_VERDICT) {
    return {
      status: "unknown",
      label: "Keep writing",
      advice: `Readability needs about ${MIN_WORDS_FOR_VERDICT} words before it means anything — one long sentence can otherwise score as postgraduate. ${words} so far.`,
    };
  }

  if (grade < gLo - 0.5) {
    return {
      status: "too-simple",
      label: "Simpler than needed",
      advice: `Reads at grade ${grade}, below the grade ${gLo}–${gHi} this audience expects. You have room for more precise vocabulary and fuller sentences.`,
    };
  }
  if (grade > gHi + 0.5) {
    return {
      status: "too-complex",
      label: "Too complex",
      advice: `Reads at grade ${grade}, above the grade ${gLo}–${gHi} this audience expects. Shorten your longest sentences and swap long words for short ones.`,
    };
  }
  return {
    status: "on-target",
    label: "On target",
    advice: `Grade ${grade} sits inside the grade ${gLo}–${gHi} band for this audience. Flesch ${flesch} against a ${audience.flesch[0]}–${audience.flesch[1]} target.`,
  };
}

/** Where the current score sits on the audience band, as a 0–100 position. */
export function bandPosition(grade: number, audience: Audience): number {
  const [lo, hi] = audience.grade;
  const span = Math.max(1, hi - lo);
  // Render one band-width of headroom either side so out-of-range still shows.
  const min = lo - span;
  const max = hi + span;
  return Math.max(0, Math.min(100, ((grade - min) / (max - min)) * 100));
}
