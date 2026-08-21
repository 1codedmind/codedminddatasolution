"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

type Counts = { total: number; today: number };

/**
 * How many distinct people have used this tool.
 *
 * Deliberately client-rendered and fetched on mount rather than passed down
 * from the page. The page itself is cached and shared between visitors, so a
 * server-rendered number would be baked into that cached HTML and go stale -
 * the same trap as a server-rendered "4 minutes ago".
 *
 * The POST both records this visit and returns the fresh totals, so the
 * visitor sees themselves counted rather than a number that ignores them.
 */
export default function VisitorCount() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/tools/torn/visitors", {
      method: "POST",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && typeof data.total === "number") {
          setCounts({ total: data.total, today: data.today });
        }
      })
      .catch(() => {
        // A counter is decorative. If it fails, the tool is still the tool.
      });

    return () => controller.abort();
  }, []);

  // Hold the slot open at the same height either way, so the heading below
  // does not jump once the number lands.
  if (!counts || counts.total === 0) {
    return <span className="inline-block h-[26px]" aria-hidden="true" />;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600"
      title="Distinct visitors to this page, counted without cookies"
    >
      <Users size={12} className="text-stone-400" />
      {/* Number and noun share one span so they are separated by a word space
          rather than the flex gap, which reads too wide between them. */}
      <span className="tabular-nums">
        {counts.total.toLocaleString()} {counts.total === 1 ? "visitor" : "visitors"}
      </span>
      {counts.today > 0 && (
        <>
          <span className="text-stone-300">|</span>
          <span className="tabular-nums font-medium text-stone-500">
            {counts.today.toLocaleString()} today
          </span>
        </>
      )}
    </span>
  );
}
