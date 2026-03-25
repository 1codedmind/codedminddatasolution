import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET;

function getSecret() {
  if (AUTH_SECRET) {
    return AUTH_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "codedmind-dev-secret-change-me";
  }

  throw new Error("AUTH_SECRET must be set in production.");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, "hex");

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}

export function signValue(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function safeEqualString(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}
