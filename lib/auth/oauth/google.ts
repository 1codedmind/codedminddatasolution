import { NextRequest } from "next/server";

/**
 * Google OAuth 2.0 (authorization code flow with PKCE).
 *
 * Scopes are deliberately limited to openid/email/profile — all non-sensitive,
 * so the consent screen can be published to production without Google's
 * verification review.
 */

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const GOOGLE_SCOPES = ["openid", "email", "profile"];

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * The redirect URI must match what is registered in the Google Cloud console
 * byte for byte. Prefer the explicitly configured public URL; fall back to the
 * request origin so local development works without extra configuration.
 */
export function getRedirectUri(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const base = configured
    ? configured.replace(/\/$/, "")
    : request.nextUrl.origin;
  return `${base}/api/auth/oauth/google/callback`;
}

export function buildAuthorizationUrl(input: {
  redirectUri: string;
  state: string;
  codeChallenge: string;
}) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", input.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  // Always show the account chooser rather than silently reusing a session.
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

/** Exchange the one-time code for an access token. Back-channel, over TLS. */
export async function exchangeCodeForToken(input: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<string | null> {
  const body = new URLSearchParams({
    code: input.code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: input.redirectUri,
    grant_type: "authorization_code",
    code_verifier: input.codeVerifier,
  });

  let res: Response;
  try {
    res = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    console.error("[oauth/google] token request failed:", err);
    return null;
  }

  const data = (await res.json().catch(() => null)) as TokenResponse | null;

  if (!res.ok || !data?.access_token) {
    console.error("[oauth/google] token exchange rejected:", res.status, data?.error, data?.error_description);
    return null;
  }

  return data.access_token;
}

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

type UserInfoResponse = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

/**
 * Read the profile from Google's OIDC userinfo endpoint.
 *
 * We call userinfo rather than decoding the id_token so that no JWT signature
 * verification is needed — the response comes straight from Google over TLS.
 */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile | null> {
  let res: Response;
  try {
    res = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    console.error("[oauth/google] userinfo request failed:", err);
    return null;
  }

  if (!res.ok) {
    console.error("[oauth/google] userinfo rejected:", res.status);
    return null;
  }

  const data = (await res.json().catch(() => null)) as UserInfoResponse | null;

  if (!data?.sub || !data.email) {
    console.error("[oauth/google] userinfo missing sub or email");
    return null;
  }

  return {
    sub: data.sub,
    email: data.email.trim().toLowerCase(),
    emailVerified: data.email_verified === true,
    name: data.name?.trim() || null,
  };
}
