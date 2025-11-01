import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '@/constants';
import { ApiResponse, ApiError } from '@/types';

// Extend Axios types
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    metadata?: {
      startTime?: Date;
    };
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime.getTime() - (response.config.metadata?.startTime?.getTime() || 0);
    console.log(`API Request to ${response.config.url} took ${duration}ms`);
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh-token');
        if (refreshToken) {
          const response = await apiClient.post(API_ENDPOINTS.auth.refresh, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken, accessExpireAt, refreshExpireAt } = response.data.data;
          
          // Update all tokens
          localStorage.setItem('auth-token', accessToken);
          localStorage.setItem('refresh-token', newRefreshToken);
          localStorage.setItem('access-expire-at', accessExpireAt.toString());
          localStorage.setItem('refresh-expire-at', refreshExpireAt.toString());
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth-token');
        localStorage.removeItem('refresh-token');
        localStorage.removeItem('access-expire-at');
        localStorage.removeItem('refresh-expire-at');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    const errorData = error.response?.data;
    const errorMessage = (errorData && typeof errorData === 'object' && 'message' in errorData && typeof errorData.message === 'string')
      ? errorData.message
      : ((error as Error).message || ERROR_MESSAGES.UNKNOWN_ERROR);
      
    const apiError: ApiError = {
      message: errorMessage,
      code: error.response?.status?.toString() || 'UNKNOWN',
      details: error.response?.data,
    };
    
    return Promise.reject(apiError);
  }
);

// Generic API methods
class ApiService {
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.request<ApiResponse<T>>(config);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // Upload file
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw error;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export configured axios instance for direct use if needed
export { apiClient };

// Export types for use in other files
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
