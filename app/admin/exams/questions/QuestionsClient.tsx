"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  FileQuestion,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type {
  Question,
  QuestionDifficulty,
  QuestionOption,
  QuestionType,
} from "@/lib/exam/types";

const TYPE_LABELS: Record<QuestionType, string> = {
  mcq_single: "MCQ (single)",
  mcq_multi: "MCQ (multi)",
  true_false: "True / False",
  essay: "Essay",
  coding: "Coding",
};

const DIFFICULTY_COLORS: Record<QuestionDifficulty, string> = {
  easy: "text-emerald-400 bg-emerald-950/60 border-emerald-900",
  medium: "text-amber-400 bg-amber-950/60 border-amber-900",
  hard: "text-red-400 bg-red-950/60 border-red-900",
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl px-6 py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#C87660]" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-white">{value}</p>
        <p className="text-xs text-stone-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

type EditorState = {
  id?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  text: string;
  options: QuestionOption[];
  tags: string;
  marks: number;
};

const EMPTY_EDITOR: EditorState = {
  type: "mcq_single",
  difficulty: "medium",
  text: "",
  options: [
    { id: "opt-1", text: "", isCorrect: true },
    { id: "opt-2", text: "", isCorrect: false },
  ],
  tags: "",
  marks: 1,
};

const TRUE_FALSE_OPTIONS: QuestionOption[] = [
  { id: "opt-1", text: "True", isCorrect: true },
  { id: "opt-2", text: "False", isCorrect: false },
];

export default function QuestionsClient({
  initialQuestions,
  total,
  canDelete,
}: {
  initialQuestions: Question[];
  total: number;
  canDelete: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "">("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return questions.filter(
      (item) =>
        (!q ||
          item.content.text.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))) &&
        (!typeFilter || item.type === typeFilter),
    );
  }, [questions, search, typeFilter]);

  const published = questions.filter((q) => q.status === "published").length;

  function openCreate() {
    setError("");
    setEditor({ ...EMPTY_EDITOR, options: EMPTY_EDITOR.options.map((o) => ({ ...o })) });
  }

  function openEdit(q: Question) {
    setError("");
    setEditor({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      text: q.content.text,
      options: q.content.options?.map((o) => ({ ...o })) ?? [],
      tags: q.tags.join(", "),
      marks: q.marks,
    });
  }

  function setType(type: QuestionType) {
    setEditor((e) => {
      if (!e) return e;
      if (type === "true_false") {
        return { ...e, type, options: TRUE_FALSE_OPTIONS.map((o) => ({ ...o })) };
      }
      const needsOptions = type === "mcq_single" || type === "mcq_multi";
      const options =
        needsOptions && e.options.length < 2
          ? EMPTY_EDITOR.options.map((o) => ({ ...o }))
          : e.options;
      return { ...e, type, options };
    });
  }

  function toggleCorrect(index: number) {
    setEditor((e) => {
      if (!e) return e;
      const single = e.type === "mcq_single" || e.type === "true_false";
      return {
        ...e,
        options: e.options.map((o, i) => ({
          ...o,
          isCorrect: single ? i === index : i === index ? !o.isCorrect : o.isCorrect,
        })),
      };
    });
  }

  async function save() {
    if (!editor) return;
    setSaving(true);
    setError("");

    const needsOptions = ["mcq_single", "mcq_multi", "true_false"].includes(editor.type);
    const payload = {
      type: editor.type,
      difficulty: editor.difficulty,
      marks: editor.marks,
      tags: editor.tags.split(",").map((t) => t.trim()).filter(Boolean),
      content: {
        text: editor.text,
        ...(needsOptions && { options: editor.options }),
      },
    };

    const res = await fetch(
      editor.id ? `/api/exams/questions/${editor.id}` : "/api/exams/questions",
      {
        method: editor.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setQuestions((prev) =>
      editor.id
        ? prev.map((q) => (q.id === editor.id ? data.question : q))
        : [data.question, ...prev],
    );
    setEditor(null);
  }

  async function togglePublish(q: Question) {
    const status = q.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/exams/questions/${q.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions((prev) => prev.map((item) => (item.id === q.id ? data.question : item)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this question permanently?")) return;
    const res = await fetch(`/api/exams/questions/${id}`, { method: "DELETE" });
    if (res.ok) setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Question Bank</h1>
            <p className="text-stone-500 text-sm mt-0.5">Exam portal — reusable questions</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C87660] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Question
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total questions" value={total} icon={FileQuestion} />
          <StatCard label="Published" value={published} icon={CheckCircle2} />
          <StatCard label="Showing" value={filtered.length} icon={Layers} />
        </div>

        {/* Search + filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search question text or tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-stone-600"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as QuestionType | "")}
            className="px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-300 focus:outline-none focus:border-stone-600"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-10 text-center">
              <p className="text-stone-500 text-sm">No questions yet. Create your first one.</p>
            </div>
          )}
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-stone-900 border border-stone-800 rounded-2xl px-5 py-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white line-clamp-2">{q.content.text}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-stone-700 text-stone-400">
                    {TYPE_LABELS[q.type]}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-stone-700 text-stone-400">
                    {q.marks} {q.marks === 1 ? "mark" : "marks"}
                  </span>
                  {q.tags.map((t) => (
                    <span key={t} className="text-[11px] text-stone-500">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => togglePublish(q)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    q.status === "published"
                      ? "border-emerald-900 text-emerald-400 bg-emerald-950/60"
                      : "border-stone-700 text-stone-400 hover:text-white"
                  }`}
                >
                  {q.status === "published" ? "Published" : "Draft"}
                </button>
                <button
                  onClick={() => openEdit(q)}
                  className="p-2 text-stone-500 hover:text-white transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                {canDelete && (
                  <button
                    onClick={() => remove(q.id)}
                    className="p-2 text-stone-500 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor modal */}
      {editor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 sticky top-0 bg-stone-900">
              <h2 className="text-white font-bold">{editor.id ? "Edit Question" : "New Question"}</h2>
              <button onClick={() => setEditor(null)} className="text-stone-500 hover:text-white" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-stone-500 block mb-1.5">Type</label>
                  <select
                    value={editor.type}
                    onChange={(e) => setType(e.target.value as QuestionType)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-stone-600"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-500 block mb-1.5">Difficulty</label>
                  <select
                    value={editor.difficulty}
                    onChange={(e) => setEditor({ ...editor, difficulty: e.target.value as QuestionDifficulty })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-stone-600"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-stone-500 block mb-1.5">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editor.marks}
                    onChange={(e) => setEditor({ ...editor, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-none focus:border-stone-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Question text</label>
                <textarea
                  rows={3}
                  value={editor.text}
                  onChange={(e) => setEditor({ ...editor, text: e.target.value })}
                  placeholder="What does this question ask?"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-stone-600 resize-y"
                />
              </div>

              {["mcq_single", "mcq_multi", "true_false"].includes(editor.type) && (
                <div>
                  <label className="text-xs text-stone-500 block mb-1.5">
                    Options — click the circle to mark correct
                  </label>
                  <div className="space-y-2">
                    {editor.options.map((o, i) => (
                      <div key={o.id} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCorrect(i)}
                          className={`w-6 h-6 rounded-full border-2 shrink-0 transition-colors ${
                            o.isCorrect ? "bg-emerald-500 border-emerald-500" : "border-stone-600"
                          }`}
                          aria-label={o.isCorrect ? "Correct option" : "Mark as correct"}
                        />
                        <input
                          type="text"
                          value={o.text}
                          disabled={editor.type === "true_false"}
                          onChange={(e) =>
                            setEditor({
                              ...editor,
                              options: editor.options.map((opt, j) =>
                                j === i ? { ...opt, text: e.target.value } : opt,
                              ),
                            })
                          }
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-stone-600 disabled:opacity-60"
                        />
                        {editor.type !== "true_false" && editor.options.length > 2 && (
                          <button
                            onClick={() =>
                              setEditor({ ...editor, options: editor.options.filter((_, j) => j !== i) })
                            }
                            className="text-stone-600 hover:text-red-400 p-1"
                            aria-label="Remove option"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editor.type !== "true_false" && editor.options.length < 12 && (
                    <button
                      onClick={() =>
                        setEditor({
                          ...editor,
                          options: [
                            ...editor.options,
                            { id: `opt-${editor.options.length + 1}`, text: "", isCorrect: false },
                          ],
                        })
                      }
                      className="mt-2 text-xs text-stone-400 hover:text-white transition-colors"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs text-stone-500 block mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editor.tags}
                  onChange={(e) => setEditor({ ...editor, tags: e.target.value })}
                  placeholder="python, arrays, level-1"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:border-stone-600"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditor(null)}
                  className="px-4 py-2.5 text-sm text-stone-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#C87660] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving…" : editor.id ? "Save Changes" : "Create Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
