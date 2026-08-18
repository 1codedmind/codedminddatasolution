"use client";

import { useEffect, useRef } from "react";

import { useConsent } from "@/components/CookieConsent";

/**
 * A single AdSense unit.
 *
 * Gated on the same consent the analytics script uses: no consent, no ad script,
 * no request to Google. It also renders nothing until a publisher ID is
 * configured, so slots can be placed now and stay dormant until AdSense
 * approval comes through.
 *
 * Reserves its height up front. Ads that appear and shove the page down are the
 * fastest way to make a useful tool feel cheap, and they wreck Core Web Vitals —
 * which is the search traffic this is meant to monetise.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Props = {
  slot: string;
  /** Reserved height, so the layout does not jump when the ad loads. */
  minHeight?: number;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
};

export default function AdSlot({ slot, minHeight = 100, format = "auto", className = "" }: Props) {
  const { consent } = useConsent();
  const pushed = useRef(false);

  const active = Boolean(CLIENT_ID) && consent === "accepted";

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // A blocked or failed ad must never break the page around it.
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className={`mx-auto w-full overflow-hidden ${className}`} style={{ minHeight }}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <p className="mt-1 text-center text-[10px] uppercase tracking-widest text-stone-300">
        Advertisement
      </p>
    </div>
  );
}
