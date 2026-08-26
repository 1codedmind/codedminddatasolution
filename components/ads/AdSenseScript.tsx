import Script from "next/script";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Loads the AdSense library once, from the root layout.
 *
 * Deliberately NOT gated on our own cookie banner, unlike GoogleAnalytics.
 *
 * Two reasons. First, AdSense verifies a site by crawling it for this exact
 * script tag; when the tag only rendered after a visitor clicked "Accept all",
 * the crawler saw a page with no ad code and verification could not pass.
 * Second, even after approval, gating here would mean only the fraction of
 * visitors who accept ever produce revenue.
 *
 * EEA and UK consent is instead handled by Google's own CMP — the GDPR message
 * configured under Privacy & messaging in the AdSense dashboard — which is the
 * mechanism Google requires for ad traffic and which runs inside this script.
 * Analytics stays behind our banner, because nothing external requires it.
 *
 * A server component: there is no consent hook to read any more, so this needs
 * no client bundle. It also means the tag is present in the server-rendered
 * HTML, which is precisely what the verifier needs to see.
 */
export default function AdSenseScript() {
  if (!CLIENT_ID) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
