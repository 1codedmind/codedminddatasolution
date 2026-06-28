"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition"
    >
      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 last:border-0">
      <div>
        <p className="text-xs font-semibold text-stone-400 mb-0.5">{label}</p>
        <p className="text-sm font-mono text-stone-800 select-all">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function TimestampTool() {
  const [unix, setUnix] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [now] = useState(() => new Date());

  const fromUnix = (() => {
    const n = parseInt(unix);
    if (!unix || isNaN(n)) return null;
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return {
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: d.toLocaleString(),
    };
  })();

  const fromDate = (() => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return {
      unix: Math.floor(d.getTime() / 1000).toString(),
      unixMs: d.getTime().toString(),
    };
  })();

  return (
    <>
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mb-6">
        <p className="text-xs font-semibold text-amber-700 mb-1">Current time</p>
        <p className="font-mono text-sm text-stone-800">{now.toISOString()}</p>
        <p className="font-mono text-xs text-stone-500 mt-0.5">Unix: {Math.floor(now.getTime() / 1000)}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <label className="text-sm font-semibold text-stone-700">Unix timestamp → Date</label>
            <input
              type="number"
              placeholder="e.g. 1700000000"
              value={unix}
              onChange={(e) => setUnix(e.target.value)}
              className="mt-2 w-full font-mono text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>
          {fromUnix ? (
            <>
              <Row label="UTC" value={fromUnix.utc} />
              <Row label="ISO 8601" value={fromUnix.iso} />
              <Row label="Local" value={fromUnix.local} />
            </>
          ) : unix ? (
            <p className="px-5 py-3 text-sm text-red-500">Invalid timestamp</p>
          ) : null}
        </div>

        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <label className="text-sm font-semibold text-stone-700">Date → Unix timestamp</label>
            <input
              type="datetime-local"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="mt-2 w-full text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-400"
            />
          </div>
          {fromDate && (
            <>
              <Row label="Unix (seconds)" value={fromDate.unix} />
              <Row label="Unix (milliseconds)" value={fromDate.unixMs} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
