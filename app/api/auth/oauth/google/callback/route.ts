import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth/config";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { hasDatabaseUrl } from "@/lib/db";
import {
  exchangeCodeForToken,
  fetchGoogleProfile,
  getRedirectUri,
  isGoogleConfigured,
} from "@/lib/auth/oauth/google";
import {
  OAUTH_STATE_COOKIE,
  getClearedStateCookieOptions,
  readFlowState,
  statesMatch,
} from "@/lib/auth/oauth/flow";
import { findOrCreateUserForGoogle } from "@/lib/auth/oauth/identities";

/**
 * Google redirects the browser here after the consent screen.
 *
 * Note this route deliberately does not call isTrustedOrigin(): a redirect back
 * from Google is a top-level GET with no Origin header. CSRF protection for
 * this flow comes from the `state` parameter instead.
 */

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.nextUrl.origin));
  // The flow is over either way — don't leave the state cookie lying around.
  response.cookies.set(OAUTH_STATE_COOKIE, "", getClearedStateCookieOptions());
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // The user pressed "Cancel" on Google's consent screen, or Google refused.
  const providerError = params.get("error");
  if (providerError) {
    const code = providerError === "access_denied" ? "cancelled" : "google_failed";
    return redirectTo(request, `/login?error=${code}`);
  }

  if (!isGoogleConfigured() || !hasDatabaseUrl()) {
    return redirectTo(request, "/login?error=google_unavailable");
  }

  const ip = getClientIp(request);
  if (!enforceRateLimit(`oauth-callback:${ip}`, 20, 5 * 60_000)) {
    return redirectTo(request, "/login?error=rate_limited");
  }

  const flow = readFlowState(request);
  if (!flow) {
    // Cookie expired, was cleared, or the callback was opened directly.
    return redirectTo(request, "/login?error=expired");
  }

  if (!statesMatch(flow.state, params.get("state"))) {
    return redirectTo(request, "/login?error=invalid_state");
  }

  const code = params.get("code");
  if (!code) {
    return redirectTo(request, "/login?error=google_failed");
  }

  const accessToken = await exchangeCodeForToken({
    code,
    redirectUri: getRedirectUri(request),
    codeVerifier: flow.codeVerifier,
  });
  if (!accessToken) {
    return redirectTo(request, "/login?error=google_failed");
  }

  const profile = await fetchGoogleProfile(accessToken);
  if (!profile) {
    return redirectTo(request, "/login?error=google_failed");
  }

  let result;
  try {
    result = await findOrCreateUserForGoogle(profile);
  } catch (err) {
    console.error("[oauth/google] account linking failed:", err);
    return redirectTo(request, "/login?error=google_failed");
  }

  if (!result.ok) {
    return redirectTo(request, `/login?error=${result.reason}`);
  }

  const token = createSessionToken(result.session);

  // Same destinations the password login uses, so both paths land alike.
  const hrmsRoles = ["superadmin", "admin", "employee"];
  const destination = hrmsRoles.includes(result.session.role) ? "/hrms/dashboard" : "/candidate";

  const response = redirectTo(request, destination);
  response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
  return response;
}
