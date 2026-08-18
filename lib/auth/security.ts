import { NextRequest } from "next/server";

const DEV_HOSTS = new Set(["localhost:3000", "127.0.0.1:3000"]);

function trustedHosts(): Set<string> {
  const hosts = new Set(DEV_HOSTS);

  // Vercel sets this automatically on every deployment
  if (process.env.VERCEL_URL) {
    hosts.add(process.env.VERCEL_URL);
  }

  // Set NEXT_PUBLIC_APP_URL to your custom domain in Vercel env vars
  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      hosts.add(new URL(process.env.NEXT_PUBLIC_APP_URL).host);
    } catch {
      // ignore malformed URL
    }
  }

  return hosts;
}

/**
 * The caller's IP address, resolved so a client cannot choose it.
 *
 * The previous implementation returned the FIRST entry of `x-forwarded-for`.
 * That header is a client-supplied list which proxies append to, so anyone could
 * send `X-Forwarded-For: 1.2.3.4`, have Vercel append their real address after
 * it, and be rate limited under an address of their choosing. Rotating it
 * defeated every per-IP limit in the app — login brute force, chat quotas, lead
 * spam, the lot.
 *
 * Order of preference:
 *   1. `x-vercel-forwarded-for` — set by Vercel's edge, not forwardable by a client.
 *   2. `x-real-ip` — set by the nearest proxy.
 *   3. The LAST entry of `x-forwarded-for` — the hop appended by the closest
 *      trusted proxy. Everything to its left is attacker-controlled.
 */
export function getClientIp(request: NextRequest) {
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) {
    return vercel.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",").map((h) => h.trim()).filter(Boolean);
    return hops[hops.length - 1] || "unknown";
  }

  return "unknown";
}

export function isTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host || trustedHosts().has(originHost);
  } catch {
    return false;
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
