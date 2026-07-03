/**
 * Seeds a set of Python questions into the exam question bank.
 * Safe to re-run — skips if a question with the same text already exists.
 *
 *   npx tsx --env-file=.env.local scripts/seed-python-questions.ts
 */
import { createQuestion, listQuestions } from "../lib/exam/db/questions";
import { DEFAULT_TENANT_ID } from "../lib/exam/types";
import type { CreateQuestionInput } from "../lib/exam/db/questions";

const QUESTIONS: Omit<CreateQuestionInput, "createdBy">[] = [
  {
    type: "mcq_single",
    difficulty: "easy",
    marks: 1,
    tags: ["python", "basics"],
    content: {
      text: "What is the output of `print(type([]))` in Python?",
      options: [
        { id: "opt-1", text: "<class 'list'>", isCorrect: true },
        { id: "opt-2", text: "<class 'tuple'>", isCorrect: false },
        { id: "opt-3", text: "<class 'dict'>", isCorrect: false },
        { id: "opt-4", text: "<class 'array'>", isCorrect: false },
      ],
    },
  },
  {
    type: "mcq_single",
    difficulty: "easy",
    marks: 1,
    tags: ["python", "strings"],
    content: {
      text: "Which method converts a string to lowercase in Python?",
      options: [
        { id: "opt-1", text: "str.toLower()", isCorrect: false },
        { id: "opt-2", text: "str.lower()", isCorrect: true },
        { id: "opt-3", text: "str.lowercase()", isCorrect: false },
        { id: "opt-4", text: "lower(str)", isCorrect: false },
      ],
    },
  },
  {
    type: "mcq_single",
    difficulty: "medium",
    marks: 2,
    tags: ["python", "data-structures"],
    content: {
      text: "What is the time complexity of a dictionary lookup by key in Python (average case)?",
      options: [
        { id: "opt-1", text: "O(n)", isCorrect: false },
        { id: "opt-2", text: "O(log n)", isCorrect: false },
        { id: "opt-3", text: "O(1)", isCorrect: true },
        { id: "opt-4", text: "O(n log n)", isCorrect: false },
      ],
    },
  },
  {
    type: "mcq_multi",
    difficulty: "medium",
    marks: 2,
    tags: ["python", "data-structures"],
    content: {
      text: "Which of the following are **immutable** types in Python? (Select all that apply)",
      options: [
        { id: "opt-1", text: "tuple", isCorrect: true },
        { id: "opt-2", text: "list", isCorrect: false },
        { id: "opt-3", text: "str", isCorrect: true },
        { id: "opt-4", text: "dict", isCorrect: false },
        { id: "opt-5", text: "frozenset", isCorrect: true },
      ],
    },
  },
  {
    type: "true_false",
    difficulty: "easy",
    marks: 1,
    tags: ["python", "basics"],
    content: {
      text: "In Python, indentation is syntactically significant and defines code blocks.",
      options: [
        { id: "opt-1", text: "True", isCorrect: true },
        { id: "opt-2", text: "False", isCorrect: false },
      ],
    },
  },
  {
    type: "mcq_single",
    difficulty: "hard",
    marks: 3,
    tags: ["python", "closures", "gotchas"],
    content: {
      text: "What does this print?\n\n```python\nfuncs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])\n```",
      options: [
        { id: "opt-1", text: "[0, 1, 2]", isCorrect: false },
        { id: "opt-2", text: "[2, 2, 2]", isCorrect: true },
        { id: "opt-3", text: "[0, 0, 0]", isCorrect: false },
        { id: "opt-4", text: "SyntaxError", isCorrect: false },
      ],
    },
  },
  {
    type: "essay",
    difficulty: "medium",
    marks: 5,
    tags: ["python", "concepts"],
    content: {
      text: "Explain the difference between a shallow copy and a deep copy in Python. When would each cause bugs?",
      sampleAnswer:
        "A shallow copy (copy.copy / list slicing) duplicates the outer container but shares references to nested objects, so mutating a nested object through the copy also affects the original. A deep copy (copy.deepcopy) recursively duplicates everything. Shallow copies cause bugs when nested structures are mutated; deep copies can cause performance issues or break on objects holding external resources.",
    },
  },
  {
    type: "mcq_single",
    difficulty: "medium",
    marks: 2,
    tags: ["python", "functions"],
    content: {
      text: "Why is `def f(items=[])` considered a Python anti-pattern?",
      options: [
        { id: "opt-1", text: "Lists cannot be default arguments", isCorrect: false },
        { id: "opt-2", text: "The default list is created once and shared across all calls", isCorrect: true },
        { id: "opt-3", text: "It raises a DeprecationWarning in Python 3", isCorrect: false },
        { id: "opt-4", text: "Default arguments must be strings or numbers", isCorrect: false },
      ],
    },
  },
];

async function run() {
  const { questions: existing } = await listQuestions(DEFAULT_TENANT_ID, {
    tag: "python",
    limit: 200,
  });
  const existingTexts = new Set(existing.map((q) => q.content.text));

  let created = 0;
  for (const q of QUESTIONS) {
    if (existingTexts.has(q.content.text)) continue;
    const row = await createQuestion(DEFAULT_TENANT_ID, { ...q, createdBy: "seed-script" });
    // Publish immediately so they're usable in exams
    const { updateQuestion } = await import("../lib/exam/db/questions");
    await updateQuestion(DEFAULT_TENANT_ID, row.id, { status: "published" });
    created++;
    console.log(`  ✅  ${q.type.padEnd(11)} ${q.content.text.slice(0, 60)}…`);
  }
  console.log(`\n🎉  ${created} created, ${QUESTIONS.length - created} already existed\n`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
