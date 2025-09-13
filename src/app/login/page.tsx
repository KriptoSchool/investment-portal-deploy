'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const { login } = useUser();
  const router = useRouter();

  // Account lockout after 5 failed attempts
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      setLockoutTime(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      setError('Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.');
    }
  }, [attempts]);

  // Check if lockout period has expired
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const interval = setInterval(() => {
        if (Date.now() > lockoutTime) {
          setIsLocked(false);
          setAttempts(0);
          setError('');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account is temporarily locked. Please try again later.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Reset failed attempts on successful login
        setAttempts(0);
        
        // Check if this is a first-time login
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.user_metadata?.first_login) {
          router.push('/change-password');
        } else {
          // Redirect to intended page or dashboard
          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
          router.push(redirectUrl);
        }
      } else {
        // Increment failed attempts
        setAttempts(prev => prev + 1);
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Brand Panel - Hidden on mobile, 40% on desktop */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        {/* Brand content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            {/* Brand messaging */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Aaron M LLP
            </h1>
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Professional investment management platform designed for modern financial advisors and their clients.
            </p>
            
            {/* Features list */}
            <div className="space-y-4">
              <div className="flex items-center text-indigo-100">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-4" />
                <span className="text-sm">Secure client portfolio management</span>
              </div>
              <div className="flex items-center text-indigo-100">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-4" />
                <span className="text-sm">Real-time dividend calculations</span>
              </div>
              <div className="flex items-center text-indigo-100">
                <div className="w-2 h-2 bg-white/60 rounded-full mr-4" />
                <span className="text-sm">Comprehensive reporting suite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Login Panel - Full width on mobile, 60% on desktop */}
      <div className="flex-1 lg:w-3/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-slate-800/20 via-transparent to-transparent" />
        
        {/* Main login card */}
        <div className="relative w-full max-w-[420px] bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl">
          <div className="p-8 sm:p-10">
            {/* Brand logo and header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sign in to your Aaron M LLP account
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                    placeholder="Enter your email"
                    required
                    disabled={isLocked}
                    autoComplete="email"
                    maxLength={254}
                    className="pl-10 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150 disabled:bg-slate-700/30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLocked}
                    autoComplete="current-password"
                    minLength={8}
                    maxLength={128}
                    className="pl-10 pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-150 disabled:bg-slate-700/30 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-150 focus:outline-none focus:text-slate-200 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError('Please enter your email address first.');
                      return;
                    }
                    
                    try {
                      setIsLoading(true);
                      setError('');
                      
                      const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/auth/reset-password`
                      });
                      
                      if (error) {
                        setError(`Password reset failed: ${error.message}`);
                      } else {
                        setError('');
                        alert('Password reset email sent! Please check your inbox and follow the instructions.');
                      }
                    } catch (error) {
                      console.error('Password reset error:', error);
                      setError('Failed to send password reset email. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-150 focus:outline-none focus:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-400 text-sm font-medium">{error}</span>
                  </div>
                  {attempts > 0 && attempts < 5 && (
                    <div className="mt-2 text-red-300 text-xs">
                      Failed attempts: {attempts}/5. Account will be locked after 5 failed attempts.
                    </div>
                  )}
                </div>
              )}

              {/* Sign in button */}
              <Button
                type="submit"
                disabled={isLoading || isLocked || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-150 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : isLocked ? (
                  'Account Locked'
                ) : (
                  <div className="flex items-center justify-center">
                    Sign in Securely
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </div>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* OAuth buttons */}
              <div className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-700/50 hover:text-white transition-all duration-150"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      setError('');
                      
                      // Redirect-based OAuth - no need to handle response here
                      await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`,
                          queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                          },
                        }
                      });
                      
                      // User will be redirected to Google, then back to /auth/callback
                    } catch (error) {
                      console.error('Google OAuth error:', error);
                      setError('Google sign-in failed. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}

                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Google'}
                </Button>
              </div>
            </form>



            {/* Footer links */}
            <div className="mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex items-center justify-center space-x-6 text-sm">
                <button className="text-slate-400 hover:text-slate-200 transition-colors duration-150 focus:outline-none focus:underline">
                  Need help?
                </button>
                <span className="text-slate-600">•</span>
                <button className="text-slate-400 hover:text-slate-200 transition-colors duration-150 focus:outline-none focus:underline">
                  Privacy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}