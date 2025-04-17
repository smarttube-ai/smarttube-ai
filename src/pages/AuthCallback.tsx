import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the URL hash for auth redirect response
    const handleAuthRedirect = async () => {
      try {
        // Parse the URL to check if it's a password reset or email confirmation
        const url = new URL(window.location.href);
        const isPasswordReset = url.hash.includes('type=recovery');
        
        // Process Supabase auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          setError('Authentication error: ' + error.message);
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }
        
        console.log('Session data:', data);
        
        // If it's a password reset, redirect to reset-password page
        if (isPasswordReset) {
          console.log('Password reset detected, redirecting to reset-password');
          navigate('/reset-password', { replace: true });
        } else {
          // Otherwise it's an email confirmation, redirect to dashboard if logged in, or home if not
          if (data?.session?.user) {
            console.log('User is logged in, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('No user session, redirecting to home page');
            navigate('/', { replace: true });
          }
        }
      } catch (err) {
        console.error('Auth redirect error:', err);
        setError('An error occurred during authentication.');
        setTimeout(() => navigate('/', { replace: true }), 3000);
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Verifying...</h1>
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-300/30 rounded-full animate-spin mx-auto"></div>
        )}
        <p className="mt-4 text-gray-400">Please wait while we verify your information...</p>
      </div>
    </div>
  );
} 