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

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
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
