import { createHash, randomBytes } from "crypto";
import { NextRequest } from "next/server";

import { safeEqualString } from "@/lib/auth/crypto";

/**
 * CSRF (`state`) and PKCE (`code_verifier`) for the OAuth authorization code
 * flow. Both are minted before redirecting to the provider, parked in a
 * short-lived httpOnly cookie, and checked when the provider redirects back.
 *
 *   state         — stops an attacker completing a login the user never started
 *   code_verifier — stops an intercepted authorization code being redeemed
 */

export const OAUTH_STATE_COOKIE = "cm_oauth_state";
const STATE_TTL_SECONDS = 600; // 10 minutes is plenty to finish a consent screen

export type OAuthFlowState = {
  state: string;
  codeVerifier: string;
};

function base64url(buffer: Buffer) {
  return buffer.toString("base64url");
}

export function createFlowState(): OAuthFlowState {
  return {
    state: base64url(randomBytes(32)),
    codeVerifier: base64url(randomBytes(64)),
  };
}

/** S256 challenge derived from the verifier — the only form Google accepts here. */
export function deriveCodeChallenge(codeVerifier: string) {
  return base64url(createHash("sha256").update(codeVerifier).digest());
}

export function getStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/oauth",
    maxAge: STATE_TTL_SECONDS,
  };
}

/** Options that clear the cookie — same attributes, zero lifetime. */
export function getClearedStateCookieOptions() {
  return { ...getStateCookieOptions(), maxAge: 0 };
}

export function encodeFlowState(flow: OAuthFlowState) {
  return base64url(Buffer.from(JSON.stringify(flow)));
}

export function readFlowState(request: NextRequest): OAuthFlowState | null {
  const raw = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as OAuthFlowState;
    if (typeof parsed.state !== "string" || typeof parsed.codeVerifier !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Constant-time comparison of the returned state against the stored one. */
export function statesMatch(stored: string, returned: string | null) {
  if (!returned) return false;
  return safeEqualString(stored, returned);
}
