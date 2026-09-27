import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { Input } from '../atoms/Input';
import { Checkbox } from '../atoms/Checkbox';
import { Button } from '../atoms/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage('');
      await login(data.email, data.password, data.rememberMe);
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(message);
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality is coming in a future release!');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-800">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              {errorMessage.includes('locked') && (
                <p className="text-sm mt-1">For security, your account has been temporarily locked.</p>
              )}
            </div>
          </div>
        )}

        {/* noValidate: the Zod schema above does the validation and shows its own
            messages; native checks on type="email"/required would pre-empt them */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Input
              {...register('email')}
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              required
              fullWidth
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                error={errors.password?.message}
                fullWidth
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox {...register('rememberMe')} label="Remember me" />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" loading={loading} fullWidth size="lg">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
