"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Code2,
  Database,
  Eye,
  LoaderCircle,
  Lock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  type AssessmentChallenge,
  type PythonTestCase,
  type SqlTestCase,
} from "@/data/assessmentTypes";

type AssessmentWorkspaceProps = {
  challenges: AssessmentChallenge[];
};

type TestResult = {
  id: string;
  label: string;
  passed: boolean;
  output?: unknown;
  expected?: unknown;
  error?: string;
  visibility: "public" | "hidden";
};

type ScriptStatus = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<unknown>;
    pyodide?: {
      runPythonAsync: (code: string) => Promise<string>;
    };
    alasql?: (query: string) => unknown;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function serializeResult(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function AssessmentWorkspace({
  challenges,
}: AssessmentWorkspaceProps) {
  const [activeSlug, setActiveSlug] = useState(challenges[0]?.slug ?? "");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      challenges.map((challenge) => [challenge.slug, challenge.starterCode])
    )
  );
  const [results, setResults] = useState<Record<string, TestResult[]>>({});
  const [runnerMessage, setRunnerMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pythonStatus, setPythonStatus] = useState<ScriptStatus>("idle");
  const [sqlStatus, setSqlStatus] = useState<ScriptStatus>("idle");
  const [unlockedTests, setUnlockedTests] = useState<Record<string, string[]>>(
    {}
  );

  const activeChallenge = useMemo(
    () =>
      challenges.find((challenge) => challenge.slug === activeSlug) ??
      challenges[0],
    [activeSlug, challenges]
  );

  useEffect(() => {
    async function preparePython() {
      setPythonStatus("loading");
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"
        );
        if (!window.pyodide) {
          window.pyodide = (await window.loadPyodide?.({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
          })) as typeof window.pyodide;
        }
        setPythonStatus("ready");
      } catch {
        setPythonStatus("error");
      }
    }

    async function prepareSql() {
      setSqlStatus("loading");
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/alasql@4.6.5/dist/alasql.min.js"
        );
        setSqlStatus(window.alasql ? "ready" : "error");
      } catch {
        setSqlStatus("error");
      }
    }

    void preparePython();
    void prepareSql();
  }, []);

  function updateDraft(value: string) {
    if (!activeChallenge) {
      return;
    }

    setDrafts((current) => ({
      ...current,
      [activeChallenge.slug]: value,
    }));
  }

  function resetDraft() {
    if (!activeChallenge) {
      return;
    }

    setDrafts((current) => ({
      ...current,
      [activeChallenge.slug]: activeChallenge.starterCode,
    }));
    setResults((current) => ({
      ...current,
      [activeChallenge.slug]: [],
    }));
    setRunnerMessage(null);
  }

  function unlockTestCase(testCaseId: string) {
    if (!activeChallenge) {
      return;
    }

    setUnlockedTests((current) => {
      const existing = current[activeChallenge.slug] ?? [];

      if (existing.includes(testCaseId)) {
        return current;
      }

      return {
        ...current,
        [activeChallenge.slug]: [...existing, testCaseId],
      };
    });
  }

  function isTestUnlocked(testCaseId: string) {
    if (!activeChallenge) {
      return false;
    }

    return (unlockedTests[activeChallenge.slug] ?? []).includes(testCaseId);
  }

  async function runPythonChallenge(
    challenge: Extract<AssessmentChallenge, { category: "python" }>,
    candidateCode: string
  ) {
    if (!window.pyodide || pythonStatus !== "ready") {
      throw new Error(
        "Python runner is still loading. Please try again in a moment."
      );
    }

    const executionCode = `
import json

${candidateCode}

test_cases = json.loads(${JSON.stringify(JSON.stringify(challenge.testCases))})
results = []

fn = globals().get(${JSON.stringify(challenge.functionName)})
if fn is None:
    raise Exception("Expected function ${challenge.functionName} was not found.")

for case in test_cases:
    try:
        output = fn(*case["args"])
        results.append({
            "label": case["label"],
            "passed": output == case["expected"],
            "output": output,
            "expected": case["expected"],
        })
    except Exception as exc:
        results.append({
            "label": case["label"],
            "passed": False,
            "error": str(exc),
            "expected": case["expected"],
        })

json.dumps(results)
`;

    const raw = await window.pyodide.runPythonAsync(executionCode);
    const parsed = JSON.parse(raw) as Omit<TestResult, "visibility">[];

    return parsed.map((result, index) => ({
      id: challenge.testCases[index]?.id ?? `${challenge.slug}-${index}`,
      ...result,
      visibility: challenge.testCases[index]?.visibility ?? "public",
    }));
  }

  function runSqlChallenge(
    challenge: Extract<AssessmentChallenge, { category: "sql" }>,
    candidateCode: string
  ) {
    if (!window.alasql || sqlStatus !== "ready") {
      throw new Error(
        "SQL runner is still loading. Please try again in a moment."
      );
    }

    const dbName = `assessment_${Date.now()}`;
    window.alasql(`CREATE DATABASE ${dbName}`);
    window.alasql(`USE ${dbName}`);

    try {
      challenge.setupSql.forEach((statement) => {
        window.alasql?.(statement);
      });

      const output = window.alasql(candidateCode);

      return challenge.testCases.map((testCase: SqlTestCase) => ({
        id: testCase.id,
        label: testCase.label,
        passed: serializeResult(output) === serializeResult(testCase.expected),
        output,
        expected: testCase.expected,
        visibility: testCase.visibility,
      }));
    } finally {
      window.alasql(`DROP DATABASE ${dbName}`);
    }
  }

  async function handleRunTests() {
    if (!activeChallenge) {
      return;
    }

    setIsRunning(true);
    setRunnerMessage(null);

    try {
      const draft = drafts[activeChallenge.slug] ?? "";
      const nextResults =
        activeChallenge.category === "python"
          ? await runPythonChallenge(activeChallenge, draft)
          : runSqlChallenge(activeChallenge, draft);

      setResults((current) => ({
        ...current,
        [activeChallenge.slug]: nextResults,
      }));

      const passedCount = nextResults.filter((result) => result.passed).length;
      setRunnerMessage(
        `${passedCount}/${nextResults.length} test cases passed for ${activeChallenge.title}.`
      );
    } catch (error) {
      setRunnerMessage(
        error instanceof Error
          ? error.message
          : "Unable to run the tests right now."
      );
      setResults((current) => ({
        ...current,
        [activeChallenge.slug]: [],
      }));
    } finally {
      setIsRunning(false);
    }
  }

  if (!activeChallenge) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-stone-600 shadow-sm">
        No assessment challenges were found. Add rows to the CSV files in
        `data/csv` to populate this page.
      </div>
    );
  }

  const activeResults = results[activeChallenge.slug] ?? [];
  const engineStatus =
    activeChallenge.category === "python" ? pythonStatus : sqlStatus;
  const visibleTestCases = activeChallenge.testCases;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Challenge Library
          </p>
          <h2 className="mt-3 text-2xl font-bold text-stone-950">
            Candidate Assessment Tracks
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Questions are loaded from CSV files, so new rows will appear here
            automatically.
          </p>
          <div className="mt-5 space-y-3">
            {challenges.map((challenge) => {
              const isActive = challenge.slug === activeChallenge.slug;
              const isPython = challenge.category === "python";

              return (
                <button
                  key={challenge.slug}
                  type="button"
                  onClick={() => setActiveSlug(challenge.slug)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    isActive
                      ? "border-amber-300 bg-amber-50"
                      : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                        {isPython ? <Code2 size={16} /> : <Database size={16} />}
                        {challenge.title}
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        {challenge.summary}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
                      {challenge.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Instructions
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700">
            {activeChallenge.instructions.map((instruction, index) => (
              <li
                key={`${activeChallenge.slug}-instruction-${index}`}
                className="rounded-2xl bg-stone-50 px-4 py-3"
              >
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Test Case Visibility
          </p>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Public cases are visible immediately. Hidden cases stay masked until
            you unlock them individually. Later this can be restricted to
            admin-only access.
          </p>
          <div className="mt-5 space-y-3">
            {visibleTestCases.map((testCase, index) => {
              const unlocked =
                testCase.visibility === "public" ||
                isTestUnlocked(testCase.id);
              const isPython = activeChallenge.category === "python";
              const pythonCase = isPython ? (testCase as PythonTestCase) : null;
              const sqlCase = !isPython ? (testCase as SqlTestCase) : null;

              return (
                <div
                  key={`${activeChallenge.slug}-test-${testCase.id}-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                        {unlocked ? <Eye size={16} /> : <Lock size={16} />}
                        {testCase.label}
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {testCase.visibility === "public" ? "Public" : "Hidden"}
                      </p>
                    </div>
                    {testCase.visibility === "hidden" && !unlocked ? (
                      <button
                        type="button"
                        onClick={() => unlockTestCase(testCase.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-800 transition hover:bg-amber-50"
                      >
                        <Eye size={14} />
                        Unlock
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-stone-700">
                    {unlocked ? (
                      isPython ? (
                        <>
                          <p>Input: {serializeResult(pythonCase?.args)}</p>
                          <p>Expected: {serializeResult(pythonCase?.expected)}</p>
                        </>
                      ) : (
                        <p>Expected rows: {serializeResult(sqlCase?.expected)}</p>
                      )
                    ) : (
                      <>
                        <p>Input: Hidden until unlocked</p>
                        <p>Expected: Hidden until unlocked</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                Live Workspace
              </p>
              <h2 className="mt-2 text-2xl font-bold">{activeChallenge.title}</h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-200">
              Engine: {engineStatus}
            </span>
          </div>

          <textarea
            value={drafts[activeChallenge.slug] ?? ""}
            onChange={(event) => updateDraft(event.target.value)}
            spellCheck={false}
            className="mt-5 min-h-[22rem] w-full rounded-3xl border border-stone-700 bg-stone-900 px-5 py-4 font-mono text-sm leading-6 text-stone-100 outline-none transition focus:border-amber-400"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleRunTests()}
              disabled={isRunning}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {isRunning ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Run Test Cases
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-full border border-stone-600 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:border-stone-400 hover:bg-white/5"
            >
              <RotateCcw size={16} />
              Reset Starter Code
            </button>
          </div>

          {runnerMessage ? (
            <p className="mt-4 text-sm text-stone-300">{runnerMessage}</p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Test Results
          </p>
          <div className="mt-4 space-y-3">
            {activeResults.length > 0 ? (
              activeResults.map((result, index) => (
                <div
                  key={`${activeChallenge.slug}-result-${result.id}-${index}`}
                  className={`rounded-2xl border px-4 py-4 ${
                    result.passed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                    {result.passed ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    {result.label}
                  </div>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    {result.visibility === "public" ? "Public Case" : "Hidden Case"}
                  </p>
                  {result.error ? (
                    <p className="mt-2 text-sm text-rose-700">{result.error}</p>
                  ) : (
                    <div className="mt-2 space-y-2 text-sm text-stone-700">
                      <p>Output: {serializeResult(result.output)}</p>
                      <p>Expected: {serializeResult(result.expected)}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <CircleDashed size={16} />
                  No tests run yet. Execute the challenge to see pass/fail
                  results.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
