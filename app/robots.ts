import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/hrms/",
          "/admin/",
          "/candidate/",
          "/assessments/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://codedmind.co.in/sitemap.xml",
  };
}
