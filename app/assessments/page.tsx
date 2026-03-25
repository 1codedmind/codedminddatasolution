import AssessmentWorkspace from "@/components/AssessmentWorkspace";
import { loadAssessmentChallenges } from "@/data/loadAssessmentChallenges";

export const dynamic = "force-dynamic";

export default function AssessmentsPage() {
  const challenges = loadAssessmentChallenges();

  return (
    <main className="bg-[#fcfaf6]">
      <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#fcfaf6_0%,#f4ecde_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-amber-800">
              Candidate Assessment Platform
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-stone-950 md:text-6xl">
              Run Python and SQL Tests Directly on Your Website
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              This assessment area gives candidates a browser-based coding
              workspace, built-in test cases, and instant feedback. It is set
              up to grow into a larger question bank over time.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AssessmentWorkspace challenges={challenges} />
        </div>
      </section>
    </main>
  );
}
