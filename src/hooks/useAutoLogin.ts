import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { mockUser } from '@/data/mockData';

export const useAutoLogin = () => {
  const { user, isAuthenticated, login, isLoading } = useAuth();

  useEffect(() => {
    // Auto login with mock user in development
    if (import.meta.env.DEV && !isAuthenticated && !isLoading) {
      const autoLogin = async () => {
        try {
          await login({
            email: 'demo@leetcode.com',
            password: 'password',
          });
        } catch (error) {
          console.error('Auto login failed:', error);
        }
      };

      autoLogin();
    }
  }, [isAuthenticated, isLoading, login]);

  return {
    user: user || mockUser,
    isAuthenticated: true, // Always authenticated in development
    isLoading,
  };
};
