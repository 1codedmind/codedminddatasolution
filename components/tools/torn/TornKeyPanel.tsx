"use client";

import { useState } from "react";
import { KeyRound, Check, Loader2, X, ShieldCheck } from "lucide-react";

export default function TornKeyPanel({
  hasKey,
  enrichedCount,
  status,
  error,
  onSave,
  onClear,
}: {
  hasKey: boolean;
  enrichedCount: number;
  status: "idle" | "loading" | "ready" | "error";
  error: string;
  onSave: (key: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  if (hasKey && status === "ready") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
        <p className="flex items-center gap-2 text-sm text-emerald-900">
          <Check size={15} className="shrink-0" />
          Your API key is active — item types and vendor sell prices are included
          {enrichedCount > 0 && ` (${enrichedCount.toLocaleString()} items enriched)`}.
        </p>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
        >
          Remove key
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-4">
      {!open ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <KeyRound size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-sm leading-relaxed text-stone-600">
              Add your Torn API key to unlock item types and the{" "}
              <span className="font-medium text-stone-800">vendor sell</span> route.
              Optional — prices work without it.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            Add API key
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-600">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>
                Your key stays in this browser and is sent{" "}
                <span className="font-semibold">only to api.torn.com</span>, never to
                us. A public (Limited Access) key is enough — check your network tab
                if you want to verify.
              </span>
            </p>
            <button onClick={() => setOpen(false)} className="shrink-0 text-stone-400 hover:text-stone-600">
              <X size={15} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && value.trim() && onSave(value.trim())}
              placeholder="Paste your Torn API key"
              className="min-w-[200px] flex-1 rounded-lg border border-stone-200 px-3 py-2 font-mono text-sm outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              onClick={() => value.trim() && onSave(value.trim())}
              disabled={!value.trim() || status === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" && <Loader2 size={13} className="animate-spin" />}
              {status === "loading" ? "Checking…" : "Save"}
            </button>
          </div>
          {status === "error" && error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
