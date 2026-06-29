import type { NextConfig } from "next";

function buildContentSecurityPolicy() {
  const isProduction = process.env.NODE_ENV === "production";

  // Vercel Analytics script host + Speed Insights
  const vercelScripts = "https://va.vercel-scripts.com";
  // Vercel Analytics + Speed Insights beacon endpoint
  const vercelInsights = "https://vitals.vercel-insights.com";
  // Google Analytics 4
  const ga4Scripts = "https://www.googletagmanager.com";
  const ga4Collect = "https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com";

  const scriptSrc = isProduction
    ? `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net ${vercelScripts} ${ga4Scripts}`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net ${vercelScripts} ${ga4Scripts}`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.google-analytics.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net ${vercelInsights} ${ga4Collect}`,
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
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
