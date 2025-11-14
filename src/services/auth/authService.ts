import { apiService } from '../api';
import { API_ENDPOINTS } from '@/constants';
import { 
  LoginRequest, 
  LoginResponse, 
  AuthTokens, 
  User, 
  UserMeResponse,
  AuthServiceResponse 
} from '../types/auth';
import axios from 'axios';
import { API_CONFIG } from '@/constants';

class AuthService {
  // Login user
  async login(credentials: { username: string; password: string }): Promise<AuthServiceResponse> {
    const loginRequest: LoginRequest = {
      platform: "Mobile",
      username: credentials.username,
      password: credentials.password,
    };
    const response = await axios.post<LoginResponse>(
      `${API_CONFIG.baseURL}${API_ENDPOINTS.auth.login}`,
      loginRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Store tokens in localStorage
    localStorage.setItem('auth-token', response.data.data.accessToken);
    localStorage.setItem('refresh-token', response.data.data.refreshToken);
    localStorage.setItem('access-expire-at', response.data.data.accessExpireAt.toString());
    localStorage.setItem('refresh-expire-at', response.data.data.refreshExpireAt.toString());
    
    // Get user profile after login
    const user = await this.getProfile();
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      user,
      tokens: response.data.data,
    };
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens and user data
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('access-expire-at');
      localStorage.removeItem('refresh-expire-at');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await axios.get<UserMeResponse>(
      `${API_CONFIG.baseURL}/user/me`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
      }
    );
    return response.data.data;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-token');
    const expireAt = localStorage.getItem('access-expire-at');
    
    if (!token || !expireAt) return false;
    
    // Check if token is expired
    const now = Date.now();
    const expireTime = parseInt(expireAt);
    
    return now < expireTime;
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
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
    const expireAt = localStorage.getItem('access-expire-at');
    
    if (!token || !expireAt) return true;

    const now = Date.now();
    const expireTime = parseInt(expireAt);
    
    return now >= expireTime;
  }

  // Refresh access token
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Check if refresh token is expired
    const refreshExpireAt = localStorage.getItem('refresh-expire-at');
    if (refreshExpireAt) {
      const now = Date.now();
      const expireTime = parseInt(refreshExpireAt);
      if (now >= expireTime) {
        throw new Error('Refresh token expired');
      }
    }

    // Use apiService which unwraps response.data.data
    const tokens = await apiService.post<AuthTokens>(
      API_ENDPOINTS.auth.refresh,
      { refreshToken }
    );

    // Update stored tokens
    localStorage.setItem('auth-token', tokens.accessToken);
    localStorage.setItem('refresh-token', tokens.refreshToken);
    localStorage.setItem('access-expire-at', tokens.accessExpireAt.toString());
    localStorage.setItem('refresh-expire-at', tokens.refreshExpireAt.toString());

    return tokens;
  }
}

// Create singleton instance
export const authService = new AuthService();
