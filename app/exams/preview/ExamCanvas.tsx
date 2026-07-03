"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bookmark, Clock, Eraser, User } from "lucide-react";
import type { AssessmentChallenge } from "@/data/assessmentTypes";
import type { CandidateQuestion } from "@/lib/exam/types";
import CodingPane, { type CodingSubmission } from "./CodingPane";

/**
 * Candidate exam canvas following the NTA / TCS iON pattern used by JEE, NEET,
 * GATE and most Indian corporate assessments — candidates already know it:
 *   green = answered · red = not answered · purple = marked for review ·
 *   white = not visited, with Save & Next / Clear Response / Mark for Review.
 * Coding questions swap the panel for a LeetCode-style split pane.
 */

type AnswerValue = string[] | string | CodingSubmission;

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

const TYPE_LABELS: Record<string, string> = {
  mcq_single: "Multiple Choice — single answer",
  mcq_multi: "Multiple Choice — select all that apply",
  true_false: "True or False",
  essay: "Descriptive Answer",
  coding: "Coding Problem",
};

export default function ExamCanvas({
  examTitle,
  durationMins,
  questions,
  challenges,
  initialIndex = 0,
  candidateName = "Candidate",
}: {
  examTitle: string;
  durationMins: number;
  questions: CandidateQuestion[];
  challenges: AssessmentChallenge[];
  initialIndex?: number;
  candidateName?: string;
}) {
  const [current, setCurrent] = useState(initialIndex);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(durationMins * 60);
  const [submitted, setSubmitted] = useState(false);

  const q = questions[current];

  // Display-only countdown. The real runner syncs from the server, which is
  // the sole timer authority and rejects late submissions regardless.
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  useEffect(() => {
    setVisited((prev) => (prev.has(q.id) ? prev : new Set(prev).add(q.id)));
  }, [q.id]);

  const challengeMap = useMemo(
    () => new Map(challenges.map((c) => [c.slug, c])),
    [challenges],
  );

  const counts = useMemo(() => {
    let answered = 0,
      markedCount = 0,
      notAnswered = 0;
    for (const question of questions) {
      if (marked.has(question.id)) markedCount++;
      else if (answers[question.id]) answered++;
      else if (visited.has(question.id)) notAnswered++;
    }
    return {
      answered,
      marked: markedCount,
      notAnswered,
      notVisited: questions.length - answered - markedCount - notAnswered,
    };
  }, [questions, answers, marked, visited]);

  function paletteClass(question: CandidateQuestion, index: number) {
    const ring = index === current ? "ring-2 ring-blue-500 ring-offset-1" : "";
    if (marked.has(question.id)) return `${ring} bg-purple-600 text-white`;
    if (answers[question.id]) return `${ring} bg-emerald-600 text-white`;
    if (visited.has(question.id)) return `${ring} bg-red-500 text-white`;
    return `${ring} bg-white border border-stone-300 text-stone-700`;
  }

  function selectOption(optionId: string) {
    const single = q.type === "mcq_single" || q.type === "true_false";
    setAnswers((prev) => {
      const existing = (prev[q.id] as string[] | undefined) ?? [];
      if (single) return { ...prev, [q.id]: [optionId] };
      const next = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];
      if (next.length === 0) {
        const { [q.id]: _r, ...rest } = prev;
        return rest;
      }
      return { ...prev, [q.id]: next };
    });
  }

  function clearResponse() {
    setAnswers((prev) => {
      const { [q.id]: _r, ...rest } = prev;
      return rest;
    });
    setMarked((prev) => {
      if (!prev.has(q.id)) return prev;
      const next = new Set(prev);
      next.delete(q.id);
      return next;
    });
  }

  function goNext() {
    setCurrent((c) => Math.min(questions.length - 1, c + 1));
  }

  function saveAndNext() {
    setMarked((prev) => {
      if (!prev.has(q.id)) return prev;
      const next = new Set(prev);
      next.delete(q.id);
      return next;
    });
    goNext();
  }

  function markForReviewAndNext() {
    setMarked((prev) => new Set(prev).add(q.id));
    goNext();
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-stone-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Exam Submitted</h1>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-emerald-50 rounded-lg py-3">
              <p className="text-2xl font-bold text-emerald-700">{counts.answered + counts.marked}</p>
              <p className="text-xs text-stone-500 mt-1">Attempted</p>
            </div>
            <div className="bg-stone-50 rounded-lg py-3">
              <p className="text-2xl font-bold text-stone-700">
                {questions.length - counts.answered - counts.marked}
              </p>
              <p className="text-xs text-stone-500 mt-1">Unattempted</p>
            </div>
          </div>
          <p className="text-stone-400 text-xs mt-5">
            In the full exam runner, grading happens server-side and results are
            released by the examiner.
          </p>
        </div>
      </div>
    );
  }

  const selected = (answers[q.id] as string[] | undefined) ?? [];
  const challenge = q.content.challengeId ? challengeMap.get(q.content.challengeId) : undefined;
  const isCoding = q.type === "coding" && challenge?.category === "python";

  return (
    <div className="fixed inset-0 z-[100] bg-stone-100 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 shrink-0">
        <div className="px-4 py-2.5 flex items-center justify-between gap-4">
          <h1 className="text-sm font-semibold text-stone-900 truncate">{examTitle}</h1>
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums ${
                secondsLeft < 300 ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-800"
              }`}
            >
              <Clock size={14} />
              {formatTime(secondsLeft)}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
              <span className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center">
                <User size={13} />
              </span>
              {candidateName}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Main area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Question header strip */}
          <div className="bg-white border-b border-stone-200 px-5 py-2.5 flex items-center justify-between shrink-0">
            <p className="text-sm font-semibold text-stone-900">
              Question {current + 1}
              <span className="font-normal text-stone-400 text-xs ml-2">
                {TYPE_LABELS[q.type]}
              </span>
            </p>
            <p className="text-xs text-stone-500">
              Marks: <span className="font-semibold text-emerald-700">+{q.marks}</span>
            </p>
          </div>

          {isCoding && challenge ? (
            <CodingPane
              key={q.id}
              challenge={challenge}
              savedCode={(answers[q.id] as CodingSubmission | undefined)?.code}
              onSubmit={(submission) =>
                setAnswers((prev) => ({ ...prev, [q.id]: submission }))
              }
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-5">
              <div className="max-w-3xl">
                <p className="text-[15px] text-stone-900 leading-relaxed whitespace-pre-wrap">
                  {q.content.text}
                </p>

                {q.content.options && (
                  <div className="mt-6 space-y-2">
                    {q.content.options.map((o, i) => {
                      const isSelected = selected.includes(o.id);
                      return (
                        <label
                          key={o.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer text-sm transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-stone-200 bg-white hover:bg-stone-50"
                          }`}
                        >
                          <input
                            type={q.type === "mcq_multi" ? "checkbox" : "radio"}
                            name={q.id}
                            checked={isSelected}
                            onChange={() => selectOption(o.id)}
                            className="accent-blue-600 w-4 h-4"
                          />
                          <span className="text-stone-400 text-xs font-medium w-5">
                            {String.fromCharCode(65 + i)}.
                          </span>
                          <span className="text-stone-800">{o.text}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "essay" && (
                  <textarea
                    rows={10}
                    value={(answers[q.id] as string | undefined) ?? ""}
                    onChange={(e) => {
                      const text = e.target.value;
                      setAnswers((prev) => {
                        if (!text) {
                          const { [q.id]: _r, ...rest } = prev;
                          return rest;
                        }
                        return { ...prev, [q.id]: text };
                      });
                    }}
                    placeholder="Type your answer here…"
                    className="mt-6 w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                  />
                )}
              </div>
            </div>
          )}

          {/* Bottom action bar */}
          <div className="bg-white border-t border-stone-200 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={markForReviewAndNext}
                className="flex items-center gap-1.5 px-4 py-2 border border-purple-300 text-purple-700 text-xs font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Bookmark size={13} />
                Mark for Review & Next
              </button>
              <button
                onClick={clearResponse}
                className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 transition-colors"
              >
                <Eraser size={13} />
                Clear Response
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="px-4 py-2 border border-stone-300 text-stone-600 text-xs font-semibold rounded-lg hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={saveAndNext}
                disabled={current === questions.length - 1}
                className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Palette sidebar */}
        <aside className="w-[260px] shrink-0 bg-white border-l border-stone-200 flex flex-col">
          <div className="px-4 py-3 border-b border-stone-100 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-stone-600">
            <p className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 shrink-0" />
              Answered ({counts.answered})
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-500 shrink-0" />
              Not Answered ({counts.notAnswered})
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-600 shrink-0" />
              Marked ({counts.marked})
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-white border border-stone-300 shrink-0" />
              Not Visited ({counts.notVisited})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, i) => (
                <button
                  key={question.id}
                  onClick={() => setCurrent(i)}
                  className={`h-9 rounded text-xs font-bold transition-all ${paletteClass(question, i)}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-stone-100">
            <button
              onClick={() => setSubmitted(true)}
              className="w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
