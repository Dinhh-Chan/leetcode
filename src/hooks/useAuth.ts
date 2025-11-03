import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth/authService';
import { User } from '@/services/types/auth';
import { toast } from 'sonner';

interface LoginCredentials {
  username: string;
  password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user query
  const isAuth = authService.isAuthenticated();
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getProfile,
    enabled: isAuth,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      // Set user data in cache immediately
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Refetch to ensure query is enabled and state is updated
      try {
        await refetchUser();
      } catch (error) {
        // If refetch fails, the cached data should still work
        console.log('Refetch after login:', error);
      }
      toast.success('Đăng nhập thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đăng nhập thất bại');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      queryClient.removeQueries();
      toast.success('Đăng xuất thành công!');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Still clear the cache even if logout API fails
      queryClient.clear();
      queryClient.removeQueries();
    },
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Check if token is expired
          if (authService.isTokenExpired()) {
            try {
              await authService.refreshToken();
              // Thông báo refresh token thành công
              toast.success('Phiên đăng nhập đã được gia hạn tự động');
            } catch (error: any) {
              // Refresh failed, logout user
              console.error('Token refresh failed:', error);
              await authService.logout();
              queryClient.clear();
              toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [queryClient]);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser || !isInitialized,
    isInitialized,
    
    // Actions
    login,
    logout,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
  };
};
