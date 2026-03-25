export const AUTH_COOKIE_NAME = "codedmind_candidate_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const PASSWORD_LIMITS = {
  min: 12,
  max: 72,
} as const;

export const RATE_LIMITS = {
  signup: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  login: { maxAttempts: 8, windowMs: 15 * 60 * 1000 },
  logout: { maxAttempts: 20, windowMs: 15 * 60 * 1000 },
} as const;
