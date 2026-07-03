import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasDatabaseUrl } from "@/lib/db";
import { listQuestions } from "@/lib/exam/db/questions";
import { resolveTenantId } from "@/lib/exam/tenant";
import { toCandidateQuestion } from "@/lib/exam/types";
import { loadAssessmentChallenges } from "@/data/loadAssessmentChallenges";
import ExamCanvas from "./ExamCanvas";

export const metadata = { title: "Exam Preview — Coded Mind", robots: "noindex, nofollow" };

// Candidate-perspective preview of the exam canvas, rendering every published
// question in the bank. The real exam runner (Phase 2) adds sessions, a
// server-authoritative timer, and answer persistence on top of this canvas.
export default async function ExamPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  if (!hasDatabaseUrl()) {
    return (
      <main className="min-h-screen bg-[#fcfaf6] flex items-center justify-center">
        <p className="text-stone-500 text-sm">Database not configured.</p>
      </main>
    );
  }

  const { questions } = await listQuestions(resolveTenantId(session), {
    status: "published",
    limit: 100,
  });

  // Candidates never receive correct answers — strip them server-side.
  const candidateQuestions = questions.map(toCandidateQuestion);

  // Attach coding challenges referenced by coding questions.
  const challengeIds = new Set(
    candidateQuestions
      .map((q) => q.content.challengeId)
      .filter((id): id is string => Boolean(id)),
  );
  const challenges = loadAssessmentChallenges().filter((c) =>
    challengeIds.has(c.slug),
  );

  // Deep-link support: /exams/preview?q=3 opens question 3.
  const { q } = await searchParams;
  const requested = Number(q);
  const initialIndex =
    Number.isInteger(requested) && requested >= 1 && requested <= candidateQuestions.length
      ? requested - 1
      : 0;

  return (
    <ExamCanvas
      examTitle="Python Fundamentals — Preview"
      durationMins={30}
      questions={candidateQuestions}
      challenges={challenges}
      initialIndex={initialIndex}
      candidateName={session.email}
    />
  );
}
