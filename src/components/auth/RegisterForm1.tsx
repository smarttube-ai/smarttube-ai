import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Youtube } from 'lucide-react';

interface RegisterForm1Props {
  onNext: (data: { firstName: string; lastName: string; email: string }) => void;
  initialData?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RegisterForm1({ onNext, initialData }: RegisterForm1Props) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and services');
      return;
    }

    onNext(formData);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2">First name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#2562EB]"
            />
          </div>

          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={() => setAgreeToTerms(!agreeToTerms)}
              className="h-4 w-4 border-gray-300 rounded text-[#2562EB] focus:ring-[#2562EB]"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-300">
              By signing up you agree to the{' '}
              <Link to="/terms-and-conditions" className="text-[#2562EB] hover:text-blue-400">
                terms and services
              </Link>{' '}
              and the{' '}
              <Link to="/privacy-policy" className="text-[#2562EB] hover:text-blue-400">
                privacy policy
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white hover:bg-gray-100 text-[#020817] font-medium rounded-md transition-colors"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2562EB] hover:text-blue-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
