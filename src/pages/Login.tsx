import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoginForm } from '@/types';
import Header from '@/components/Header';

const loginSchema = z.object({
  username: z.string().min(3, 'Tên người dùng phải có ít nhất 3 ký tự'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggingIn, loginError, isAuthenticated, isLoading } = useAuthContext();
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ username: string; password: string }>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect when authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  const onSubmit = async (data: { username: string; password: string }) => {
    try {
      await login(data);
      // Navigation will be handled by useEffect when isAuthenticated becomes true
      // The login mutation will update the auth state, triggering the useEffect
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập email và mật khẩu để đăng nhập vào tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {loginError.message || 'Đăng nhập thất bại'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên người dùng"
                    {...register('username')}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    {...register('password')}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
