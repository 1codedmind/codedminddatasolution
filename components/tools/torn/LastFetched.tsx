"use client";

import { useEffect, useState } from "react";

/**
 * When the upstream crawler last generated its price snapshot.
 *
 * Shows an absolute UTC time plus a live relative age. Torn City Time is UTC,
 * so the absolute figure is directly comparable to the clock in game.
 *
 * The relative part is computed in the browser and ticks. Deriving it on the
 * server would bake "4 minutes ago" into a cached page and still say that an
 * hour later.
 */
export default function LastFetched({ generatedAt }: { generatedAt: number }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!generatedAt) return;
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => clearInterval(id);
  }, [generatedAt]);

  if (!generatedAt) return null;

  const stamp = new Date(generatedAt * 1000);
  const utc = stamp.toISOString().slice(0, 16).replace("T", " ");

  const seconds = Math.max(0, now - generatedAt);
  const ago =
    seconds < 60
      ? `${seconds}s ago`
      : seconds < 3600
        ? `${Math.floor(seconds / 60)} min ago`
        : `${Math.floor(seconds / 3600)}h ago`;

  return (
    <span title={stamp.toUTCString()}>
      prices from{" "}
      <span className="font-medium text-stone-600 tabular-nums">{utc} UTC</span>{" "}
      <span className="text-stone-400">({ago})</span>
    </span>
  );
}
