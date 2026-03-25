import { NextRequest } from "next/server";

const TRUSTED_HOSTS = new Set(["localhost:3000", "127.0.0.1:3000"]);

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
    return originHost === host || TRUSTED_HOSTS.has(originHost);
  } catch {
    return false;
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
