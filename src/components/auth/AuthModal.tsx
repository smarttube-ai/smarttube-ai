import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  ArrowLeft,
  ToggleLeft as Google,
  BarChart2,
  Lightbulb,
  Search,
  AlertCircle,
  CheckCircle,
  KeyRound
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  disableClose?: boolean;
}

type AuthStep = 'login' | 'register-info' | 'register-password' | 'register-confirm' | 'forgot-email' | 'forgot-password';

export default function AuthModal({ isOpen, onClose, disableClose }: Props) {
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      switch (authStep) {
        case 'login':
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });
          if (loginError) throw loginError;
          if (!disableClose) onClose();
          break;

        case 'register-info':
          if (!formData.email || !formData.fullName) {
            throw new Error('Please fill in all fields');
          }
          setAuthStep('register-password');
          break;

        case 'register-password':
          if (formData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          
          const { error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.fullName,
              },
              emailRedirectTo: `https://smarttube-ai.vercel.app/auth/callback`,
            },
          });
          
          if (signUpError) throw signUpError;
          
          setSuccess('Please check your email to confirm your account');
          setAuthStep('register-confirm');
          break;

        case 'forgot-email':
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            formData.email,
            { redirectTo: `https://smarttube-ai.vercel.app/auth/callback` }
          );
          if (resetError) throw resetError;
          setSuccess('Password reset instructions sent to your email');
          setAuthStep('login');
          break;

        case 'forgot-password':
          if (formData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
          }
          if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
          }
          const { error: updateError } = await supabase.auth.updateUser({
            password: formData.password,
          });
          if (updateError) throw updateError;
          setSuccess('Password updated successfully');
          setAuthStep('login');
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const renderAuthForm = () => {
    switch (authStep) {
      case 'login':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Welcome Back!
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAuthStep('forgot-email')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthStep('register-info')}
                className="text-white hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        );

      case 'register-info':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            custom={1}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Create Account
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setAuthStep('login')}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-12 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                  disabled={loading}
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'register-password':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            custom={1}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Set Password
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Confirm Password"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setAuthStep('register-info')}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-12 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                  disabled={loading}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'register-confirm':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            custom={1}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Check Your Email
            </Dialog.Title>

            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-2">
                <p className="text-lg">
                  We've sent a confirmation email to:
                </p>
                <p className="text-primary font-medium">
                  {formData.email}
                </p>
              </div>

              <p className="text-gray-400">
                Click the link in the email to verify your account and complete the registration process.
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setAuthStep('login')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 'forgot-email':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            custom={1}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Reset Password
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-center text-gray-400 mb-6">
                Enter your email address to receive password reset instructions
              </p>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setAuthStep('login')}
                  className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-12 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                  disabled={loading}
                >
                  Send Instructions
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'forgot-password':
        return (
          <motion.div
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            custom={1}
          >
            <Dialog.Title className="text-3xl font-bold mb-8 text-center">
              Set New Password
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="New Password (min. 6 characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full h-12 bg-white/5 rounded-lg pl-12 pr-4 text-white placeholder-gray-400 border border-white/10 focus:border-white/20 transition-colors"
                  placeholder="Confirm New Password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-white text-black rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
                disabled={loading}
              >
                Update Password
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={disableClose ? undefined : onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full"
          />
        </Dialog.Overlay>
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 bg-[#01040B]/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            {/* Left Side - Form */}
            <div className="p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 text-red-500 p-4 rounded-lg mb-6"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-green-500/10 text-green-500 p-4 rounded-lg mb-6"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{success}</p>
                </motion.div>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {renderAuthForm()}
              </AnimatePresence>
            </div>

            {/* Right Side - Features */}
            <div className="hidden md:block relative">
              <img
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070"
                alt="Content Creator workspace"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#01040B]/90 to-[#01040B]/50" />
              <div className="relative h-full flex flex-col justify-center p-8">
                <h2 className="text-3xl font-bold mb-4">Grow Your YouTube Channel</h2>
                <p className="text-gray-300 mb-8">
                  Join thousands of content creators using our AI-powered tools to grow their audience
                  and create better content.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <BarChart2 className="w-5 h-5" />
                    </div>
                    <span>Advanced analytics and insights</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <span>AI-powered content suggestions</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <span>SEO optimization tools</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}