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
  // (e.g. the resume builder's sidebar/preview panels). Only run it on pages
  // designed as a single full-page scroll experience.
  const SMOOTH_SCROLL_ROUTES = ["/", "/services", "/it-services"];
  const enabled = SMOOTH_SCROLL_ROUTES.includes(pathname);

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
