import { PASSWORD_LIMITS } from "@/lib/auth/config";

export function validateFullName(value: string) {
  const fullName = value.trim().replace(/\s+/g, " ");

  if (fullName.length < 2 || fullName.length > 80) {
    return null;
  }

  return fullName;
}

export function validateEmail(value: string) {
  const email = value.trim().toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  return isValid ? email : null;
}

export function validatePassword(value: string) {
  const password = value.trim();
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isStrong =
    password.length >= PASSWORD_LIMITS.min &&
    password.length <= PASSWORD_LIMITS.max &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial;

  return isStrong ? password : null;
}
