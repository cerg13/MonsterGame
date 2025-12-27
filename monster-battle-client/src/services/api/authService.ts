/**
 * Auth Service
 * Handles authentication API calls
 */

import { apiClient } from './apiClient';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface SignupResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return { success: true };
  },

  /**
   * Sign up new account
   */
  async signup(username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post<SignupResponse>('/auth/signup', { username, email, password });

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }

    return { success: true };
  },

  /**
   * Logout
   */
  logout(): void {
    apiClient.setToken(null);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  /**
   * Refresh token
   */
  async refreshToken(): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');

    if (response.data?.token) {
      apiClient.setToken(response.data.token);
      return { success: true };
    }

    return { success: false };
  },
};
