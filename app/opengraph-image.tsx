import { ImageResponse } from "next/og";

/**
 * Default social preview image for the whole site.
 *
 * Generated rather than a static file: the root layout referenced
 * /og-image.png, which never existed, so every share on LinkedIn, WhatsApp,
 * Slack or X rendered with no image at all. Pages that define their own
 * `openGraph` block inherit this automatically through the file convention.
 */

export const alt = "Coded Mind — data engineering, software, and AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0a09",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand mark, matching the site's diamond logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 180 180" fill="none">
            <polygon points="90,8 125,43 90,78 55,43" stroke="#C87660" strokeWidth="14" />
            <polygon points="90,102 125,137 90,172 55,137" stroke="#C87660" strokeWidth="14" />
            <polygon points="8,90 43,55 78,90 43,125" stroke="#FFFFFF" strokeWidth="14" />
            <polygon points="102,90 137,55 172,90 137,125" stroke="#FFFFFF" strokeWidth="14" />
          </svg>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            <span style={{ color: "#ffffff" }}>CODED</span>
            <span style={{ color: "#C87660" }}>&nbsp;MIND</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Data engineering, software, and AI — plus free developer tools.
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 26, color: "#a8a29e" }}>
            codedmind.co.in
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["Data pipelines", "Web apps", "AI features", "Free tools"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                border: "1px solid #44403c",
                borderRadius: 999,
                padding: "9px 20px",
                fontSize: 21,
                color: "#d6d3d1",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
