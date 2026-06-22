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
    // PDF tools
    { path: "/tools/pdf",                 priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/merge",           priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/split",           priority: 0.9, changefreq: "monthly" as const },
    { path: "/tools/pdf/rotate",          priority: 0.8, changefreq: "monthly" as const },
    { path: "/tools/pdf/jpg-to-pdf",      priority: 0.8, changefreq: "monthly" as const },
  ];

  return [
    { url: BASE,          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    ...tools.map(({ path, priority, changefreq }) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: changefreq,
      priority,
    })),
    { url: `${BASE}/careers`, lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
  ];
}
