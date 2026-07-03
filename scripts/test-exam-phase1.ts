/**
 * Phase 1 smoke test for the exam module — exercises db-init, CRUD, search,
 * tenant scoping, and candidate answer-stripping end to end.
 *
 *   npx tsx --env-file=.env.local scripts/test-exam-phase1.ts
 */
import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
  updateQuestion,
} from "../lib/exam/db/questions";
import { DEFAULT_TENANT_ID, toCandidateQuestion } from "../lib/exam/types";

function ok(name: string) {
  console.log(`  ✅  ${name}`);
}
function fail(name: string, detail: unknown): never {
  console.error(`  ❌  ${name}`, detail);
  process.exit(1);
}

async function run() {
  // create
  const q = await createQuestion(DEFAULT_TENANT_ID, {
    type: "mcq_single",
    difficulty: "easy",
    content: {
      text: "SMOKE-TEST: What is 2 + 2?",
      options: [
        { id: "opt-1", text: "3", isCorrect: false },
        { id: "opt-2", text: "4", isCorrect: true },
      ],
    },
    tags: ["smoke-test", "math"],
    marks: 2,
    createdBy: "test-script",
  });
  if (!q?.id || q.status !== "draft") fail("create", q);
  ok(`create — id ${q.id.slice(0, 8)}…`);

  // read + tenant scoping
  const fetched = await getQuestion(DEFAULT_TENANT_ID, q.id);
  if (fetched?.content.options?.[1]?.isCorrect !== true) fail("get", fetched);
  ok("get — content JSONB round-trips");
  const crossTenant = await getQuestion("other-tenant", q.id);
  if (crossTenant !== null) fail("tenant scoping", crossTenant);
  ok("tenant scoping — invisible from another tenant");

  // candidate stripping
  const candidate = toCandidateQuestion(fetched!);
  const leaked = JSON.stringify(candidate).includes("isCorrect");
  if (leaked) fail("answer stripping", candidate);
  ok("candidate view — correct answers stripped");

  // update + publish
  const updated = await updateQuestion(DEFAULT_TENANT_ID, q.id, { status: "published" });
  if (updated?.status !== "published") fail("publish", updated);
  ok("update — publish status");

  // search + filters
  const bySearch = await listQuestions(DEFAULT_TENANT_ID, { search: "SMOKE-TEST" });
  if (!bySearch.questions.some((x) => x.id === q.id)) fail("search", bySearch);
  ok(`search — found via ILIKE (total ${bySearch.total})`);
  const byTag = await listQuestions(DEFAULT_TENANT_ID, { tag: "smoke-test" });
  if (!byTag.questions.some((x) => x.id === q.id)) fail("tag filter", byTag);
  ok("tag filter — GIN array containment");

  // delete
  const deleted = await deleteQuestion(DEFAULT_TENANT_ID, q.id);
  if (!deleted) fail("delete", deleted);
  const gone = await getQuestion(DEFAULT_TENANT_ID, q.id);
  if (gone !== null) fail("delete verify", gone);
  ok("delete — row removed");

  console.log("\n🎉  Phase 1 exam module: all checks passed\n");
  process.exit(0);
}

run().catch((e) => {
  console.error("Unhandled failure:", e);
  process.exit(1);
});
