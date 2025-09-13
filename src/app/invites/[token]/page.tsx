'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, CheckCircle, AlertCircle, User } from 'lucide-react';

interface InviteData {
  token: string;
  application_id: string;
  email: string;
  expires_at: string;
  used_at?: string;
  application: {
    full_name: string;
    email: string;
    nric: string;
    contact_number: string;
    address: string;
    city_country: string;
    bank_name: string;
    account_number: string;
  };
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeToTerms: false
  });

  useEffect(() => {
    if (params.token) {
      validateInviteToken(params.token as string);
    }
  }, [params.token]);

  const validateInviteToken = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Get invite token with application data
      const { data: inviteToken, error: inviteError } = await supabase
        .from('invite_tokens')
        .select(`
          *,
          application:applications(
            full_name,
            email,
            nric,
            contact_number,
            address,
            city_country,
            bank_name,
            account_number
          )
        `)
        .eq('token', token)
        .single();

      if (inviteError || !inviteToken) {
        // Try to get from applications table directly (fallback)
        const { data: application, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('invite_token', token)
          .single();

        if (appError || !application) {
          setError('Invalid or expired invite link.');
          return;
        }

        // Create mock invite data from application
        const mockInviteData: InviteData = {
          token: token,
          application_id: application.id,
          email: application.email,
          expires_at: application.invite_token_expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          used_at: application.invite_sent ? undefined : new Date().toISOString(),
          application: {
            full_name: application.full_name,
            email: application.email,
            nric: application.nric,
            contact_number: application.contact_number,
            address: application.address,
            city_country: application.city_country,
            bank_name: application.bank_name,
            account_number: application.account_number
          }
        };
        
        setInviteData(mockInviteData);
        setFormData(prev => ({
          ...prev,
          email: application.email,
          fullName: application.full_name
        }));
        return;
      }

      // Check if token is expired
      if (new Date(inviteToken.expires_at) < new Date()) {
        setError('This invite link has expired. Please contact support for a new invitation.');
        return;
      }

      // Check if token is already used
      if (inviteToken.used_at) {
        setError('This invite link has already been used.');
        return;
      }

      setInviteData(inviteToken);
      setFormData(prev => ({
        ...prev,
        email: inviteToken.email,
        fullName: inviteToken.application?.full_name || ''
      }));
      
    } catch (error) {
      console.error('Error validating invite token:', error);
      setError('Failed to validate invite link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      return 'Please fill in all required fields.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match.';
    }

    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (!formData.agreeToTerms) {
      return 'Please agree to the terms and conditions.';
    }

    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!inviteData) {
      setError('Invalid invite data.');
      return;
    }

    setIsSigningUp(true);
    setError('');

    try {
      // Create Supabase Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'AGENT',
            invite_token: inviteData.token,
            application_id: inviteData.application_id
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create User Profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: 'AGENT'
        });

      if (userError && !userError.message.includes('relation "users" does not exist')) {
        console.error('Error creating user profile:', userError);
      }

      // Create Agent Record with application data
      const agentId = `AGT${Date.now().toString().slice(-6)}`;
      
      const { error: agentError } = await supabase
        .from('agents')
        .insert({
          user_id: authData.user.id,
          agent_id: agentId,
          level: 'VC_CONSULTANT',
          nric: inviteData.application.nric,
          address: inviteData.application.address,
          city: inviteData.application.city_country?.split(',')[0]?.trim(),
          country: inviteData.application.city_country?.split(',')[1]?.trim() || 'Malaysia',
          contact_number: inviteData.application.contact_number,
          bank_name: inviteData.application.bank_name,
          account_number: inviteData.application.account_number
        });

      if (agentError && !agentError.message.includes('relation "agents" does not exist')) {
        console.error('Error creating agent record:', agentError);
      }

      // Mark invite token as used
      const { error: tokenError } = await supabase
        .from('invite_tokens')
        .update({
          used_at: new Date().toISOString(),
          used_by: authData.user.id
        })
        .eq('token', inviteData.token);

      if (tokenError && !tokenError.message.includes('relation "invite_tokens" does not exist')) {
        console.error('Error updating invite token:', tokenError);
      }

      // Update application status
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({
          application_status: 'COMPLETED',
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteData.application_id);

      if (appUpdateError && !appUpdateError.message.includes('relation "applications" does not exist')) {
        console.error('Error updating application:', appUpdateError);
      }

      // Success - redirect to dashboard
      alert(`✅ Account created successfully!\n\n🎉 Welcome to Aaron M LLP!\n🆔 Your Agent ID: ${agentId}\n\nYou will now be redirected to your dashboard.`);
      
      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
      
    } catch (error: any) {
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-400">Validating invite link...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border-slate-800/50">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <CardTitle className="text-xl font-bold text-white">Invalid Invite</CardTitle>
            <CardDescription className="text-slate-400">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to Aaron M LLP
            </h1>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Complete your registration to start your journey as a consultant
            </p>
            
            {inviteData && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Your Application</h3>
                <div className="space-y-2 text-sm text-white/80">
                  <p><span className="font-medium">Name:</span> {inviteData.application.full_name}</p>
                  <p><span className="font-medium">Email:</span> {inviteData.application.email}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-300">Approved</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sign Up Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Complete Registration</h2>
            <p className="text-slate-400">
              Create your account to access the consultant portal
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-200 mb-2 block">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="pl-10 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-150"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-200 mb-2 block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  readOnly
                  className="pl-10 h-12 bg-slate-800/30 border-slate-700/50 text-slate-300 placeholder-slate-400 rounded-lg cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Email is pre-filled from your application</p>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-slate-200 mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a password"
                  required
                  className="pl-10 pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200 mb-2 block">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className="pl-10 pr-10 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="agreeToTerms" className="text-sm text-slate-300 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </button>
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isSigningUp}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-150 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSigningUp ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Complete Registration
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform duration-150" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}