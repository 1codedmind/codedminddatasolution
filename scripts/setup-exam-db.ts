/**
 * One-time exam module migration. Safe to re-run (CREATE ... IF NOT EXISTS).
 * After running, set EXAM_SKIP_DDL=1 in .env.local so requests skip the DDL.
 *
 *   npx tsx --env-file=.env.local scripts/setup-exam-db.ts
 */
import { ensureExamTables } from "../lib/exam/db-init";

ensureExamTables()
  .then(() => {
    console.log("✅  Exam tables ready. Add EXAM_SKIP_DDL=1 to .env.local.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌  Migration failed:", e);
    process.exit(1);
  });
