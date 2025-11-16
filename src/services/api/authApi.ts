import apiClient, { getErrorMessage } from './apiClient';
import { User, UserPreferences } from '../../types/auth.types';

// API Response Types (matching backend)
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    hasCompletedOnboarding: boolean;
    createdAt: string;
    preferences?: UserPreferences;
  };
  token: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface MessageResponse {
  message: string;
}

// API Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark';
  notifications?: boolean;
}

// Authentication API service
class AuthApi {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Refresh JWT token
   * POST /api/auth/refresh
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  async getMe(): Promise<{ user: User }> {
    try {
      const response = await apiClient.get<{ user: User }>('/api/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  async logout(): Promise<MessageResponse> {
    try {
      const response = await apiClient.post<MessageResponse>('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<{ user: User }> {
    try {
      const response = await apiClient.put<{ user: User }>('/api/auth/profile', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Change password
   * PUT /api/auth/password
   */
  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    try {
      const response = await apiClient.put<MessageResponse>('/api/auth/password', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Update user preferences
   * PUT /api/auth/preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<{ user: User }> {
    try {
      const response = await apiClient.put<{ user: User }>('/api/auth/preferences', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Complete onboarding
   * POST /api/auth/onboarding/complete
   */
  async completeOnboarding(): Promise<{ user: User }> {
    try {
      const response = await apiClient.post<{ user: User }>('/api/auth/onboarding/complete');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

export default new AuthApi();
