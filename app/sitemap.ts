import type { MetadataRoute } from "next";

const BASE = "https://codedmind.co.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const tools = [
    // Developer tools
    { path: "/tools/json-formatter",      priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/timezone-converter",  priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/timestamp",           priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/uuid-generator",      priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/base64",              priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/word-counter",        priority: 0.7, changefreq: "monthly" as const },
    { path: "/tools/password-generator",  priority: 0.7, changefreq: "monthly" as const },
    // Resume builder
    { path: "/tools/resume-builder",      priority: 0.9, changefreq: "monthly" as const },
    // Game tools
    { path: "/about",                     priority: 0.7, changefreq: "yearly" as const },
    { path: "/tools/games",              priority: 0.8, changefreq: "weekly" as const },
    { path: "/tools/games/torn-profit",  priority: 0.8, changefreq: "daily" as const },
    // PDF tools
    { path: "/tools/pdf",                 priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/merge",           priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/split",           priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/compress",        priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/rotate",          priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/pdf/jpg-to-pdf",      priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/pdf/sign",            priority: 0.9, changefreq: "monthly" as const },
  ];

  return [
    { url: BASE,             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/tools`,  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    ...tools.map(({ path, priority, changefreq }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: changefreq,
      priority,
    })),
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/it-services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/contact`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/careers`,  lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
