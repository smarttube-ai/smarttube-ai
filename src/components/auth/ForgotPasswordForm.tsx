import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Youtube, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      // Send password reset email using Supabase
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://smarttube-ai.vercel.app/auth/callback`,
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        throw resetError;
      }
      
      console.log('Password reset response:', data);
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error('Password reset exception:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while sending the reset link');
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

        <h2 className="text-2xl font-bold text-center mb-6">Reset Your Password</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-4 bg-green-500/10 text-green-500 p-6 rounded-lg mb-6">
            <CheckCircle className="w-12 h-12" />
            <h3 className="text-xl font-semibold text-center">Check Your Email</h3>
            <p className="text-center text-gray-400">
              We've sent a password reset link to <span className="font-medium text-white">{email}</span>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Don't see the email? Check your spam folder or try again.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#2762EB] to-[#9333EA] hover:opacity-90 text-white font-medium rounded-md transition-colors"
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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
