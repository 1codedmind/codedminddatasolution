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

const expected = ["candidates", "team_members", "candidate_identities", "team_member_identities"];
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
