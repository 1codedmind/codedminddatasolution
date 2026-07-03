"use client";

import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { CheckCircle2, LoaderCircle, Play, RotateCcw, XCircle } from "lucide-react";
import type { AssessmentChallenge, PythonTestCase } from "@/data/assessmentTypes";

/**
 * LeetCode-style coding pane: problem description on the left, Monaco editor
 * on the right with a testcase/result console below it. Python runs fully
 * in-browser via Pyodide — same harness the public assessments page uses.
 */

type PythonChallenge = Extract<AssessmentChallenge, { category: "python" }>;

type CaseResult = {
  id: string;
  label: string;
  passed: boolean;
  output?: unknown;
  expected?: unknown;
  error?: string;
  hidden: boolean;
};

export type CodingSubmission = {
  code: string;
  passed: number;
  total: number;
};

declare global {
  interface Window {
    loadPyodide?: (options?: { indexURL?: string }) => Promise<unknown>;
    pyodide?: { runPythonAsync: (code: string) => Promise<string> };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function display(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

async function runPython(challenge: PythonChallenge, code: string, cases: PythonTestCase[]) {
  const harness = `
import json

${code}

test_cases = json.loads(${JSON.stringify(JSON.stringify(cases))})
results = []

fn = globals().get(${JSON.stringify(challenge.functionName)})
if fn is None:
    raise Exception("Expected function ${challenge.functionName} was not found.")

for case in test_cases:
    try:
        output = fn(*case["args"])
        results.append({"label": case["label"], "passed": output == case["expected"], "output": output, "expected": case["expected"]})
    except Exception as exc:
        results.append({"label": case["label"], "passed": False, "error": str(exc), "expected": case["expected"]})

json.dumps(results)
`;
  const raw = await window.pyodide!.runPythonAsync(harness);
  const parsed = JSON.parse(raw) as Omit<CaseResult, "id" | "hidden">[];
  return parsed.map((r, i) => ({
    id: cases[i].id,
    ...r,
    hidden: cases[i].visibility === "hidden",
  }));
}

export default function CodingPane({
  challenge,
  savedCode,
  onSubmit,
}: {
  challenge: PythonChallenge;
  savedCode?: string;
  onSubmit: (submission: CodingSubmission) => void;
}) {
  const [code, setCode] = useState(savedCode ?? challenge.starterCode);
  const [engine, setEngine] = useState<"loading" | "ready" | "error">("loading");
  const [running, setRunning] = useState<"run" | "submit" | null>(null);
  const [tab, setTab] = useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [results, setResults] = useState<CaseResult[] | null>(null);
  const [verdict, setVerdict] = useState<"accepted" | "wrong" | "error" | null>(null);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  const publicCases = useMemo(
    () => challenge.testCases.filter((c) => c.visibility === "public"),
    [challenge],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
        if (!window.pyodide) {
          window.pyodide = (await window.loadPyodide?.({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
          })) as typeof window.pyodide;
        }
        if (!cancelled) setEngine("ready");
      } catch {
        if (!cancelled) setEngine("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function execute(mode: "run" | "submit") {
    if (engine !== "ready" || running) return;
    setRunning(mode);
    setRunnerError(null);
    setTab("result");
    try {
      // Run = public cases only (fast feedback). Submit = full hidden suite.
      const cases = mode === "run" ? publicCases : challenge.testCases;
      const res = await runPython(challenge, code, cases);
      setResults(res);
      const passed = res.filter((r) => r.passed).length;
      if (mode === "submit") {
        setVerdict(passed === res.length ? "accepted" : "wrong");
        onSubmit({ code, passed, total: res.length });
      } else {
        setVerdict(null);
      }
    } catch (e) {
      setResults(null);
      setVerdict("error");
      setRunnerError(e instanceof Error ? e.message : String(e));
      if (mode === "submit") onSubmit({ code, passed: 0, total: challenge.testCases.length });
    } finally {
      setRunning(null);
    }
  }

  const shownResults = results?.filter((r) => !r.hidden) ?? [];
  const hiddenSummary = results?.filter((r) => r.hidden) ?? [];

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
      {/* Problem description — left panel */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-y-auto">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">{challenge.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                challenge.difficulty === "Easy"
                  ? "bg-emerald-50 text-emerald-700"
                  : challenge.difficulty === "Medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="text-xs text-stone-400">Python 3</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-4 text-sm text-stone-700 leading-relaxed">
          <p>{challenge.summary}</p>
          <ul className="list-disc pl-5 space-y-1">
            {challenge.instructions.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          {publicCases.map((c, i) => (
            <div key={c.id}>
              <p className="font-medium text-stone-900 mb-1.5">Example {i + 1}:</p>
              <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 font-mono text-xs space-y-1">
                <p>
                  <span className="text-stone-500">Input:</span>{" "}
                  {c.args.map(display).join(", ")}
                </p>
                <p>
                  <span className="text-stone-500">Output:</span> {display(c.expected)}
                </p>
              </div>
            </div>
          ))}
          <p className="text-xs text-stone-400">
            Hidden test cases also run on submit — passing the examples alone may not be enough.
          </p>
        </div>
      </div>

      {/* Editor + console — right panel */}
      <div className="flex flex-col min-h-0 gap-2">
        <div className="flex-1 min-h-0 bg-[#1e1e1e] border border-stone-200 rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-stone-700/50">
            <span className="text-xs text-stone-400 font-medium">Python3</span>
            <button
              onClick={() => setCode(challenge.starterCode)}
              className="text-stone-500 hover:text-stone-300 transition-colors"
              title="Reset to starter code"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              language="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Console */}
        <div className="h-[220px] shrink-0 bg-white border border-stone-200 rounded-lg flex flex-col">
          <div className="flex items-center justify-between px-4 border-b border-stone-100">
            <div className="flex gap-4">
              {(["testcase", "result"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                    tab === t
                      ? "border-stone-900 text-stone-900"
                      : "border-transparent text-stone-400 hover:text-stone-600"
                  }`}
                >
                  {t === "testcase" ? "Testcase" : "Test Result"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 py-1.5">
              {engine === "loading" && (
                <span className="flex items-center gap-1.5 text-xs text-stone-400">
                  <LoaderCircle size={12} className="animate-spin" /> Loading engine…
                </span>
              )}
              {engine === "error" && (
                <span className="text-xs text-red-500">Engine failed to load</span>
              )}
              <button
                onClick={() => execute("run")}
                disabled={engine !== "ready" || running !== null}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors"
              >
                {running === "run" ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                Run
              </button>
              <button
                onClick={() => execute("submit")}
                disabled={engine !== "ready" || running !== null}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {running === "submit" && <LoaderCircle size={12} className="animate-spin" />}
                Submit Code
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {tab === "testcase" && (
              <div>
                <div className="flex gap-2 mb-3">
                  {publicCases.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCase(i)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        activeCase === i
                          ? "bg-stone-900 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>
                {publicCases[activeCase] && (
                  <div className="font-mono text-xs space-y-2">
                    <div>
                      <p className="text-stone-400 mb-1">Input =</p>
                      <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                        {publicCases[activeCase].args.map(display).join(", ")}
                      </div>
                    </div>
                    <div>
                      <p className="text-stone-400 mb-1">Expected =</p>
                      <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                        {display(publicCases[activeCase].expected)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "result" && (
              <div className="space-y-3">
                {running && (
                  <p className="flex items-center gap-2 text-xs text-stone-400">
                    <LoaderCircle size={12} className="animate-spin" /> Running…
                  </p>
                )}
                {!running && verdict === "accepted" && (
                  <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Accepted — all {results?.length} test cases passed
                  </p>
                )}
                {!running && verdict === "wrong" && (
                  <p className="text-red-600 text-sm font-semibold flex items-center gap-1.5">
                    <XCircle size={16} /> Wrong Answer —{" "}
                    {results?.filter((r) => r.passed).length}/{results?.length} passed
                  </p>
                )}
                {!running && runnerError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-mono text-xs text-red-700 whitespace-pre-wrap">
                    {runnerError}
                  </div>
                )}
                {!running && !results && !runnerError && (
                  <p className="text-xs text-stone-400">
                    Run your code to see results here.
                  </p>
                )}
                {!running &&
                  shownResults.map((r, i) => (
                    <div
                      key={r.id}
                      className={`border rounded-lg px-3 py-2 text-xs font-mono ${
                        r.passed ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p
                        className={`font-sans font-semibold mb-1 flex items-center gap-1.5 ${
                          r.passed ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {r.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        Case {i + 1} — {r.label}
                      </p>
                      {r.error ? (
                        <p className="text-red-700">{r.error}</p>
                      ) : (
                        <>
                          <p>
                            <span className="text-stone-500">Output:</span> {display(r.output)}
                          </p>
                          {!r.passed && (
                            <p>
                              <span className="text-stone-500">Expected:</span>{" "}
                              {display(r.expected)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                {!running && hiddenSummary.length > 0 && (
                  <p className="text-xs text-stone-400">
                    Hidden cases: {hiddenSummary.filter((r) => r.passed).length}/
                    {hiddenSummary.length} passed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
