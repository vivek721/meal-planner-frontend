import { describe, it, expect } from 'vitest';
import { calculatePasswordStrength, validatePassword, mapAuthErrorMessage } from './passwordUtils';

describe('validatePassword', () => {
  it('rejects passwords under 8 characters', () => {
    expect(validatePassword('Ab1!')).toBe('Password must be at least 8 characters');
  });

  it('requires an uppercase letter', () => {
    expect(validatePassword('lowercase1!')).toBe('Password must contain at least one uppercase letter');
  });

  it('requires a lowercase letter', () => {
    expect(validatePassword('UPPERCASE1!')).toBe('Password must contain at least one lowercase letter');
  });

  it('requires a number', () => {
    expect(validatePassword('NoNumbers!')).toBe('Password must contain at least one number');
  });

  it('requires a special character', () => {
    expect(validatePassword('NoSpecial123')).toBe('Password must contain at least one special character');
  });

  it('accepts a password meeting every backend rule (length, upper, lower, number, special)', () => {
    expect(validatePassword('Test123!@#')).toBeNull();
  });

  it('does not accept whitespace as a special character', () => {
    expect(validatePassword('Password 1')).toBe('Password must contain at least one special character');
  });
});

describe('calculatePasswordStrength', () => {
  it('rates a short password with no rules met as weak', () => {
    expect(calculatePasswordStrength('weak')).toBe('weak');
  });

  it('rates a password that meets every rule but is under 12 chars as medium', () => {
    expect(calculatePasswordStrength('Test123!@#')).toBe('medium');
  });

  it('rates a 12+ char password meeting every rule as strong', () => {
    expect(calculatePasswordStrength('Test123!@#abc')).toBe('strong');
  });
});

describe('mapAuthErrorMessage', () => {
  it('maps the backend weak-password error to a friendly message', () => {
    expect(mapAuthErrorMessage('password must contain uppercase, lowercase, number, and special character')).toBe(
      'Password must contain uppercase and lowercase letters, a number, and a special character.'
    );
  });

  it('leaves other messages unchanged', () => {
    expect(mapAuthErrorMessage('Email already exists')).toBe('Email already exists');
  });
});
