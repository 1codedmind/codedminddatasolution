"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function strength(pwd: string): { label: string; color: string; width: string } {
  let score = 0;
  if (pwd.length >= 12) score++;
  if (pwd.length >= 16) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 2) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (score <= 4) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
  if (score === 5) return { label: "Strong", color: "bg-emerald-400", width: "w-3/4" };
  return { label: "Very Strong", color: "bg-emerald-500", width: "w-full" };
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pool = Object.entries(opts)
      .filter(([, v]) => v)
      .map(([k]) => CHARS[k as keyof typeof CHARS])
      .join("");
    if (!pool) return;
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    setPassword(Array.from(arr, (n) => pool[n % pool.length]).join(""));
  }, [length, opts]);

  const copy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const s = password ? strength(password) : null;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 font-mono text-base bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 min-h-[3rem]">
          <span className="flex-1 break-all text-stone-800 select-all">{password || <span className="text-stone-300">Click Generate</span>}</span>
          <button onClick={copy} className="shrink-0 p-1 text-stone-400 hover:text-amber-600 transition">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
        </div>
        {s && (
          <div className="mt-2">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${s.color} ${s.width}`} />
            </div>
            <p className="text-xs text-stone-400 mt-1">{s.label}</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-stone-700">Length</label>
          <span className="text-sm font-bold text-stone-900 tabular-nums">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-amber-600"
        />
        <div className="flex justify-between text-xs text-stone-300 mt-1">
          <span>8</span><span>64</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(CHARS) as Array<keyof typeof CHARS>).map((key) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
              className="w-4 h-4 accent-amber-600"
            />
            <span className="text-sm text-stone-700 capitalize">
              {key === "upper" ? "Uppercase (A–Z)" : key === "lower" ? "Lowercase (a–z)" : key === "numbers" ? "Numbers (0–9)" : "Symbols (!@#…)"}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={generate}
        className="w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition"
      >
        <RefreshCw size={15} /> Generate Password
      </button>
    </div>
  );
}
