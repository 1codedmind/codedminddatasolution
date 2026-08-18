/**
 * Read-only sanity check for the Google sign-in migration.
 *
 *   node --env-file=.env.local scripts/check-oauth-tables.mjs
 *
 * Uses the same DATABASE_URL the app does, so there is no ambiguity about
 * which Neon branch or database is being inspected. Nothing here writes.
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/check-oauth-tables.mjs");
  process.exit(1);
}

const sql = neon(url);

const [{ db }] = await sql`SELECT current_database() AS db`;
console.log(`\nConnected to database: ${db}\n`);

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name
`;
console.log("Tables:");
console.log(tables.map((t) => `  ${t.table_name}`).join("\n") || "  (none)");

const expected = [
  "candidates",
  "team_members",
  "candidate_identities",
  "team_member_identities",
  "rate_limits",
  "audit_log",
  "email_verification_tokens",
];
const present = new Set(tables.map((t) => t.table_name));
console.log("\nMigration check:");
for (const name of expected) {
  console.log(`  ${present.has(name) ? "OK     " : "MISSING"} ${name}`);
}

if (present.has("candidate_identities")) {
  const rows = await sql`SELECT provider, email, created_at FROM candidate_identities ORDER BY created_at`;
  console.log(`\nLinked candidate identities (${rows.length}):`);
  for (const r of rows) console.log(`  ${r.provider}  ${r.email}  ${r.created_at}`);
}

if (present.has("team_member_identities")) {
  const rows = await sql`SELECT provider, email, created_at FROM team_member_identities ORDER BY created_at`;
  console.log(`\nLinked staff identities (${rows.length}):`);
  for (const r of rows) console.log(`  ${r.provider}  ${r.email}  ${r.created_at}`);
}

// session_version is a column, not a table, so check it separately.
const versionColumns = await sql`
  SELECT table_name FROM information_schema.columns
  WHERE table_schema = 'public' AND column_name = 'session_version'
`;
const withVersion = new Set(versionColumns.map((c) => c.table_name));
for (const name of ["candidates", "team_members"]) {
  console.log(`  ${withVersion.has(name) ? "OK     " : "MISSING"} ${name}.session_version`);
}

const verifiedCol = await sql`
  SELECT table_name FROM information_schema.columns
  WHERE table_schema = 'public' AND column_name = 'email_verified'
`;
console.log(`  ${verifiedCol.length ? "OK     " : "MISSING"} candidates.email_verified`);

const phoneCol = await sql`
  SELECT table_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'phone'
`;
console.log(`  ${phoneCol.length ? "OK     " : "MISSING"} leads.phone`);

if (present.has("leads")) {
  const [row] = await sql`SELECT count(*)::int AS n FROM leads`;
  const bySource = await sql`SELECT source, count(*)::int AS n FROM leads GROUP BY source ORDER BY n DESC`;
  console.log(`\nLeads (${row.n}):`);
  for (const r of bySource) console.log(`  ${String(r.n).padStart(4)}  ${r.source ?? "(none)"}`);
}

if (present.has("audit_log")) {
  const rows = await sql`
    SELECT action, actor_email, target_id, created_at
    FROM audit_log ORDER BY created_at DESC LIMIT 10
  `;
  console.log(`\nMost recent audited actions (${rows.length}):`);
  for (const r of rows) console.log(`  ${r.action.padEnd(24)} by ${r.actor_email}`);
}

if (present.has("team_members")) {
  const rows = await sql`
    SELECT email, role, is_active AS "isActive", (password_hash IS NULL) AS "noPassword"
    FROM team_members ORDER BY role, email
  `;
  console.log(`\nStaff accounts (${rows.length}):`);
  for (const r of rows) {
    const flags = [
      r.isActive ? "active  " : "INACTIVE",
      r.noPassword ? "NO PASSWORD" : "has password",
    ].join("  ");
    console.log(`  ${r.role.padEnd(11)} ${flags}  ${r.email}`);
  }
}

if (present.has("candidates")) {
  const rows = await sql`
    SELECT email, (password_hash IS NULL) AS google_only, created_at
    FROM candidates ORDER BY created_at DESC LIMIT 10
  `;
  console.log(`\nMost recent candidates — google_only = passwordless (${rows.length}):`);
  for (const r of rows) console.log(`  ${r.google_only ? "google-only " : "has password"}  ${r.email}`);
}

console.log("");
