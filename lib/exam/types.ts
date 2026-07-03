/**
 * Exam portal module types.
 * Self-contained: nothing outside lib/exam/ and app/(exam routes) imports these,
 * and this module never imports from lib/hrms/ or other feature modules.
 *
 * ┌─ Access matrix ─────────────────────────────────────────────────────────┐
 * │  superadmin — full CRUD on all tenants                                  │
 * │  admin      — full CRUD within own tenant                               │
 * │  employee   — question authoring + grading within own tenant            │
 * │  candidate  — take assigned exams, view own results                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────────────────────
// TENANCY
// ─────────────────────────────────────────────────────────────────────────────

/** A university or corporate customer. Coded Mind itself is tenant zero. */
export type ExamTenant = {
  id: string;
  name: string;
  slug: string;
  settings: TenantSettings;
  createdAt: string;
};

export type TenantSettings = {
  accentColor?: string;   // white-label accent, defaults to site amber
  logoUrl?: string;
};

/** Tenant zero — Coded Mind's own question bank and exams. */
export const DEFAULT_TENANT_ID = "codedmind";

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION BANK
// ─────────────────────────────────────────────────────────────────────────────

export type QuestionType =
  | "mcq_single"
  | "mcq_multi"
  | "true_false"
  | "essay"
  | "coding";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type QuestionStatus = "draft" | "published" | "archived";

/** One selectable option for MCQ / true-false questions. */
export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

/**
 * Question body, stored as JSONB. Correct answers live only here —
 * strip via toCandidateQuestion() before serving to exam takers.
 */
export type QuestionContent = {
  text: string;                 // the question prompt (markdown allowed)
  options?: QuestionOption[];   // mcq_single | mcq_multi | true_false
  sampleAnswer?: string;        // essay grading aid
  challengeId?: string;         // coding → links to assessment challenge
};

export type Question = {
  id: string;
  tenantId: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  content: QuestionContent;
  tags: string[];
  marks: number;
  createdBy: string;            // user id
  createdAt: string;
  updatedAt: string;
};

/** A question as served to a candidate — correct answers removed. */
export type CandidateQuestion = Omit<Question, "content" | "createdBy"> & {
  content: {
    text: string;
    options?: { id: string; text: string }[];
    challengeId?: string;
  };
};

export function toCandidateQuestion(q: Question): CandidateQuestion {
  const { createdBy: _createdBy, ...rest } = q;
  return {
    ...rest,
    content: {
      text: q.content.text,
      options: q.content.options?.map(({ id, text }) => ({ id, text })),
      challengeId: q.content.challengeId,
    },
  };
}
