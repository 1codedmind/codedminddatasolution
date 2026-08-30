/**
 * Platform-accurate text measurement.
 *
 * Every other word counter measures `text.length` against a table of round
 * numbers. That is wrong often enough to matter:
 *
 *  - `"👍".length` is 2, and a family emoji is 7+. Users count 1.
 *  - X does not count characters. It counts a weighted length where any URL is
 *    23 regardless of length, and CJK/emoji count double.
 *  - SMS is not "160 characters". It is 160 per segment in GSM-7, but a single
 *    emoji or curly quote flips the whole message to UCS-2 at 70 per segment,
 *    and multipart messages lose further room to segment headers. Getting this
 *    wrong costs real money.
 *  - Google truncates search results by pixel width, not character count.
 *
 * These functions implement the real rules. Pixel measurement needs a canvas
 * and so lives in the component; everything here is pure.
 */

/* ── Graphemes ─────────────────────────────────────────────────────────── */

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

/**
 * Characters as a human counts them.
 *
 * "👨‍👩‍👧‍👦" is one grapheme, seven UTF-16 code units. Falls back to code-point
 * counting where Intl.Segmenter is unavailable, which is still far closer than
 * `.length`.
 */
export function countGraphemes(text: string): number {
  if (!text) return 0;
  if (segmenter) {
    // Intl.Segmenter has no length; iterating is the documented way to count.
    let n = 0;
    for (const seg of segmenter.segment(text)) { void seg; n++; }
    return n;
  }
  return [...text].length;
}

/* ── X / Twitter weighted length ───────────────────────────────────────── */

/**
 * Ranges that count as 1. Everything outside them counts as 2.
 * Taken from twitter-text's default weighted-length configuration.
 */
const WEIGHT_ONE_RANGES: [number, number][] = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

/** t.co wraps every link to a fixed length, however long the original. */
export const TCO_LENGTH = 23;

const URL_RE = /https?:\/\/[^\s]+|(?:^|\s)(?:www\.)[^\s]+/gi;

export function twitterWeightedLength(text: string): number {
  if (!text) return 0;

  // Swap URLs for a placeholder of the fixed t.co weight first, so their real
  // characters never reach the weighting pass.
  let weight = 0;
  const withoutUrls = text.replace(URL_RE, (m) => {
    const lead = /^\s/.test(m) ? m[0] : "";
    weight += TCO_LENGTH;
    return lead;
  });

  for (const ch of withoutUrls) {
    const cp = ch.codePointAt(0) ?? 0;
    const light = WEIGHT_ONE_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
    weight += light ? 1 : 2;
  }
  return weight;
}

/* ── SMS segmentation ──────────────────────────────────────────────────── */

/** The GSM 03.38 basic character set. */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/** These exist in GSM-7 only via an escape, so each costs two septets. */
const GSM_EXTENDED = "^{}\\[~]|€";

const GSM_BASIC_SET = new Set(GSM_BASIC);
const GSM_EXTENDED_SET = new Set(GSM_EXTENDED);

export type SmsInfo = {
  encoding: "GSM-7" | "UCS-2";
  /** Billable units: septets for GSM-7, UTF-16 code units for UCS-2. */
  units: number;
  segments: number;
  perSegment: number;
  /** Units left before another segment is added. */
  remaining: number;
  /** The first character that forced UCS-2, if any. */
  forcedBy: string | null;
};

export function smsInfo(text: string): SmsInfo {
  let units = 0;
  let forcedBy: string | null = null;

  for (const ch of text) {
    if (GSM_BASIC_SET.has(ch)) units += 1;
    else if (GSM_EXTENDED_SET.has(ch)) units += 2;
    else {
      forcedBy = ch;
      break;
    }
  }

  if (forcedBy !== null) {
    // UCS-2: billed per UTF-16 code unit, so astral characters cost 2.
    const ucsUnits = text.length;
    const perSegment = ucsUnits <= 70 ? 70 : 67;
    const segments = ucsUnits === 0 ? 0 : Math.ceil(ucsUnits / perSegment);
    return {
      encoding: "UCS-2",
      units: ucsUnits,
      segments,
      perSegment,
      remaining: Math.max(0, segments * perSegment - ucsUnits),
      forcedBy,
    };
  }

  const perSegment = units <= 160 ? 160 : 153;
  const segments = units === 0 ? 0 : Math.ceil(units / perSegment);
  return {
    encoding: "GSM-7",
    units,
    segments,
    perSegment,
    remaining: Math.max(0, segments * perSegment - units),
    forcedBy: null,
  };
}

/* ── Platform table ────────────────────────────────────────────────────── */

export type Platform = {
  id: string;
  name: string;
  /** Hard maximum the platform will accept. */
  max: number;
  /**
   * Where the platform visually cuts the text with a "see more" style control,
   * when that differs from the maximum. This is the number that actually
   * decides whether anyone reads your first sentence.
   */
  truncateAt?: number;
  /** How the count is derived, so the UI can explain itself. */
  measure: "grapheme" | "twitter" | "sms";
  hint?: string;
};

export const PLATFORMS: Platform[] = [
  { id: "x", name: "X / Twitter", max: 280, measure: "twitter", hint: "Links always count as 23." },
  { id: "sms", name: "SMS", max: 160, measure: "sms", hint: "One emoji drops the limit to 70." },
  { id: "seo-title", name: "Google title", max: 60, measure: "grapheme", hint: "Google truncates by pixel width, not characters." },
  { id: "seo-desc", name: "Meta description", max: 155, measure: "grapheme", hint: "Google truncates by pixel width, not characters." },
  { id: "linkedin", name: "LinkedIn post", max: 3000, truncateAt: 140, measure: "grapheme", hint: "Only ~140 characters show before “see more”." },
  { id: "instagram", name: "Instagram caption", max: 2200, truncateAt: 125, measure: "grapheme", hint: "Only ~125 characters show before “more”." },
  { id: "ig-bio", name: "Instagram bio", max: 150, measure: "grapheme" },
  { id: "yt-title", name: "YouTube title", max: 100, truncateAt: 70, measure: "grapheme", hint: "Search results cut around 70." },
  { id: "yt-desc", name: "YouTube description", max: 5000, truncateAt: 157, measure: "grapheme", hint: "Only ~157 characters show above the fold." },
  { id: "email", name: "Email subject", max: 78, truncateAt: 41, measure: "grapheme", hint: "Mobile inboxes cut around 41." },
  { id: "facebook", name: "Facebook post", max: 63206, truncateAt: 477, measure: "grapheme", hint: "Cuts at ~477 with “see more”." },
  { id: "reddit", name: "Reddit title", max: 300, measure: "grapheme" },
];

/** The count for a given platform, using that platform's own rules. */
export function measureFor(text: string, platform: Platform): number {
  switch (platform.measure) {
    case "twitter":
      return twitterWeightedLength(text);
    case "sms":
      return smsInfo(text).units;
    default:
      return countGraphemes(text);
  }
}

/**
 * Cut a string to a grapheme count without splitting an emoji in half, which
 * is what `slice` does and why truncated previews elsewhere show tofu boxes.
 */
export function truncateGraphemes(text: string, limit: number): string {
  if (!segmenter) return [...text].slice(0, limit).join("");
  const out: string[] = [];
  for (const { segment } of segmenter.segment(text)) {
    if (out.length >= limit) break;
    out.push(segment);
  }
  return out.join("");
}
