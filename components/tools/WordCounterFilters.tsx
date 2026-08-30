"use client";

import {
  Users, Baby, BookOpen, Megaphone, Newspaper, Briefcase, Code2,
  GraduationCap, Scale, Mail, Gauge, Target, SlidersHorizontal, Layers, Check, Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AUDIENCES, audienceById } from "@/lib/tools/audiences";

const ICONS: Record<string, LucideIcon> = {
  Users, Baby, BookOpen, Megaphone, Newspaper, Briefcase, Code2, GraduationCap, Scale, Mail,
};

export type Settings = {
  audienceId: string;
  /** The term an SEO or content writer is targeting, if any. */
  focusKeyword: string;
  /** null means "follow the audience's own reading speed". */
  wpmOverride: number | null;
  goal: number;
  minKeywordLength: number;
  includeStopWords: boolean;
  showLimits: boolean;
  showPreviews: boolean;
  showAnalysis: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  audienceId: "general",
  focusKeyword: "",
  wpmOverride: null,
  goal: 0,
  minKeywordLength: 3,
  includeStopWords: false,
  showLimits: true,
  showPreviews: true,
  showAnalysis: true,
};

const GOAL_PRESETS = [250, 500, 800, 1000, 1500, 2000];
const SPEEDS: { label: string; value: number | null }[] = [
  { label: "Audience default", value: null },
  { label: "Slow · 150 wpm", value: 150 },
  { label: "Average · 200 wpm", value: 200 },
  { label: "Fast · 300 wpm", value: 300 },
];

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-stone-200 px-4 py-4 last:border-b-0">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-stone-400">
        <Icon size={13} /> {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left text-xs text-stone-600 transition-colors hover:bg-stone-50"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked ? "border-blue-600 bg-blue-600" : "border-stone-300 bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      {label}
    </button>
  );
}

export default function WordCounterFilters({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
}) {
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value });

  const audience = audienceById(settings.audienceId);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      {/* Audience — the setting everything else keys off. */}
      <Section icon={Users} title="Writing for">
        <div className="space-y-0.5">
          {AUDIENCES.map((a) => {
            const Icon = ICONS[a.icon] ?? Users;
            const active = a.id === settings.audienceId;
            return (
              <button
                key={a.id}
                onClick={() => set("audienceId", a.id)}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                  active ? "bg-blue-50 ring-1 ring-blue-200" : "hover:bg-stone-50"
                }`}
              >
                <Icon
                  size={15}
                  className={`mt-0.5 shrink-0 ${active ? "text-blue-600" : "text-stone-400"}`}
                />
                <span className="min-w-0">
                  <span className={`block text-xs font-semibold ${active ? "text-blue-900" : "text-stone-700"}`}>
                    {a.name}
                  </span>
                  {active && (
                    <span className="mt-0.5 block text-[11px] leading-snug text-blue-700">
                      Target grade {a.grade[0]}–{a.grade[1]} · sentences under {a.sentenceLimit} words
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section icon={Search} title="Focus keyword">
        <input
          type="text"
          placeholder="e.g. word counter"
          value={settings.focusKeyword}
          onChange={(e) => set("focusKeyword", e.target.value)}
          className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        />
        <p className="mt-1.5 text-[11px] leading-snug text-stone-400">
          Track density and whether it appears early, the way an SEO writer works.
        </p>
      </Section>

      <Section icon={Gauge} title="Reading speed">
        <select
          value={settings.wpmOverride ?? ""}
          onChange={(e) => set("wpmOverride", e.target.value === "" ? null : Number(e.target.value))}
          className="w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 focus:border-blue-500 focus:outline-none"
        >
          {SPEEDS.map((s) => (
            <option key={s.label} value={s.value ?? ""}>
              {s.label}
              {s.value === null ? ` (${audience.wpm})` : ""}
            </option>
          ))}
        </select>
      </Section>

      <Section icon={Target} title="Word goal">
        <div className="grid grid-cols-3 gap-1.5">
          {GOAL_PRESETS.map((g) => (
            <button
              key={g}
              onClick={() => set("goal", settings.goal === g ? 0 : g)}
              className={`rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition-colors ${
                settings.goal === g
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={0}
          placeholder="Custom…"
          value={settings.goal || ""}
          onChange={(e) => set("goal", Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="mt-2 w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
        />
      </Section>

      <Section icon={SlidersHorizontal} title="Keywords">
        <label className="mb-2 block text-[11px] text-stone-500">
          Minimum word length
          <select
            value={settings.minKeywordLength}
            onChange={(e) => set("minKeywordLength", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 focus:border-blue-500 focus:outline-none"
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}+ characters</option>
            ))}
          </select>
        </label>
        <Toggle
          label="Include filler words"
          checked={settings.includeStopWords}
          onChange={(v) => set("includeStopWords", v)}
        />
      </Section>

      <Section icon={Layers} title="Panels">
        <div className="space-y-0.5">
          <Toggle label="Platform limits" checked={settings.showLimits} onChange={(v) => set("showLimits", v)} />
          <Toggle label="Live previews" checked={settings.showPreviews} onChange={(v) => set("showPreviews", v)} />
          <Toggle label="Keywords & sentences" checked={settings.showAnalysis} onChange={(v) => set("showAnalysis", v)} />
        </div>
      </Section>
    </div>
  );
}
