import { createHmac } from "crypto";

import { getSql, hasDatabaseUrl } from "@/lib/db";

/**
 * Unique-visitor counting for a single page.
 *
 * "Unique" here means a distinct (IP, user-agent) pair, which is the most we
 * can honestly claim without tracking people. It over-counts someone who
 * switches from phone to laptop, and under-counts two people behind one office
 * NAT with the same browser build. That is fine for a "people find this
 * useful" signal; it is not an analytics product.
 *
 * We never store the IP. It is folded into an HMAC keyed with AUTH_SECRET
 * alongside the page and user-agent, and only that digest is written. The
 * digest is not reversible, and without the secret it cannot be recomputed
 * from a candidate IP either, so the table is not a log of who visited.
 *
 * The key is deliberately NOT rotated per day: a stable digest is what makes
 * an all-time unique count possible. Day is a separate column, so today's
 * figure is a genuine count of distinct people today rather than a count of
 * first-time visitors.
 */

const DAY_MS = 24 * 60 * 60_000;

/** Rows older than this are swept; two years is far past being interesting. */
const RETENTION_DAYS = 730;

/**
 * Automated traffic would drown the number this widget exists to show. This
 * list is not exhaustive and does not need to be - anything that lies about
 * its user-agent to look like a browser was never going to be filtered out by
 * reading the user-agent.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|whatsapp|telegram|headlesschrome|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python-requests|httpx|axios|go-http-client|java\/|okhttp|scrapy|phantomjs|puppeteer|playwright/i;

export function isLikelyBot(userAgent: string | null) {
  if (!userAgent || userAgent.trim().length < 10) return true;
  return BOT_PATTERN.test(userAgent);
}

/** UTC calendar day, so the daily figure does not shift with server region. */
export function utcDay(at = new Date()) {
  return at.toISOString().slice(0, 10);
}

function visitorHash(page: string, ip: string, userAgent: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // Local development without a configured secret. The digest is still
    // one-way; it is simply not secret, which is acceptable off production.
    return createHmac("sha256", "codedmind-dev-visitor-salt")
      .update(`${page} ${ip} ${userAgent}`)
      .digest("base64url")
      .slice(0, 32);
  }
  return createHmac("sha256", secret)
    .update(`visitor ${page} ${ip} ${userAgent}`)
    .digest("base64url")
    .slice(0, 32);
}

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS page_visitors (
      page         TEXT        NOT NULL,
      day          TEXT        NOT NULL,
      visitor_hash TEXT        NOT NULL,
      seen_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (page, day, visitor_hash)
    )
  `;
  // Serves both reads: the daily count filters on (page, day), and the
  // all-time DISTINCT scan is index-only rather than touching the heap.
  await sql`
    CREATE INDEX IF NOT EXISTS idx_page_visitors_page_hash
      ON page_visitors (page, visitor_hash)
  `;
  tableReady = true;
}

/** Opportunistic cleanup, mirroring the approach in lib/auth/rate-limit.ts. */
async function maybeSweep() {
  if (Math.random() > 0.01) return;
  try {
    const sql = getSql();
    await sql`
      DELETE FROM page_visitors
      WHERE day < ${utcDay(new Date(Date.now() - RETENTION_DAYS * DAY_MS))}
    `;
  } catch {
    // Sweeping is housekeeping; never let it fail a page view.
  }
}

export type VisitorCounts = {
  /** Distinct visitors ever recorded for this page. */
  total: number;
  /** Distinct visitors so far during the current UTC day. */
  today: number;
};

// Two COUNTs per page view would be wasteful for a number that changes slowly
// and is decorative. One read per page per minute is plenty.
const COUNT_TTL_MS = 60_000;
const countCache = new Map<string, { at: number; counts: VisitorCounts }>();

async function readCounts(page: string): Promise<VisitorCounts> {
  const cached = countCache.get(page);
  if (cached && Date.now() - cached.at < COUNT_TTL_MS) {
    return cached.counts;
  }

  const sql = getSql();
  const [row] = await sql<[{ total: string; today: string }]>`
    SELECT
      COUNT(DISTINCT visitor_hash)::text AS total,
      COUNT(DISTINCT visitor_hash) FILTER (WHERE day = ${utcDay()})::text AS today
    FROM page_visitors
    WHERE page = ${page}
  `;

  const counts: VisitorCounts = {
    total: parseInt(row?.total ?? "0", 10) || 0,
    today: parseInt(row?.today ?? "0", 10) || 0,
  };
  countCache.set(page, { at: Date.now(), counts });
  return counts;
}

/**
 * Record a visit and return the current counts.
 *
 * `record: false` skips the write but still reads - used when the caller has
 * been rate limited, so an abusive client still gets a number back instead of
 * an error the widget would have to render as a broken state.
 *
 * Returns null when there is no database, so callers can render nothing at all
 * rather than a misleading zero.
 */
export async function recordAndCountVisit(input: {
  page: string;
  ip: string;
  userAgent: string | null;
  record?: boolean;
}): Promise<VisitorCounts | null> {
  if (!hasDatabaseUrl()) return null;

  try {
    await ensureTable();

    const shouldRecord =
      input.record !== false && input.ip !== "unknown" && !isLikelyBot(input.userAgent);

    if (shouldRecord) {
      const sql = getSql();
      const hash = visitorHash(input.page, input.ip, input.userAgent ?? "");
      const day = utcDay();

      const inserted = await sql<{ page: string }[]>`
        INSERT INTO page_visitors (page, day, visitor_hash)
        VALUES (${input.page}, ${day}, ${hash})
        ON CONFLICT (page, day, visitor_hash) DO NOTHING
        RETURNING page
      `;

      // A genuinely new visitor makes the cached counts wrong immediately, and
      // seeing your own visit counted is the point of the widget.
      if (inserted.length > 0) {
        countCache.delete(input.page);
      }
    }

    const counts = await readCounts(input.page);
    await maybeSweep();
    return counts;
  } catch (err) {
    console.error("[visitors] failed:", err);
    return null;
  }
}
