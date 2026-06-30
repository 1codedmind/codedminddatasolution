"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ResumeBuilderSpotlight from "@/sections/ResumeBuilderSpotlight";

gsap.registerPlugin(ScrollTrigger);

export default function Enhanced3DResumeSpotlight() {
  useEffect(() => {
    // Add 3D perspective and parallax effect
    const section = document.querySelector('[data-section="resume-spotlight"]');
    if (!section) return;

    // Parallax animation for left text
    gsap.to('[data-parallax="text"]', {
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "bottom center",
        scrub: 1,
        markers: false,
      },
      y: -50,
      opacity: 1,
      duration: 1,
    });

    // 3D rotation for right mockup
    gsap.to('[data-parallax="mockup"]', {
      scrollTrigger: {
        trigger: section,
        start: "top center",
        end: "bottom center",
        scrub: 1,
      },
      rotationY: 5,
      rotationX: -2,
      y: 30,
      opacity: 1,
      duration: 1,
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div data-section="resume-spotlight">
      <style>{`
        [data-parallax="mockup"] {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
      <ResumeBuilderSpotlight />
    </div>
  );
}
