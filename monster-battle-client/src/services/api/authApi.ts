import apiClient, { setTokens, clearTokens } from './client';
import type { Player } from '../../types';

interface AuthResponse {
  user: Player;
  accessToken: string;
  refreshToken: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },
};

export default authApi;
