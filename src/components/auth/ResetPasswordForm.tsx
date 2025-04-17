import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Youtube, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Check if we have a hash fragment in the URL (Supabase adds this for password reset)
  useEffect(() => {
    const handleHashChange = async () => {
      try {
        // The hash params are automatically handled by Supabase auth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError('Unable to verify your reset link. Please try requesting a new password reset.');
          return;
        }
        
        console.log('Session data:', data);
        
        // If no active session with access token, redirect to forgot password
        if (!data?.session?.access_token) {
          console.log('No active session, redirecting to forgot-password');
          navigate('/forgot-password');
        }
      } catch (err) {
        console.error('Session check error:', err);
        setError('An error occurred while verifying your reset link.');
      }
    };

    handleHashChange();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Update password using Supabase
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }
      
      console.log('Password update response:', data);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password update exception:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#020817]">
      <div className="w-full bg-[#030C20] rounded-lg shadow-lg border border-gray-800 p-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center">
            <Link to="/" className="flex items-center space-x-2 whitespace-nowrap">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center flex-shrink-0">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SmartTube AI</span>
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-4 bg-green-500/10 text-green-500 p-6 rounded-lg mb-6">
            <CheckCircle className="w-12 h-12" />
            <h3 className="text-xl font-semibold text-center">Password Reset Successful</h3>
            <p className="text-center text-gray-400">
              Your password has been successfully reset. You'll be redirected to the login page in a moment.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create new password"
                  className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#2762EB] to-[#9333EA] hover:opacity-90 text-white font-medium rounded-md transition-colors"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-[#2562EB] hover:text-blue-400 text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
