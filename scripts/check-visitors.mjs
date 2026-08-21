/**
 * Inspect (and optionally reset) the page_visitors table.
 *
 *   node --env-file=.env.local scripts/check-visitors.mjs
 *   node --env-file=.env.local scripts/check-visitors.mjs --reset
 *
 * --reset deletes every row for the Torn page. Only useful to clear test data;
 * it destroys the count, so it will ask for confirmation via an explicit flag.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/check-visitors.mjs");
  process.exit(1);
}

const sql = neon(url);
const PAGE = "tools/games/torn-profit";

const exists = await sql`
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'page_visitors'
`;
if (exists.length === 0) {
  console.log("\npage_visitors does not exist yet. It is created on the first visit.\n");
  process.exit(0);
}

if (process.argv.includes("--reset")) {
  const deleted = await sql`DELETE FROM page_visitors WHERE page = ${PAGE} RETURNING page`;
  console.log(`\nDeleted ${deleted.length} row(s) for ${PAGE}.\n`);
  process.exit(0);
}

const cols = await sql`
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'page_visitors'
  ORDER BY ordinal_position
`;
console.log("\npage_visitors columns:");
for (const c of cols) console.log(`  ${c.column_name.padEnd(14)} ${c.data_type}`);

const [totals] = await sql`
  SELECT
    COUNT(DISTINCT visitor_hash)::int AS total,
    COUNT(*)::int                     AS rows
  FROM page_visitors WHERE page = ${PAGE}
`;
console.log(`\n${PAGE}`);
console.log(`  unique visitors (all time): ${totals?.total ?? 0}`);
console.log(`  visitor-days recorded:      ${totals?.rows ?? 0}`);

const byDay = await sql`
  SELECT day, COUNT(*)::int AS n FROM page_visitors
  WHERE page = ${PAGE} GROUP BY day ORDER BY day DESC LIMIT 14
`;
console.log("\n  Unique visitors per day (last 14):");
for (const r of byDay) console.log(`    ${r.day}  ${String(r.n).padStart(5)}`);

const sample = await sql`
  SELECT visitor_hash FROM page_visitors WHERE page = ${PAGE} LIMIT 3
`;
console.log("\n  Stored identifiers (should be opaque digests, never IPs):");
for (const r of sample) console.log(`    ${r.visitor_hash}`);
console.log("");
