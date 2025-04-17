import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AlertCircle, Youtube } from 'lucide-react';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (loginError) throw loginError;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
            />
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="text-[#2562EB] hover:text-blue-400">
              Forgot password? Send reset code.
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-[#020817] font-medium rounded-md transition-colors"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account? <Link to="/register" className="text-[#2562EB] hover:text-blue-400">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
