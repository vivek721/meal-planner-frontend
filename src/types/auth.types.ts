export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
}

export interface LoginAttempts {
  count: number;
  lastAttempt: string;
  lockedUntil?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  // True only while the app is checking a stored session on first mount; route guards in
  // App.tsx gate on this. Distinct from `loading` below, which is per-action.
  initializing: boolean;
  // True while a login/register/logout call is in flight; drives button spinners.
  // Route guards must NOT gate on this: a failed login/register would otherwise unmount
  // the form (via PublicRoute) while `loading` is true and lose the just-set error message.
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
