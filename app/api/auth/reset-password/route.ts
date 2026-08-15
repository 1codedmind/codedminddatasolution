import { NextRequest, NextResponse } from "next/server";

import { PASSWORD_LIMITS } from "@/lib/auth/config";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp, isTrustedOrigin } from "@/lib/auth/security";
import { validatePassword } from "@/lib/auth/validation";
import { consumeResetToken, updateUserPassword, verifyResetToken } from "@/lib/auth/passwordReset";
import { hasDatabaseUrl } from "@/lib/db";
import { bumpSessionVersion } from "@/lib/auth/sessionVersion";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const ip = getClientIp(request);
  if (!(await enforceRateLimit(`reset-pw:${ip}`, 5, 15 * 60_000))) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Reset link is invalid." }, { status: 400 });
  }

  const password = validatePassword(body.password ?? "");
  if (!password) {
    return NextResponse.json(
      {
        error: `Password must be ${PASSWORD_LIMITS.min}-${PASSWORD_LIMITS.max} characters and include uppercase, lowercase, number, and special character.`,
      },
      { status: 400 },
    );
  }

  const valid = await verifyResetToken(token);
  if (!valid) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 },
    );
  }

  await updateUserPassword(valid.kind, valid.email, password);
  await consumeResetToken(token);

  // Revoke every session issued before this reset. Whoever prompted the reset
  // is locked out immediately rather than keeping access until the token
  // would have expired.
  await bumpSessionVersion(valid.kind, valid.email);

  return NextResponse.json({ ok: true, message: "Password updated. You can now log in." });
}
