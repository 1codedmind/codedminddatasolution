import Hero from "@/sections/Hero";
import ToolsSection from "@/sections/Tools";
import Services from "@/sections/Services";
import Solutions from "@/sections/Solutions";
import WhyUs from "@/sections/WhyUs";
import Process from "@/sections/Process";
import CTA from "@/sections/CTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <ToolsSection />
      <Services />
      <Solutions />
      <WhyUs />
      <Process />
      <CTA />
    </main>
  );
}
