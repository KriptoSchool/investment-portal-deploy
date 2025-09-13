'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/login');
        return;
      }

      setUser(user);
      
      // Check if this is a first login (user metadata or created recently)
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      // Consider it first login if account was created within last 24 hours
      setIsFirstLogin(hoursDiff < 24);
      
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match.');
        return;
      }

      if (currentPassword === newPassword) {
        setError('New password must be different from current password.');
        return;
      }

      // Validate new password strength
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        setError(passwordErrors.join('. '));
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Update user metadata to mark password as changed
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          password_changed: true,
          password_changed_at: new Date().toISOString()
        }
      });

      if (metadataError) {
        console.warn('Failed to update metadata:', metadataError);
      }

      alert('✅ Password changed successfully!\n\nYou will now be redirected to your dashboard.');
      
      // Redirect to appropriate dashboard based on user role
      const userEmail = user?.email || '';
      if (userEmail.includes('@admin.')) {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/agent');
      }
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    const errors = validatePassword(password);
    const score = 5 - errors.length;
    
    if (score <= 1) return { strength: 'Very Weak', color: '#F04444', percentage: 20 };
    if (score === 2) return { strength: 'Weak', color: '#FFB020', percentage: 40 };
    if (score === 3) return { strength: 'Fair', color: '#FFD700', percentage: 60 };
    if (score === 4) return { strength: 'Good', color: '#2EE6A6', percentage: 80 };
    return { strength: 'Strong', color: '#21D07A', percentage: 100 };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6">
      <Card className="bg-[#101826] border border-[rgba(230,236,242,0.12)] rounded-[16px] backdrop-blur-[12px] shadow-lg max-w-md w-full">
        <CardHeader className="p-6 border-b border-[rgba(230,236,242,0.08)] text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-[#2EE6A6] to-[#3EA8FF] rounded-[12px] shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-[24px] font-bold text-[#E6ECF2]" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
            {isFirstLogin ? 'Welcome! Change Your Password' : 'Change Password'}
          </CardTitle>
          <CardDescription className="text-[14px] text-[#A8B3C2] mt-2" style={{fontFamily: 'Inter, sans-serif'}}>
            {isFirstLogin 
              ? 'For security, please change your temporary password'
              : 'Update your account password'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="pl-10 pr-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A8B3C2] hover:text-[#E6ECF2] transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pl-10 pr-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A8B3C2] hover:text-[#E6ECF2] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#A8B3C2]" style={{fontFamily: 'Inter, sans-serif'}}>Password Strength</span>
                    <span className="text-[12px] font-medium" style={{color: passwordStrength.color, fontFamily: 'Inter, sans-serif'}}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                  <div className="w-full bg-[rgba(230,236,242,0.1)] rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.percentage}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[14px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A8B3C2]" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="pl-10 pr-10 bg-[rgba(230,236,242,0.08)] border-[rgba(230,236,242,0.12)] text-[#E6ECF2] placeholder-[#A8B3C2] focus:border-[#2EE6A6] focus:ring-[#2EE6A6] rounded-[8px] h-12"
                  style={{fontFamily: 'Inter, sans-serif'}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A8B3C2] hover:text-[#E6ECF2] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-[#21D07A] mr-2" />
                      <span className="text-[12px] text-[#21D07A]" style={{fontFamily: 'Inter, sans-serif'}}>Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-[#F04444] mr-2" />
                      <span className="text-[12px] text-[#F04444]" style={{fontFamily: 'Inter, sans-serif'}}>Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-[rgba(230,236,242,0.04)] border border-[rgba(230,236,242,0.08)] rounded-[8px] p-4">
              <h4 className="text-[12px] font-medium text-[#E6ECF2] mb-2" style={{fontFamily: 'Inter, sans-serif'}}>Password Requirements:</h4>
              <ul className="text-[11px] text-[#A8B3C2] space-y-1" style={{fontFamily: 'Inter, sans-serif'}}>
                <li>• At least 8 characters long</li>
                <li>• One uppercase letter (A-Z)</li>
                <li>• One lowercase letter (a-z)</li>
                <li>• One number (0-9)</li>
                <li>• One special character (!@#$%^&*)</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[rgba(240,68,68,0.1)] border border-[rgba(240,68,68,0.2)] rounded-[8px] p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-[#F04444] mr-2" />
                  <p className="text-[13px] text-[#F04444]" style={{fontFamily: 'Inter, sans-serif'}}>{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-[#2EE6A6] to-[#3EA8FF] hover:from-[#26D0A4] hover:to-[#3B9EFF] text-white font-medium rounded-[8px] h-12 shadow-lg hover:shadow-[#2EE6A6]/25 transition-all duration-[200ms] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Changing Password...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}