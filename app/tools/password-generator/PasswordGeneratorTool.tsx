"use client";

import { useState, useCallback } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

import { WORDLIST, BITS_PER_WORD } from "@/data/wordlist";

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

const SEPARATORS = [
  { value: "-", label: "hyphen" },
  { value: ".", label: "dot" },
  { value: "_", label: "underscore" },
  { value: " ", label: "space" },
];

type Mode = "password" | "passphrase";

/**
 * Strength from entropy rather than a checklist.
 *
 * The old heuristic scored "has an uppercase letter, has a digit" and so rated
 * a 4-word passphrase as weak despite it being far harder to guess than the
 * 12-character string it preferred. Bits of entropy compares the two honestly.
 */
function strengthFromBits(bits: number): { label: string; color: string; width: string } {
  if (bits < 40) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (bits < 60) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
  if (bits < 80) return { label: "Strong", color: "bg-emerald-400", width: "w-3/4" };
  return { label: "Very Strong", color: "bg-emerald-500", width: "w-full" };
}

/** Uniform random integer in [0, max) — rejection sampling avoids modulo bias. */
function randomInt(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
}

export default function PasswordGeneratorTool() {
  const [mode, setMode] = useState<Mode>("password");

  // Password options
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });

  // Passphrase options
  const [wordCount, setWordCount] = useState(6);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);

  const [secret, setSecret] = useState("");
  const [bits, setBits] = useState(0);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    if (mode === "password") {
      const pool = Object.entries(opts)
        .filter(([, v]) => v)
        .map(([k]) => CHARS[k as keyof typeof CHARS])
        .join("");
      if (!pool) return;

      const chars = Array.from({ length }, () => pool[randomInt(pool.length)]);
      setSecret(chars.join(""));
      setBits(length * Math.log2(pool.length));
      return;
    }

    const words = Array.from({ length: wordCount }, () => {
      const word = WORDLIST[randomInt(WORDLIST.length)];
      return capitalize ? word[0].toUpperCase() + word.slice(1) : word;
    });

    // A trailing digit satisfies "must contain a number" policies without
    // pretending to add meaningful entropy — it adds about 3.3 bits.
    if (addNumber) words.push(String(randomInt(10)));

    setSecret(words.join(separator));
    setBits(wordCount * BITS_PER_WORD + (addNumber ? Math.log2(10) : 0));
  }, [mode, length, opts, wordCount, separator, capitalize, addNumber]);

  const copy = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const s = secret ? strengthFromBits(bits) : null;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
      {/* Mode switch */}
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1">
        {(["password", "passphrase"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setSecret("");
              setBits(0);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition ${
              mode === m ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-2 font-mono text-base bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 min-h-[3rem]">
          <span className="flex-1 break-all text-stone-800 select-all">
            {secret || <span className="text-stone-300">Click Generate</span>}
          </span>
          <button onClick={copy} className="shrink-0 p-1 text-stone-400 hover:text-amber-600 transition">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
        </div>
        {s && (
          <div className="mt-2">
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${s.color} ${s.width}`} />
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {s.label} · {Math.round(bits)} bits of entropy
            </p>
          </div>
        )}
      </div>

      {mode === "password" ? (
        <>
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
                <span className="text-sm text-stone-700">
                  {key === "upper"
                    ? "Uppercase (A–Z)"
                    : key === "lower"
                      ? "Lowercase (a–z)"
                      : key === "numbers"
                        ? "Numbers (0–9)"
                        : "Symbols (!@#…)"}
                </span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-stone-700">Words</label>
              <span className="text-sm font-bold text-stone-900 tabular-nums">{wordCount}</span>
            </div>
            <input
              type="range"
              min={3}
              max={10}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-xs text-stone-300 mt-1">
              <span>3</span><span>10</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700">Separator</label>
            <div className="flex gap-1 rounded-lg bg-stone-100 p-1">
              {SEPARATORS.map((sep) => (
                <button
                  key={sep.value}
                  onClick={() => setSeparator(sep.value)}
                  title={sep.label}
                  className={`flex-1 rounded-md py-1.5 font-mono text-sm transition ${
                    separator === sep.value
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {sep.value === " " ? "space" : sep.value}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(e) => setCapitalize(e.target.checked)}
                className="h-4 w-4 accent-amber-600"
              />
              <span className="text-sm text-stone-700">Capitalise words</span>
            </label>
            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={addNumber}
                onChange={(e) => setAddNumber(e.target.checked)}
                className="h-4 w-4 accent-amber-600"
              />
              <span className="text-sm text-stone-700">Add a number</span>
            </label>
          </div>

          <p className="text-xs leading-relaxed text-stone-500">
            Passphrases are easier to remember and type than random strings, and
            length does more for strength than symbols do. Drawn from a list of{" "}
            {WORDLIST.length.toLocaleString()} words, so each word adds exactly{" "}
            {BITS_PER_WORD} bits.
          </p>
        </>
      )}

      <button
        onClick={generate}
        className="w-full inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition"
      >
        <RefreshCw size={15} /> Generate {mode === "password" ? "Password" : "Passphrase"}
      </button>
    </div>
  );
}
