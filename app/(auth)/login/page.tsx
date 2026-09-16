'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/validators/auth';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const usernameVal = watch('username');

  const onSubmit = (data: LoginInput) => {
    setError(null);
    startTransition(async () => {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password. Please try again.');
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === 'student') router.push('/student');
      else if (role === 'parent') router.push('/parent');
      else if (role === 'teacher') router.push('/teacher');
      else if (['super_admin', 'branch_admin', 'accountant', 'content_manager'].includes(role)) {
        router.push('/admin');
      } else {
        router.push(callbackUrl);
      }
      router.refresh();
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-dark mb-1">Welcome back</h2>
      <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username / Phone / Email / Student ID
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            placeholder="Enter username, registered phone, or email"
            {...register('username')}
          />
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition pr-10"
              placeholder="Enter password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={usernameVal?.trim() ? `/forgot-password?identifier=${encodeURIComponent(usernameVal.trim())}` : '/forgot-password'}
            className="text-sm text-primary hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark">Nizami Islamic Center</h1>
          <p className="text-gray-500 text-sm mt-1">& Nizami Education</p>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl shadow-xl p-8 text-center text-sm text-gray-500">Loading login form...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-400 mt-6">
          For students & parents,{' '}
          <Link href="/admissions/apply" className="text-primary hover:underline">
            apply for admission
          </Link>{' '}
          to receive your login credentials.
        </p>
      </div>
    </div>
  );
}
