import { createContext, useContext } from 'react';
import type { AuthContextType } from '../types/auth.types';

// Kept apart from AuthProvider so AuthContext.tsx only exports components
// (required for React Fast Refresh).
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
