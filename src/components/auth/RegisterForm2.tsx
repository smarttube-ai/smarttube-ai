import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Youtube } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface RegisterForm2Props {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onBack: () => void;
}

export default function RegisterForm2({ userData, onBack }: RegisterForm2Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
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
      // Register the user with Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (signUpError) throw signUpError;
      
      // Redirect to success page or login
      navigate('/register-success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
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
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md text-gray-400">
              {userData.email}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Password confirmation</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-gray-100 text-[#020817] font-medium rounded-md transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <button 
            onClick={onBack}
            className="flex items-center text-sm text-[#2562EB] hover:text-blue-400"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
