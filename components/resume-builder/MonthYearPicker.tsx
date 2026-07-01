"use client";

import { useMemo } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = CURRENT_YEAR + 2; y >= 1970; y--) YEARS.push(y);

// Parse any common date string into { month (0-indexed) | null, year | null }
function parseDate(value: string): { month: number | null; year: number | null } {
  const v = (value ?? "").trim();
  if (!v || v.toLowerCase() === "present" || v.toLowerCase() === "current") {
    return { month: null, year: null };
  }

  // YYYY-MM  (legacy type="month" format)
  const m1 = v.match(/^(\d{4})-(\d{2})$/);
  if (m1) return { month: parseInt(m1[2], 10) - 1, year: parseInt(m1[1], 10) };

  // MM/YYYY or M/YYYY
  const m2 = v.match(/^(\d{1,2})\/(\d{4})$/);
  if (m2) return { month: parseInt(m2[1], 10) - 1, year: parseInt(m2[2], 10) };

  // YYYY/MM
  const m3 = v.match(/^(\d{4})\/(\d{2})$/);
  if (m3) return { month: parseInt(m3[2], 10) - 1, year: parseInt(m3[1], 10) };

  // "Jan 2022" or "January 2022"
  const m4 = v.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m4) {
    const prefix = m4[1].toLowerCase().slice(0, 3);
    const mIdx = FULL_MONTHS.findIndex((fm) => fm.toLowerCase().startsWith(prefix));
    if (mIdx >= 0) return { month: mIdx, year: parseInt(m4[2], 10) };
  }

  // "2022 Jan" or "2022 January"
  const m5 = v.match(/^(\d{4})\s+([A-Za-z]+)$/);
  if (m5) {
    const prefix = m5[2].toLowerCase().slice(0, 3);
    const mIdx = FULL_MONTHS.findIndex((fm) => fm.toLowerCase().startsWith(prefix));
    if (mIdx >= 0) return { month: mIdx, year: parseInt(m5[1], 10) };
  }

  // Year only
  const m6 = v.match(/^(\d{4})$/);
  if (m6) return { month: null, year: parseInt(m6[1], 10) };

  return { month: null, year: null };
}

function formatDate(month: number | null, year: number | null): string {
  if (year === null) return "";
  if (month === null) return String(year);
  return `${MONTHS[month]} ${year}`;
}

const selectCls =
  "flex-1 px-2.5 py-2 text-[13px] bg-white border border-stone-200 rounded-lg text-stone-800 " +
  "focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all " +
  "appearance-none cursor-pointer";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function MonthYearPicker({ label, value, onChange, placeholder }: Props) {
  const { month, year } = useMemo(() => parseDate(value), [value]);

  function handleMonth(e: React.ChangeEvent<HTMLSelectElement>) {
    const m = e.target.value === "" ? null : parseInt(e.target.value, 10);
    onChange(formatDate(m, year));
  }

  function handleYear(e: React.ChangeEvent<HTMLSelectElement>) {
    const y = e.target.value === "" ? null : parseInt(e.target.value, 10);
    onChange(formatDate(month, y));
  }

  return (
    <div>
      <label className="block text-[11px] font-semibold text-stone-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-1.5">
        {/* Month */}
        <div className="relative flex-1">
          <select value={month ?? ""} onChange={handleMonth} className={selectCls}>
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <ChevronIcon />
        </div>

        {/* Year */}
        <div className="relative flex-1">
          <select value={year ?? ""} onChange={handleYear} className={selectCls}>
            <option value="">{placeholder ?? "Year"}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400"
      width="12" height="12" viewBox="0 0 12 12" fill="none"
    >
      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
