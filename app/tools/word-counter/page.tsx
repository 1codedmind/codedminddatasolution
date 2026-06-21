"use client";

import { useState, useMemo } from "react";

export default function WordCounterPage() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).filter(Boolean).length;
    const sentences = trimmed === "" ? 0 : trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = trimmed === "" ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    return {
      words,
      chars: text.length,
      charsNoSpaces: text.replace(/\s/g, "").length,
      sentences,
      paragraphs,
      readingTime: Math.max(1, Math.ceil(words / 200)),
    };
  }, [text]);

  const cards = [
    { label: "Words", value: stats.words },
    { label: "Characters", value: stats.chars },
    { label: "No spaces", value: stats.charsNoSpaces },
    { label: "Sentences", value: stats.sentences },
    { label: "Paragraphs", value: stats.paragraphs },
    { label: "Read time", value: `~${stats.readingTime}m` },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Word Counter</h1>
        <p className="text-stone-500 mt-1">Count words, characters, sentences, and reading time in real time.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        {cards.map(({ label, value }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-xl px-3 py-4 text-center">
            <p className="text-xl font-extrabold text-stone-900 tabular-nums">{value}</p>
            <p className="text-[11px] text-stone-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <textarea
        className="w-full h-80 p-5 text-base text-stone-800 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 leading-relaxed"
        placeholder="Start typing or paste your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {text && (
        <button onClick={() => setText("")} className="mt-3 text-sm text-stone-400 hover:text-stone-700 transition">
          Clear
        </button>
      )}
    </main>
  );
}
