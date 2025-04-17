import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the URL hash for auth redirect response
    const handleAuthRedirect = async () => {
      try {
        // Process Supabase auth callback
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
        }
        
        // Navigate to the home page after processing
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Auth redirect error:', err);
        navigate('/', { replace: true });
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] text-white">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Redirecting...</h1>
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-300/30 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-400">Please wait while we verify your account...</p>
      </div>
    </div>
  );
} 