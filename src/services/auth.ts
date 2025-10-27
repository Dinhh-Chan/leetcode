import { apiService } from './api';
import { mockApiService } from './mockApi';
import { API_ENDPOINTS } from '@/constants';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';

// Use mock API in development
const isDevelopment = import.meta.env.DEV;
const api = isDevelopment ? mockApiService : apiService;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  // Login user
  async login(credentials: LoginForm): Promise<LoginResponse> {
    const response = isDevelopment 
      ? await mockApiService.login(credentials)
      : await apiService.post<LoginResponse>(API_ENDPOINTS.auth.login, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('auth-token', response.tokens.accessToken);
    localStorage.setItem('refresh-token', response.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  // Register user
  async register(userData: RegisterForm): Promise<LoginResponse> {
    const response = isDevelopment 
      ? await mockApiService.register(userData)
      : await apiService.post<LoginResponse>(API_ENDPOINTS.auth.register, userData);
    
    // Store tokens in localStorage
    localStorage.setItem('auth-token', response.tokens.accessToken);
    localStorage.setItem('refresh-token', response.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and user data
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    return isDevelopment 
      ? await mockApiService.getProfile()
      : await apiService.get<User>(API_ENDPOINTS.auth.profile);
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>(
      API_ENDPOINTS.auth.profile,
      userData
    );
    
    // Update stored user data
    localStorage.setItem('user', JSON.stringify(response));
    
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    await apiService.post('/auth/resend-verification');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthTokens>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );

    // Update stored tokens
    localStorage.setItem('auth-token', response.accessToken);
    localStorage.setItem('refresh-token', response.refreshToken);

    return response;
  }
}

// Create singleton instance
export const authService = new AuthService();
