"use client";

import Script from "next/script";

import { useConsent } from "@/components/CookieConsent";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Loads the AdSense library once, from the root layout.
 *
 * Mirrors GoogleAnalytics: nothing loads without explicit consent, so a visitor
 * who declines never sends a request to Google.
 */
export default function AdSenseScript() {
  const { consent } = useConsent();

  if (!CLIENT_ID || consent !== "accepted") return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
