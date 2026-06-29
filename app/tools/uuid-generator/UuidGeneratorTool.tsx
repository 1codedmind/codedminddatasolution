"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Trash2 } from "lucide-react";

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xff) % 16;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="p-1.5 text-stone-400 hover:text-amber-600 transition"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([uuidv4()]);
  const [count, setCount] = useState(1);
  const [copiedAll, setCopiedAll] = useState(false);

  const generate = () => setUuids(Array.from({ length: count }, uuidv4));
  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <a href="/tools" className="text-sm text-stone-400 hover:text-stone-700 transition">← All tools</a>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-3">UUID Generator</h1>
        <p className="text-stone-500 mt-1">Generate cryptographically secure v4 UUIDs in your browser.</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
          <label className="text-sm text-stone-500">Count:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 text-sm font-semibold text-stone-900 focus:outline-none bg-transparent"
          />
        </div>
        <button onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">
          <RefreshCw size={14} /> Generate
        </button>
        <button onClick={copyAll} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition">
          {copiedAll ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          {copiedAll ? "Copied!" : "Copy all"}
        </button>
        <button onClick={() => setUuids([])} className="p-2 text-stone-400 hover:text-stone-700 transition" title="Clear">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
        {uuids.length === 0 && (
          <p className="px-5 py-6 text-sm text-stone-400 text-center">No UUIDs generated yet.</p>
        )}
        {uuids.map((uuid, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3 group hover:bg-stone-50 transition">
            <span className="font-mono text-sm text-stone-700 select-all">{uuid}</span>
            <CopyButton text={uuid} />
          </div>
        ))}
      </div>
    </main>
  );
}
