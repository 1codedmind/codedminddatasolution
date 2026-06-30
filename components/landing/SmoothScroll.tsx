"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  // Lenis hijacks document scroll, which breaks internal scroll containers
  // (e.g. the resume builder's sidebar/preview panels). Only run it on the
  // landing page, which is designed as a single full-page scroll experience.
  const enabled = pathname === "/";

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    } as any);

    let frameId: number;

    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [enabled]);

  return <>{children}</>;
}
