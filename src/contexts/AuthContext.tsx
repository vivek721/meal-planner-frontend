import React, { useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import AuthService from '../services/AuthService';
import { AuthContext } from './useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (AuthService.checkAuth()) {
        // Try to refresh user data from backend
        const currentUser = await AuthService.refreshUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for unauthorized events from API client
    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    try {
      const user = await AuthService.login(email, password, rememberMe);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true);
    try {
      const user = await AuthService.register(email, password, name);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      // Even if logout fails on backend, clear local state
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
