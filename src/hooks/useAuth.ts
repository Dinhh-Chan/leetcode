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

  // Get current user query - enable based on token presence
  const [isAuth, setIsAuth] = useState(() => authService.isAuthenticated());
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

  // If query fails with 401, token is invalid - update isAuth
  useEffect(() => {
    if (userError && (userError as any)?.response?.status === 401) {
      setIsAuth(false);
    }
  }, [userError]);

  // Update isAuth when localStorage changes (for login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuth(authService.isAuthenticated());
    };
    
    // Listen for storage events (when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount and periodically for same-tab changes
    handleStorageChange();
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      // Update auth state immediately to enable the query
      setIsAuth(true);
      // Set user data in cache immediately so isAuthenticated becomes true right away
      queryClient.setQueryData(['auth', 'user'], data.user);
      // Invalidate and refetch to ensure fresh data
      try {
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        // Refetch will happen automatically since query is now enabled
        await refetchUser();
      } catch (error) {
        // If refetch fails, the cached data should still work
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
      setIsAuth(false);
      queryClient.clear();
      queryClient.removeQueries();
      toast.success('Đăng xuất thành công!');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Still clear the cache even if logout API fails
      setIsAuth(false);
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
              setIsAuth(true);
              // Thông báo refresh token thành công
              toast.success('Phiên đăng nhập đã được gia hạn tự động');
            } catch (error: any) {
              // Refresh failed, logout user
              console.error('Token refresh failed:', error);
              setIsAuth(false);
              await authService.logout();
              queryClient.clear();
              toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
            }
          } else {
            // Token is still valid, ensure isAuth is true
            setIsAuth(true);
          }
        } else {
          // No valid token, ensure isAuth is false
          setIsAuth(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuth(false);
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

  // isAuthenticated should be true if:
  // 1. We have a token (isAuth) AND (user is loaded OR still loading)
  // 2. OR user is already loaded (from cache)
  // Only false if: no token AND no user, OR token exists but query failed and no user
  const isAuthenticated = (isAuth && (!!user || isLoadingUser)) || !!user;

  return {
    // State
    user,
    isAuthenticated,
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
