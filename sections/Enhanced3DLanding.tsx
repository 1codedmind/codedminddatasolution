"use client";

import Enhanced3DHero from "@/components/landing/Enhanced3DHero";
import Services from "@/sections/Services";
import Solutions from "@/sections/Solutions";
import ToolsSection from "@/sections/Tools";
import Enhanced3DResumeSpotlight from "@/components/landing/Enhanced3DResumeSpotlight";
import WhyUs from "@/sections/WhyUs";
import Process from "@/sections/Process";
import CTA from "@/sections/CTA";

export default function Enhanced3DLanding() {
  return (
    <main>
      {/* 1. Company-wide hero — data + dev tools */}
      <Enhanced3DHero />
      {/* 2. Primary business — data engineering services */}
      <Services />
      {/* 3. Resume builder as a featured tool */}
      <Enhanced3DResumeSpotlight />
      {/* 4. Industry solutions */}
      <Solutions />
      {/* 5. Free developer tools (12 tools) */}
      <ToolsSection />
      {/* 6. Trust, process, CTA */}
      <WhyUs />
      <Process />
      <CTA />
    </main>
  );
}
