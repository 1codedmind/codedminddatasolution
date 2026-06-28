import { track } from "@vercel/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
) {
  try {
    track(name, props);
  } catch {
    // Vercel Analytics may not be available in all environments
  }
  try {
    if (typeof window !== "undefined") {
      window.gtag?.("event", name, props);
    }
  } catch {
    // GA4 may not be loaded yet (pre-consent)
  }
}

export function trackToolUsed(tool: string) {
  trackEvent("tool_used", { tool });
}

export function trackContactSubmitted() {
  trackEvent("contact_submitted");
}
