"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Braces, Minimize2 } from "lucide-react";
import type { Metadata } from "next";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  const format = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input]);

  const clear = () => { setInput(""); setOutput(""); setError(""); };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">JSON Formatter</h1>
        <p className="text-stone-500 mt-1">Format, validate, and minify JSON. Runs entirely in your browser.</p>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={format} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
          <Braces size={14} /> Format
        </button>
        <button onClick={minify} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition">
          <Minimize2 size={14} /> Minify
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-stone-500">Indent:</label>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${indent === n ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={clear} className="text-sm text-stone-400 hover:text-stone-700 transition">Clear</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Input</label>
          <textarea
            className="w-full h-[480px] p-4 font-mono text-sm text-stone-800 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            placeholder='{"key": "value"}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Output</label>
            {output && <CopyButton text={output} />}
          </div>
          {error ? (
            <div className="h-[480px] p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-semibold text-red-600 mb-1">Invalid JSON</p>
              <p className="text-sm text-red-500 font-mono">{error}</p>
            </div>
          ) : (
            <pre className="w-full h-[480px] p-4 font-mono text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-xl overflow-auto whitespace-pre-wrap break-all">
              {output || <span className="text-stone-300">Formatted output will appear here</span>}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
