import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationConfig {
  target: string;
  animation: {
    [key: string]: number | string;
  };
  trigger?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
}

export function useGSAPScroll(config: ScrollAnimationConfig) {
  useEffect(() => {
    const target = document.querySelector(config.target);
    if (!target) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: config.trigger || config.target,
        start: config.start || "top center",
        end: config.end || "bottom center",
        scrub: config.scrub ?? 1,
        markers: config.markers ?? false,
      },
    });

    tl.to(config.target, {
      duration: 1,
      ...config.animation,
    });

    return () => {
      tl.kill();
    };
  }, [config]);
}

// Batch animations for multiple elements
export function useGSAPStagger(
  selector: string,
  animation: { [key: string]: number | string },
  staggerDelay = 0.1
) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    gsap.to(selector, {
      duration: 0.8,
      ...animation,
      stagger: staggerDelay,
      scrollTrigger: {
        trigger: selector,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      gsap.killTweensOf(selector);
    };
  }, [selector, animation, staggerDelay]);
}
