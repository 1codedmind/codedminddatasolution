import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/auth/config";
import { safeEqualString, signValue } from "@/lib/auth/crypto";

export type SessionPayload = {
  sub: string;
  email: string;
  role: "candidate";
  exp: number;
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

    if (payload.role !== "candidate") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
