import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 38,
          background: "#2B2B2B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="164" height="164" viewBox="0 0 180 180">
          <polygon points="90,8 125,43 90,78 55,43"      fill="#2B2B2B" stroke="#C87660" strokeWidth="11" strokeLinejoin="miter"/>
          <polygon points="90,102 125,137 90,172 55,137"  fill="#2B2B2B" stroke="#C87660" strokeWidth="11" strokeLinejoin="miter"/>
          <polygon points="8,90 43,55 78,90 43,125"       fill="#2B2B2B" stroke="#FFFFFF" strokeWidth="11" strokeLinejoin="miter"/>
          <polygon points="102,90 137,55 172,90 137,125"  fill="#2B2B2B" stroke="#FFFFFF" strokeWidth="11" strokeLinejoin="miter"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
