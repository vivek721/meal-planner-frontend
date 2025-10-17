export interface User {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
  preferences?: UserPreferences;
  loginAttempts?: LoginAttempts;
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
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
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
