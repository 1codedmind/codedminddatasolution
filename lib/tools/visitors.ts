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

/**
 * Pages we count, keyed by the slug the browser sends.
 *
 * The API takes a slug and looks the real page key up here rather than
 * accepting a page name from the caller. Without that, anyone could POST
 * arbitrary names and fill the table with rows of their own invention.
 *
 * Keys must never change once live — they are the identity of the historical
 * data, so renaming one silently orphans everything recorded before.
 */
export const TRACKED_PAGES: Record<string, { key: string; label: string }> = {
  "word-counter": { key: "tools/word-counter", label: "Word Counter" },
  "torn-profit": { key: "tools/games/torn-profit", label: "Torn Profit Finder" },
};

export function resolvePage(slug: string): string | null {
  return TRACKED_PAGES[slug]?.key ?? null;
}

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
  // Added after the table shipped, so CREATE TABLE IF NOT EXISTS above will not
  // introduce it on existing deployments — same pattern as lib/leads.ts.
  // Rows written before this existed default to a single visit, which is the
  // truth we have for them.
  await sql`
    ALTER TABLE page_visitors
      ADD COLUMN IF NOT EXISTS visits INTEGER NOT NULL DEFAULT 1
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

      // Increment rather than ignore the conflict: the unique count comes from
      // distinct hashes, but total visits needs every view.
      const [row] = await sql<{ visits: number }[]>`
        INSERT INTO page_visitors (page, day, visitor_hash, visits)
        VALUES (${input.page}, ${day}, ${hash}, 1)
        ON CONFLICT (page, day, visitor_hash)
        DO UPDATE SET visits = page_visitors.visits + 1
        RETURNING visits
      `;

      // visits = 1 means the row was just created, so this is a visitor we had
      // not seen today and the cached counts are now stale.
      if (row?.visits === 1) {
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

/* ── Admin analytics ───────────────────────────────────────────────────── */

export type DayPoint = { day: string; visitors: number; visits: number };

/** Inclusive YYYY-MM-DD bounds. */
export type Range = { from: string; to: string };

export type PageAnalytics = {
  slug: string;
  label: string;
  range: Range;

  /* Within the selected range */
  visitors: number;
  visits: number;
  /**
   * Visitors seen on more than one separate day inside the range.
   *
   * This is the honest definition available from what we store: we hold no
   * cookie or account, so "recurring" means the same IP and browser came back
   * on a different day. Someone on a phone whose IP changes between visits
   * counts as two new visitors, so this figure is a floor, not an exact count.
   */
  recurring: number;
  /** Visitors in the range whose first ever visit falls inside it. */
  newVisitors: number;

  /* All time, for context */
  allTimeVisitors: number;
  allTimeVisits: number;
  allTimeRecurring: number;

  /* Today */
  todayVisitors: number;
  todayVisits: number;
  todayReturning: number;

  series: DayPoint[];
  busiestDay: DayPoint | null;
};

function num(v: unknown): number {
  const n = parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Clamp a user-supplied date to YYYY-MM-DD, falling back when malformed. */
export function safeDay(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const t = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(t) ? value : fallback;
}

export function defaultRange(days = 30): Range {
  return {
    from: utcDay(new Date(Date.now() - days * DAY_MS)),
    to: utcDay(),
  };
}

/** Analytics for one tracked page over an inclusive day range. */
export async function getPageAnalytics(
  slug: string,
  range: Range = defaultRange(),
): Promise<PageAnalytics | null> {
  const entry = TRACKED_PAGES[slug];
  if (!entry || !hasDatabaseUrl()) return null;

  await ensureTable();
  const sql = getSql();
  const page = entry.key;
  const today = utcDay();
  const { from, to } = range;

  const [inRange] = await sql<{ visitors: string; visits: string }[]>`
    SELECT
      COUNT(DISTINCT visitor_hash)::text AS visitors,
      COALESCE(SUM(visits), 0)::text     AS visits
    FROM page_visitors
    WHERE page = ${page} AND day >= ${from} AND day <= ${to}
  `;

  const [allTime] = await sql<
    { visitors: string; visits: string; today_visitors: string; today_visits: string }[]
  >`
    SELECT
      COUNT(DISTINCT visitor_hash)::text                                AS visitors,
      COALESCE(SUM(visits), 0)::text                                    AS visits,
      COUNT(DISTINCT visitor_hash) FILTER (WHERE day = ${today})::text  AS today_visitors,
      COALESCE(SUM(visits) FILTER (WHERE day = ${today}), 0)::text      AS today_visits
    FROM page_visitors
    WHERE page = ${page}
  `;

  // Seen on 2+ distinct days inside the range.
  const [recurring] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM (
      SELECT visitor_hash FROM page_visitors
      WHERE page = ${page} AND day >= ${from} AND day <= ${to}
      GROUP BY visitor_hash HAVING COUNT(DISTINCT day) > 1
    ) AS x
  `;

  const [allRecurring] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM (
      SELECT visitor_hash FROM page_visitors WHERE page = ${page}
      GROUP BY visitor_hash HAVING COUNT(DISTINCT day) > 1
    ) AS x
  `;

  // First-time visitors: present in the range and never seen before it.
  const [fresh] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM (
      SELECT visitor_hash FROM page_visitors WHERE page = ${page}
      GROUP BY visitor_hash
      HAVING MIN(day) >= ${from} AND MIN(day) <= ${to}
    ) AS x
  `;

  // Today's visitors who also appear on an earlier day.
  const [returning] = await sql<{ n: string }[]>`
    SELECT COUNT(*)::text AS n FROM (
      SELECT visitor_hash FROM page_visitors WHERE page = ${page}
      GROUP BY visitor_hash
      HAVING bool_or(day = ${today}) AND bool_or(day < ${today})
    ) AS x
  `;

  const rows = await sql<{ day: string; visitors: string; visits: string }[]>`
    SELECT day,
           COUNT(DISTINCT visitor_hash)::text AS visitors,
           COALESCE(SUM(visits), 0)::text     AS visits
    FROM page_visitors
    WHERE page = ${page} AND day >= ${from} AND day <= ${to}
    GROUP BY day ORDER BY day ASC
  `;

  // Fill gaps so the chart shows quiet days rather than silently compressing
  // them — a run of zeroes is information.
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const series: DayPoint[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    const day = utcDay(new Date(t));
    const r = byDay.get(day);
    series.push({ day, visitors: num(r?.visitors), visits: num(r?.visits) });
  }

  const withData = series.filter((p) => p.visitors > 0);
  const busiestDay = withData.length
    ? withData.reduce((a, b) => (b.visitors > a.visitors ? b : a))
    : null;

  return {
    slug,
    label: entry.label,
    range,
    visitors: num(inRange?.visitors),
    visits: num(inRange?.visits),
    recurring: num(recurring?.n),
    newVisitors: num(fresh?.n),
    allTimeVisitors: num(allTime?.visitors),
    allTimeVisits: num(allTime?.visits),
    allTimeRecurring: num(allRecurring?.n),
    todayVisitors: num(allTime?.today_visitors),
    todayVisits: num(allTime?.today_visits),
    todayReturning: num(returning?.n),
    series,
    busiestDay,
  };
}

/** Analytics for every tracked page, for the admin overview. */
export async function getAllPageAnalytics(range: Range = defaultRange()): Promise<PageAnalytics[]> {
  const out: PageAnalytics[] = [];
  for (const slug of Object.keys(TRACKED_PAGES)) {
    const a = await getPageAnalytics(slug, range);
    if (a) out.push(a);
  }
  return out;
}
