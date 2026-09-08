/**
 * Inspect page visitor analytics, and clean up synthetic test rows.
 *
 *   node --env-file=.env.local scripts/check-page-analytics.mjs
 *   node --env-file=.env.local scripts/check-page-analytics.mjs --purge-ips 203.0.113.50,198.51.100.50
 *
 * --purge-ips recomputes the exact visitor digests for the given IPs and
 * deletes only those rows. It is for removing rows created while testing
 * against a live database; it cannot touch real visitors, because a real
 * visitor's IP is not known to us.
 */
import { neon } from "@neondatabase/serverless";
import { createHmac } from "crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/check-page-analytics.mjs");
  process.exit(1);
}

const sql = neon(url);

const PAGES = {
  "word-counter": "tools/word-counter",
  "torn-profit": "tools/games/torn-profit",
};

// Must mirror visitorHash() in lib/tools/visitors.ts exactly.
function visitorHash(page, ip, userAgent) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
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

const purgeArg = process.argv.indexOf("--purge-ips");
if (purgeArg !== -1) {
  const ips = (process.argv[purgeArg + 1] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const uas = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  ];
  let removed = 0;
  for (const page of Object.values(PAGES)) {
    for (const ip of ips) {
      for (const ua of uas) {
        const h = visitorHash(page, ip, ua);
        const gone = await sql`
          DELETE FROM page_visitors WHERE page = ${page} AND visitor_hash = ${h} RETURNING page
        `;
        removed += gone.length;
      }
    }
  }
  console.log(`\nRemoved ${removed} synthetic row(s).\n`);
}

const today = new Date().toISOString().slice(0, 10);

for (const [slug, page] of Object.entries(PAGES)) {
  const [t] = await sql`
    SELECT
      COALESCE(SUM(visits),0)::int                                     AS total_visits,
      COUNT(DISTINCT visitor_hash)::int                                AS uniques,
      COUNT(DISTINCT visitor_hash) FILTER (WHERE day = ${today})::int  AS today_visitors
    FROM page_visitors WHERE page = ${page}
  `;
  const [r] = await sql`
    SELECT COUNT(*)::int AS n FROM (
      SELECT visitor_hash FROM page_visitors WHERE page = ${page}
      GROUP BY visitor_hash HAVING COUNT(DISTINCT day) > 1
    ) x
  `;
  const days = await sql`
    SELECT day, COUNT(DISTINCT visitor_hash)::int AS v, SUM(visits)::int AS hits
    FROM page_visitors WHERE page = ${page}
    GROUP BY day ORDER BY day DESC LIMIT 7
  `;

  console.log(`\n${slug}  (${page})`);
  console.log(`  unique visitors    ${t?.uniques ?? 0}`);
  console.log(`  total visits       ${t?.total_visits ?? 0}`);
  console.log(`  recurring (2+ days)${String(r?.n ?? 0).padStart(3)}`);
  console.log(`  today              ${t?.today_visitors ?? 0}`);
  if (days.length) {
    console.log("  recent days:");
    for (const d of days) console.log(`    ${d.day}  ${String(d.v).padStart(4)} visitors  ${String(d.hits).padStart(5)} visits`);
  }
}
console.log("");
