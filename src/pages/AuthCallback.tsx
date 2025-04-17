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
        // Parse the URL hash parameters
        const hashParams = window.location.hash
          .substring(1)
          .split('&')
          .reduce((params, param) => {
            const [key, value] = param.split('=');
            params[key] = value;
            return params;
          }, {} as Record<string, string>);

        console.log('Auth callback URL hash params:', hashParams);
        
        // Check for specific types
        const type = hashParams.type;
        const accessToken = hashParams.access_token;
        
        // Process Supabase auth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          setError('Authentication error: ' + error.message);
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }
        
        console.log('Auth callback session data:', data);
        
        // Handle different auth scenarios
        if (type === 'recovery' || window.location.href.includes('reset-password')) {
          console.log('Password reset flow detected, redirecting to reset-password');
          navigate('/reset-password', { replace: true });
        } else if (type === 'signup' || type === 'email_confirmation') {
          console.log('Email confirmation flow detected');
          // If the user has a valid session, redirect to dashboard, otherwise to login
          if (data?.session?.user) {
            console.log('User has valid session, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('Email confirmed but no session, redirecting to login');
            navigate('/login', { replace: true });
          }
        } else if (accessToken || data?.session?.access_token) {
          console.log('Access token detected, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('No specific auth flow detected, redirecting to home page');
          navigate('/', { replace: true });
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