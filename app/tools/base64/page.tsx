import type { Metadata } from "next";
import { Suspense } from "react";
import Base64Tool from "./Base64Tool";

export const metadata: Metadata = {
  title: "Base64 Encoder / Decoder — Free Online Tool",
  description:
    "Encode text to Base64 or decode Base64 strings instantly in your browser. Fast, free, and no data is sent to any server.",
  keywords: ["Base64 encoder", "Base64 decoder", "Base64 converter", "encode Base64", "decode Base64 online"],
  alternates: { canonical: "https://codedmind.co.in/tools/base64" },
};

export default function Base64Page() {
  return (
    <Suspense>
      <Base64Tool />
    </Suspense>
  );
}
