'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import AnimatedInput from '@/components/AnimatedInput';
import { PixelButton } from '@/components/ui/pixel-hover-effect';
import { ButtonSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { colors } from '@/lib/design-tokens';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams?.get('redirectedFrom') || null;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const supabase = createBrowserClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation
      if (!email || !password) {
        showErrorToast('Validation Error', 'Please fill in all fields');
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      showSuccessToast('Welcome back!', 'Successfully signed in');
      
      // Redirect to dashboard or original destination
      window.location.href = redirectedFrom || '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast(
        'Login Failed',
        error instanceof Error ? error.message : 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      showErrorToast('Google Login Failed', error instanceof Error ? error.message : 'An error occurred');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400"
          >
            Sign in to your Sentinel account
          </motion.p>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <AnimatedInput
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <AnimatedInput
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <PixelButton
                type="submit"
                disabled={isLoading || isGoogleLoading}
                color={colors.primary[500]}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <ButtonSpinner />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </PixelButton>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <PixelButton
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              color="#EA4335"
              className="w-full bg-white hover:bg-gray-100 text-gray-900"
            >
              {isGoogleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <ButtonSpinner />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Chrome className="w-5 h-5" />
                  Sign in with Google
                </span>
              )}
            </PixelButton>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
          >
            ← Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
