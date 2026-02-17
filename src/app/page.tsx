'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await login(data);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand / Visual */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-600 to-mint-500">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Large circle */}
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/5 blur-sm" />
          <div className="absolute top-1/3 -left-16 w-[350px] h-[350px] rounded-full bg-mint-500/10 blur-md" />
          <div className="absolute bottom-10 right-1/4 w-[200px] h-[200px] rounded-full bg-white/5 blur-sm" />

          {/* Abstract shapes */}
          <div className="absolute top-1/4 right-1/3 w-32 h-32 border border-white/10 rounded-3xl rotate-12" />
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-white/10 rounded-2xl -rotate-12" />

          {/* Gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-heading text-xl font-bold tracking-tight">HealthPilot</span>
              <span className="text-mint-200 text-xs ml-2 font-medium uppercase tracking-widest">Admin</span>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-heading font-bold text-white leading-tight mb-6">
              Manage your health platform with confidence
            </h1>
            <p className="text-lg text-teal-100/80 leading-relaxed">
              Access powerful tools to manage users, providers, treatment pathways,
              and analytics — all from one centralized dashboard.
            </p>

            {/* Feature highlights */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: 'User Management', value: '10K+' },
                { label: 'Active Providers', value: '250+' },
                { label: 'Treatment Plans', value: '50+' },
                { label: 'Match Rate', value: '94%' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                >
                  <div className="text-2xl font-bold text-white font-heading">
                    {stat.value}
                  </div>
                  <div className="text-sm text-teal-100/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="text-sm text-teal-100/50">
            © 2025 HealthPilot. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[420px] animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-foreground font-heading text-xl font-bold tracking-tight">HealthPilot</span>
              <span className="text-primary text-xs ml-2 font-medium uppercase tracking-widest">Admin</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive animate-slide-in-bottom">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@healthpilot.com"
                autoComplete="email"
                className="h-12 rounded-xl border-input bg-background px-4 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-input bg-background px-4 pr-12 text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border/60">
            <p className="text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">Backend Admin:</span>
                <code className="px-1.5 py-0.5 rounded bg-background text-[11px]">admin@healthpilot.com</code>
                /
                <code className="px-1.5 py-0.5 rounded bg-background text-[11px]">Admin123!</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground/70">UI Demo:</span>
                <code className="px-1.5 py-0.5 rounded bg-background text-[11px]">demo@healthpilot.com</code>
                /
                <code className="px-1.5 py-0.5 rounded bg-background text-[11px]">demo123</code>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Protected by HealthPilot Security • HIPAA Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
