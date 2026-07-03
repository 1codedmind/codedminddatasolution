import type {
  QuestionContent,
  QuestionDifficulty,
  QuestionType,
} from "./types";

const QUESTION_TYPES: QuestionType[] = [
  "mcq_single",
  "mcq_multi",
  "true_false",
  "essay",
  "coding",
];

const DIFFICULTIES: QuestionDifficulty[] = ["easy", "medium", "hard"];

export type ValidQuestionBody = {
  type: QuestionType;
  difficulty: QuestionDifficulty;
  content: QuestionContent;
  tags: string[];
  marks: number;
};

/** Whitelist-validate a question payload. Returns an error string or the clean body. */
export function validateQuestionBody(
  body: unknown,
): { error: string } | { value: ValidQuestionBody } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const b = body as Record<string, unknown>;

  const type = b.type as QuestionType;
  if (!QUESTION_TYPES.includes(type)) return { error: "Invalid question type" };

  const difficulty = (b.difficulty ?? "medium") as QuestionDifficulty;
  if (!DIFFICULTIES.includes(difficulty)) return { error: "Invalid difficulty" };

  const content = b.content as QuestionContent | undefined;
  if (!content || typeof content.text !== "string" || !content.text.trim()) {
    return { error: "Question text is required" };
  }
  if (content.text.length > 10_000) return { error: "Question text too long" };

  const needsOptions = type === "mcq_single" || type === "mcq_multi" || type === "true_false";
  if (needsOptions) {
    const options = content.options;
    if (!Array.isArray(options) || options.length < 2) {
      return { error: "At least two options are required" };
    }
    if (options.length > 12) return { error: "Too many options" };
    for (const o of options) {
      if (typeof o.text !== "string" || !o.text.trim()) return { error: "Option text is required" };
      if (typeof o.isCorrect !== "boolean") return { error: "Option isCorrect must be boolean" };
    }
    const correct = options.filter((o) => o.isCorrect).length;
    if (type === "mcq_single" || type === "true_false") {
      if (correct !== 1) return { error: "Exactly one option must be correct" };
    } else if (correct < 1) {
      return { error: "At least one option must be correct" };
    }
    if (type === "true_false" && options.length !== 2) {
      return { error: "True/false questions need exactly two options" };
    }
  }

  const tags = Array.isArray(b.tags)
    ? (b.tags as unknown[]).filter((t): t is string => typeof t === "string" && t.trim() !== "").slice(0, 20)
    : [];

  const marks = Number(b.marks ?? 1);
  if (!Number.isInteger(marks) || marks < 1 || marks > 100) {
    return { error: "Marks must be an integer between 1 and 100" };
  }

  // Rebuild content explicitly — never pass client JSON through untouched.
  const clean: QuestionContent = {
    text: content.text.trim(),
    ...(needsOptions && {
      options: content.options!.map((o, i) => ({
        id: typeof o.id === "string" && o.id ? o.id : `opt-${i + 1}`,
        text: o.text.trim(),
        isCorrect: o.isCorrect,
      })),
    }),
    ...(type === "essay" && typeof content.sampleAnswer === "string" && {
      sampleAnswer: content.sampleAnswer.slice(0, 10_000),
    }),
    ...(type === "coding" && typeof content.challengeId === "string" && {
      challengeId: content.challengeId,
    }),
  };

  return { value: { type, difficulty, content: clean, tags, marks } };
}
