'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error.message}`);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?error=auth_failed');
          }, 3000);
          return;
        }
        
        if (data.session) {
          console.log('✅ Authentication successful for:', data.session.user.email);
          console.log('🔍 Session details:', { userId: data.session.user.id, email: data.session.user.email });
          
          setStatus('success');
          setMessage('Authentication successful! Setting up user context...');
          
          // Force trigger auth state change and user loading
          try {
            // Wait a moment for UserContext to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Use the forceSessionCheck function from UserContext
            if (typeof window !== 'undefined' && (window as any).forceSessionCheck) {
              console.log('🔄 Using UserContext forceSessionCheck...');
              await (window as any).forceSessionCheck();
              
              // Wait for user context to be set
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              console.log('🔄 Redirecting to dashboard after user context setup...');
              router.push('/dashboard');
            } else {
              console.log('⚠️ forceSessionCheck not available, using fallback...');
              
              // Fallback: Force reload to ensure UserContext picks up session
              setTimeout(() => {
                console.log('🔄 Force reloading to ensure UserContext initialization...');
                window.location.href = '/dashboard';
              }, 2000);
            }
            
          } catch (error) {
            console.error('❌ Error in manual auth processing:', error);
            
            // Final fallback: simple redirect
            setTimeout(() => {
              console.log('🔄 Final fallback redirect to dashboard...');
              router.push('/dashboard');
            }, 3000);
          }
        } else {
          console.log('⚠️ No session found in callback');
          setStatus('error');
          setMessage('No authentication session found. Redirecting to login...');
          
          setTimeout(() => {
            router.push('/login?error=no_session');
          }, 3000);
        }
      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Redirecting to login...');
        
        setTimeout(() => {
          router.push('/login?error=callback_failed');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          )}
          {status === 'success' && (
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>
        
        <h1 className="text-xl font-semibold text-white mb-4">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h1>
        
        <p className="text-slate-400 text-sm leading-relaxed">
          {message}
        </p>
        
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}