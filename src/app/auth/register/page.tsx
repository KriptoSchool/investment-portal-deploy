'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateEmail, validatePassword, sanitizeInput, logSecurityEvent } from '@/lib/security';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  
  const registerUser = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting registration process...');
      
      // Test Supabase connection first
      if (!supabase) {
        console.error('Supabase client not initialized');
        return { success: false, error: 'Database connection not available' };
      }
      
      // Input validation
      if (!validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return { success: false, error: passwordValidation.errors.join(', ') };
      }
      
      // Sanitize inputs
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      const sanitizedName = sanitizeInput(fullName);
      
      console.log('Attempting Supabase registration...');
      
      // Register user with Supabase (with proper database integration)
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          data: {
            full_name: sanitizedName,
            role: 'consultant'
          }
        }
      });
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        // Log failed registration attempt
        try {
          logSecurityEvent('registration_failed', {
            email: sanitizedEmail,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        } catch (logError) {
          console.error('Logging error:', logError);
        }
        
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Registration failed - no user data returned' };
      }
      
      console.log('Registration successful, logging event...');
      
      // Log successful registration
      try {
        logSecurityEvent('registration_success', {
          userId: data.user.id,
          email: sanitizedEmail,
          role: 'consultant',
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Logging error:', logError);
      }
      
      // Sign out immediately after registration (don't auto-login)
      await supabase.auth.signOut();
      
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { success: false, error: 'Network error - please check your internet connection and try again' };
      }
      
      return { success: false, error: `Registration failed: ${(error as any)?.message || 'Unknown error'}` };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registerUser(formData.email, formData.password, formData.fullName);
      
      if (result.success) {
        setSuccess('Registration successful! Please login with your credentials.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-600/20 rounded-full">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Join as Consultant
            </CardTitle>
            <CardDescription className="text-slate-400">
              Create your consultant account to start managing investments
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-slate-200">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 focus:ring-green-500/20"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 focus:ring-green-500/20"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 focus:ring-green-500/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-green-500/50 focus:ring-green-500/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium transition-all duration-150 shadow-lg hover:shadow-green-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Consultant Account'
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-slate-700/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/login')}
                className="w-full text-slate-400 hover:text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}