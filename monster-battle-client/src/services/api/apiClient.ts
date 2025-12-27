/**
 * API Client
 * Base HTTP client for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private token: string | null = null;

  /**
   * Set authentication token
   */
  public setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get stored token
   */
  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Build headers for request
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make GET request
   */
  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', status: response.status };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API GET error:', error);
      return { error: 'Network error', status: 0 };
    }
  }

  /**
   * Make POST request
   */
  public async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', status: response.status };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API POST error:', error);
      return { error: 'Network error', status: 0 };
    }
  }

  /**
   * Make PUT request
   */
  public async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', status: response.status };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API PUT error:', error);
      return { error: 'Network error', status: 0 };
    }
  }

  /**
   * Make DELETE request
   */
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed', status: response.status };
      }

      return { data, status: response.status };
    } catch (error) {
      console.error('API DELETE error:', error);
      return { error: 'Network error', status: 0 };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
