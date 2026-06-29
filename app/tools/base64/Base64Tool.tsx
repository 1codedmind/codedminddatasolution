"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition">
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const output = (() => {
    if (!input.trim()) return "";
    try {
      if (mode === "encode") {
        const result = btoa(unescape(encodeURIComponent(input)));
        setError("");
        return result;
      } else {
        const result = decodeURIComponent(escape(atob(input.trim())));
        setError("");
        return result;
      }
    } catch {
      setError(mode === "decode" ? "Invalid Base64 input." : "Could not encode input.");
      return "";
    }
  })();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">Base64 Encoder / Decoder</h1>
        <p className="text-stone-500 mt-1">Encode or decode Base64 instantly. Runs entirely in your browser.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition capitalize ${mode === m ? "bg-stone-900 text-white" : "bg-white text-stone-600 border border-stone-300 hover:bg-stone-50"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            {mode === "encode" ? "Plain Text" : "Base64"}
          </label>
          <textarea
            className="w-full h-72 p-4 font-mono text-sm text-stone-800 bg-white border border-stone-200 rounded-xl resize-none focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              {mode === "encode" ? "Base64" : "Plain Text"}
            </label>
            {output && <CopyButton text={output} />}
          </div>
          {error ? (
            <div className="h-72 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : (
            <pre className="w-full h-72 p-4 font-mono text-sm text-stone-800 bg-stone-50 border border-stone-200 rounded-xl overflow-auto whitespace-pre-wrap break-all">
              {output || <span className="text-stone-300">Output will appear here</span>}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
