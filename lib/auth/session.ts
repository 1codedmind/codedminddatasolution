import { cache } from "react";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/config";
import { safeEqualString, signValue } from "@/lib/auth/crypto";
import { getSessionVersion } from "@/lib/auth/sessionVersion";

export type UserRole = "candidate" | "superadmin" | "admin" | "employee";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  /**
   * Account session version at the time this token was issued. Tokens issued
   * before this field existed carry no value and are treated as 0, which is
   * also the column default — so the migration signs nobody out.
   */
  ver?: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const body: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  if (!safeEqualString(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const validRoles: UserRole[] = ["candidate", "superadmin", "admin", "employee"];
    if (!validRoles.includes(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Read and fully validate the current session.
 *
 * Beyond the signature and expiry check, this confirms the token's session
 * version still matches the account, so a password reset immediately
 * invalidates sessions that were issued earlier.
 *
 * Wrapped in React `cache` so the extra lookup runs at most once per request
 * no matter how many layouts and components ask for the session.
 *
 * If the version lookup fails (database unreachable) the token is accepted on
 * its signature alone. That keeps the site usable during an outage rather than
 * signing everyone out; the pages that matter fail on their own queries anyway.
 */
export const getCurrentSession = cache(async () => {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!payload) return null;

  try {
    const kind = payload.role === "candidate" ? "candidate" : "team";
    const currentVersion = await getSessionVersion(kind, payload.sub);
    if ((payload.ver ?? 0) !== currentVersion) {
      return null;
    }
  } catch (err) {
    console.error("[session] version check failed, accepting signature only:", err);
  }

  return payload;
});

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
