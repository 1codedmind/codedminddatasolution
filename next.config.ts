import type { NextConfig } from "next";

function buildContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";

  // Vercel Analytics script host + Speed Insights
  const vercelScripts = "https://va.vercel-scripts.com";
  // Vercel Analytics + Speed Insights beacon endpoint
  const vercelInsights = "https://vitals.vercel-insights.com";
  // The Torn game tool calls the Torn API directly from the browser, using a key
  // the visitor stores locally. Keeping the call client-side is deliberate: it
  // means no visitor's API key is ever sent to, or stored on, our servers.
  const tornApi = "https://api.torn.com";

  // Google AdSense. Ads need script, frame, image and beacon permissions; the
  // strict default policy blocks every one of them, so ads simply would not
  // render without this. Kept as named constants so it is obvious what each
  // host is for rather than an opaque wall of domains.
  const adsScripts = "https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com";
  const adsFrames = "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com";
  const adsImages = "https://pagead2.googlesyndication.com https://tpc.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net";
  const adsConnect = "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net";

  // Google's own Consent Management Platform ("Privacy & messaging" in AdSense).
  // Required for EEA/UK traffic — a homemade banner does not satisfy Google's
  // consent policy, and ads simply will not serve to those visitors without a
  // certified CMP. Delivered through these hosts.
  const cmpHosts = "https://fundingchoicesmessages.google.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google";

  // Google Analytics 4
  const ga4Scripts = "https://www.googletagmanager.com";
  const ga4Collect = "https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com";

  const scriptSrc = isProduction
    ? `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net ${vercelScripts} ${ga4Scripts} ${adsScripts} ${cmpHosts}`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net ${vercelScripts} ${ga4Scripts} ${adsScripts} ${cmpHosts}`;

  return [
    "default-src 'self'",
    scriptSrc,
    // cdn.jsdelivr.net: Monaco editor loads its CSS from the CDN
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    `img-src 'self' data: blob: https://www.google-analytics.com ${adsImages} ${cmpHosts}`,
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net ${tornApi} ${vercelInsights} ${ga4Collect} ${adsConnect} ${cmpHosts}`,
    "worker-src 'self' blob:",
    `child-src 'self' blob: ${adsFrames}`,
    `frame-src 'self' ${adsFrames} ${cmpHosts}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
