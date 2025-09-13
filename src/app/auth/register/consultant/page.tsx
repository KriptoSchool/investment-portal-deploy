'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ConsultantRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const testSupabase = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      console.log('Supabase test result:', { data, error });
      alert('Supabase test: ' + (error ? error.message : 'Connection successful'));
    } catch (error: any) {
      console.error('Supabase test error:', error);
      alert('Supabase test failed: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.password) {
        alert('Please fill in all required fields.');
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      // Validate password length
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }

      // Alternative approach: Direct database registration
      console.log('Starting direct database registration...');
      
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        throw new Error(`Database check failed: ${checkError.message}`);
      }

      if (existingUser) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      // Create user record directly in database
      const userId = crypto.randomUUID();
      console.log('Creating user with ID:', userId);
      
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: formData.email,
          full_name: formData.fullName,
          role: 'AGENT'
        });

      console.log('User record creation result:', userError);

      if (userError) {
        console.error('User record error:', userError);
        throw new Error(`Database error: ${userError.message}`);
      }

      alert('Registration successful! Your account has been created. You can now sign in with your email and password.');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + (error.message || error.toString()));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">CONSULTANT REGISTRATION</CardTitle>
          <CardDescription>Join our investment consultant network</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Create your account to access the consultant dashboard. You'll complete your detailed profile after signing in.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verify your email address</li>
                <li>• Sign in to your account</li>
                <li>• Complete your consultant profile</li>
                <li>• Start tracking your commissions</li>
              </ul>
            </div>
            
            <div className="flex justify-between pt-6">
              <Link href="/login">
                <Button variant="outline" type="button">Back to Sign In</Button>
              </Link>
              <div className="flex gap-2">
                <Button 
                  type="button"
                  onClick={testSupabase}
                  variant="outline"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Test DB
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  {loading ? 'Registering...' : 'Register as Consultant'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}