/**
 * Creates your superadmin account in team_members.
 * Safe to re-run — skips if email already exists.
 *
 *   npx tsx --env-file=.env.local scripts/seed-superadmin.ts
 */
import postgres from "postgres";
import { randomBytes, scryptSync } from "crypto";
import { randomUUID } from "crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌  DATABASE_URL not set.");
  process.exit(1);
}

// ── Change these before running ──────────────────────────────────────────────
const FULL_NAME = "Vaibhav Srivastava";
const EMAIL     = "vaibhavsrvtv7@gmail.com";
const PASSWORD  = "CodedMind@2026";          // change after first login
// ─────────────────────────────────────────────────────────────────────────────

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

const sql = postgres(url, { ssl: "require", max: 1, connect_timeout: 10 });

async function run() {
  const existing = await sql`
    SELECT id FROM team_members WHERE email = ${EMAIL} LIMIT 1
  `;

  if (existing.length > 0) {
    console.log(`ℹ️   Account already exists for ${EMAIL} (id: ${existing[0].id})`);
    console.log("    To reset your password, run this script again after changing PASSWORD above.");
    await sql.end();
    return;
  }

  const { salt, hash } = hashPassword(PASSWORD);
  const id = randomUUID();
  const now = new Date().toISOString();

  await sql`
    INSERT INTO team_members
      (id, full_name, email, role, is_active, password_hash, password_salt, created_at)
    VALUES
      (${id}, ${FULL_NAME}, ${EMAIL}, 'superadmin', true, ${hash}, ${salt}, ${now})
  `;

  console.log(`\n✅  Superadmin account created\n`);
  console.log(`   Name     : ${FULL_NAME}`);
  console.log(`   Email    : ${EMAIL}`);
  console.log(`   Password : ${PASSWORD}`);
  console.log(`   Role     : superadmin`);
  console.log(`   ID       : ${id}`);
  console.log(`\n⚠️   Change your password after first login.\n`);

  await sql.end();
}

run().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
