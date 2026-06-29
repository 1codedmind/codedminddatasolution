import type { Metadata } from "next";
import { Suspense } from "react";
import TimezoneConverterTool from "./TimezoneConverterTool";

export const metadata: Metadata = {
  title: "Timezone Converter — World Clock for 500+ IANA Timezones",
  description:
    "Convert times across 500+ IANA timezones instantly. Compare New York, London, Dubai, Singapore, Tokyo, Sydney and more with our free timezone converter.",
  keywords: ["timezone converter", "world clock", "time zone converter", "IANA timezones", "UTC converter"],
  alternates: { canonical: "https://codedmind.co.in/tools/timezone-converter" },
};

export default function TimezoneConverterPage() {
  return (
    <Suspense>
      <TimezoneConverterTool />
    </Suspense>
  );
}
