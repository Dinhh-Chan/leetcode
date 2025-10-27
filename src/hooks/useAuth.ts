import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import { User, LoginForm, RegisterForm } from '@/types';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current user query
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authService.getProfile,
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginForm) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Đăng nhập thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đăng nhập thất bại');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterForm) => authService.register(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user);
      toast.success('Đăng ký thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đăng ký thất bại');
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData: Partial<User>) => authService.updateProfile(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
      toast.success('Cập nhật thông tin thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cập nhật thất bại');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đổi mật khẩu thất bại');
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
            } catch (error) {
              // Refresh failed, logout user
              await authService.logout();
              queryClient.clear();
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
    async (credentials: LoginForm) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterForm) => {
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // Update profile function
  const updateProfile = useCallback(
    async (userData: Partial<User>) => {
      return updateProfileMutation.mutateAsync(userData);
    },
    [updateProfileMutation]
  );

  // Change password function
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      return changePasswordMutation.mutateAsync({ currentPassword, newPassword });
    },
    [changePasswordMutation]
  );

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser || !isInitialized,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
  };
};
