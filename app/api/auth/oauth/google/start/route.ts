import { NextRequest, NextResponse } from "next/server";

import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/security";
import { hasDatabaseUrl } from "@/lib/db";
import {
  buildAuthorizationUrl,
  getRedirectUri,
  isGoogleConfigured,
} from "@/lib/auth/oauth/google";
import {
  OAUTH_STATE_COOKIE,
  createFlowState,
  deriveCodeChallenge,
  encodeFlowState,
  getStateCookieOptions,
} from "@/lib/auth/oauth/flow";

function loginError(request: NextRequest, code: string) {
  return NextResponse.redirect(new URL(`/login?error=${code}`, request.nextUrl.origin));
}

export async function GET(request: NextRequest) {
  if (!isGoogleConfigured() || !hasDatabaseUrl()) {
    return loginError(request, "google_unavailable");
  }

  const ip = getClientIp(request);
  if (!(await enforceRateLimit(`oauth-start:${ip}`, 10, 5 * 60_000))) {
    return loginError(request, "rate_limited");
  }

  const flow = createFlowState();
  const authorizationUrl = buildAuthorizationUrl({
    redirectUri: getRedirectUri(request),
    state: flow.state,
    codeChallenge: deriveCodeChallenge(flow.codeVerifier),
  });

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, encodeFlowState(flow), getStateCookieOptions());
  return response;
}
