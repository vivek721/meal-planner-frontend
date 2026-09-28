import { PasswordStrength } from '../types/auth.types';

// Not letter/number/whitespace. Mirrors the backend's unicode.IsPunct || unicode.IsSymbol
// check (internal/utils/validator.go) closely enough for ASCII passwords, and explicitly
// excludes whitespace so a password can't satisfy the rule with a plain space.
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9\s]/;

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (SPECIAL_CHAR_REGEX.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

// Mirrors the backend's ValidatePassword (internal/utils/validator.go): at least 8
// characters, plus an uppercase letter, a lowercase letter, a number, and a special
// character.
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must contain at least one special character';
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
