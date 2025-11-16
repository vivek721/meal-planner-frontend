import { User } from '../types/auth.types';
import authApi, { AuthResponse } from './api/authApi';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'meal_planner_auth_token',
  CURRENT_USER: 'meal_planner_current_user',
};

class AuthService {
  /**
   * Register a new user
   */
  async register(email: string, password: string, name?: string): Promise<User> {
    try {
      const response: AuthResponse = await authApi.register({ email, password, name });

      // Store token and user data
      this.setToken(response.token);
      this.setCurrentUser(response.user);

      return response.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    try {
      const response: AuthResponse = await authApi.login({ email, password });

      // Store token and user data
      this.setToken(response.token);
      this.setCurrentUser(response.user);

      // TODO: Implement remember me functionality if needed
      // Could use a longer-lived refresh token or session storage

      return response.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await authApi.logout();
    } catch (error) {
      // Log error but still clear local data
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  /**
   * Check if user is authenticated
   */
  checkAuth(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Get current user from localStorage
   */
  getUser(): User | null {
    return this.getCurrentUser();
  }

  /**
   * Refresh current user data from backend
   */
  async refreshUser(): Promise<User | null> {
    try {
      const response = await authApi.getMe();
      this.setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      // If refresh fails (e.g., invalid token), clear auth
      this.clearAuth();
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(name?: string, email?: string): Promise<User> {
    try {
      const response = await authApi.updateProfile({ name, email });
      this.setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(theme?: 'light' | 'dark', notifications?: boolean): Promise<User> {
    try {
      const response = await authApi.updatePreferences({ theme, notifications });
      this.setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<User> {
    try {
      const response = await authApi.completeOnboarding();
      this.setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user in local storage
   * (For internal use - prefer using API methods that update both backend and local storage)
   */
  updateUser(user: User): void {
    this.setCurrentUser(user);
  }

  // Private helper methods
  private getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  private getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setCurrentUser(user: any): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export default new AuthService();
