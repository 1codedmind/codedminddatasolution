import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { hasDatabaseUrl } from "@/lib/db";
import { hasExamPermission } from "@/lib/exam/access";
import { resolveTenantId } from "@/lib/exam/tenant";
import { listQuestions } from "@/lib/exam/db/questions";
import QuestionsClient from "./QuestionsClient";

export const metadata = { title: "Question Bank — Admin", robots: "noindex, nofollow" };

export default async function QuestionsPage() {
  const session = await getCurrentSession();

  if (!session || !hasExamPermission(session.role, "questions:read")) {
    redirect("/login");
  }

  if (!hasDatabaseUrl()) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm font-medium mb-1">Database not configured</p>
          <p className="text-stone-600 text-xs">Set DATABASE_URL in your environment variables.</p>
        </div>
      </div>
    );
  }

  const { questions, total } = await listQuestions(resolveTenantId(session), { limit: 100 });

  return (
    <QuestionsClient
      initialQuestions={questions}
      total={total}
      canDelete={hasExamPermission(session.role, "questions:delete")}
    />
  );
}
