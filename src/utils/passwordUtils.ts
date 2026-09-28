import { z } from 'zod';
import { PasswordStrength } from '../types/auth.types';

// Character-class regexes mirroring the backend's ValidatePassword (internal/utils/
// validator.go), which classifies every rune with Go's unicode.IsUpper / IsLower /
// IsNumber / (IsPunct || IsSymbol) — not just the ASCII ranges. The equivalent Unicode
// property escapes: \p{Lu} (uppercase letter), \p{Ll} (lowercase letter), \p{N} (any
// numeric character, not just ASCII digits), and \p{P} or \p{S} (punctuation or symbol).
// The 'u' flag is required for \p{...} escapes to work.
export const UPPERCASE_REGEX = /\p{Lu}/u;
export const LOWERCASE_REGEX = /\p{Ll}/u;
export const NUMBER_REGEX = /\p{N}/u;
export const SPECIAL_CHAR_REGEX = /[\p{P}\p{S}]/u;

export const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_RULE_MESSAGES = {
  minLength: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  uppercase: 'Password must contain at least one uppercase letter',
  lowercase: 'Password must contain at least one lowercase letter',
  number: 'Password must contain at least one number',
  special: 'Password must contain at least one special character',
} as const;

// Single source of truth for the password rule. RegisterForm's Zod schema uses this
// directly; validatePassword below (used by the strength indicator's callers and any
// non-form caller) delegates to it too, so there is exactly one place the rule is defined.
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_RULE_MESSAGES.minLength)
  .regex(UPPERCASE_REGEX, PASSWORD_RULE_MESSAGES.uppercase)
  .regex(LOWERCASE_REGEX, PASSWORD_RULE_MESSAGES.lowercase)
  .regex(NUMBER_REGEX, PASSWORD_RULE_MESSAGES.number)
  .regex(SPECIAL_CHAR_REGEX, PASSWORD_RULE_MESSAGES.special);

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (LOWERCASE_REGEX.test(password) && UPPERCASE_REGEX.test(password)) strength++;
  if (NUMBER_REGEX.test(password)) strength++;
  if (SPECIAL_CHAR_REGEX.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Mirrors the backend's ValidatePassword (internal/utils/validator.go) via passwordSchema
// above: at least 8 characters, plus an uppercase letter, a lowercase letter, a number,
// and a special character.
export const validatePassword = (password: string): string | null => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return result.error.issues[0]?.message ?? 'Invalid password';
  }
  return null;
};

// The backend's ErrPasswordTooWeak (internal/utils/validator.go) reaches the UI verbatim
// via getErrorMessage/authApi; translate it to a message consistent with the per-field
// Zod errors shown for the same rule.
const BACKEND_WEAK_PASSWORD_MESSAGE =
  'password must contain uppercase, lowercase, number, and special character';
const FRIENDLY_WEAK_PASSWORD_MESSAGE =
  'Password must contain uppercase and lowercase letters, a number, and a special character.';

export const mapAuthErrorMessage = (message: string): string => {
  if (message.trim().toLowerCase() === BACKEND_WEAK_PASSWORD_MESSAGE) {
    return FRIENDLY_WEAK_PASSWORD_MESSAGE;
  }
  return message;
};

// Simple hash function for demo purposes (NOT for production)
export const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};
