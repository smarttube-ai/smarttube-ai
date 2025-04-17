import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('access_key', '0396421a-545d-4d63-b44a-af2f6b397f36');
      formData.append('name', formState.name);
      formData.append('email', formState.email);
      formData.append('message', formState.message);
      formData.append('from_name', 'SmartTube AI Contact Form');
      formData.append('subject', 'New Contact Form Submission');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setFormState({ name: '', email: '', message: '' });
        // Show success state for 2 seconds, then redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className="relative py-20 px-4 bg-[#020817]" id="contact">
      <div className="max-w-3xl mx-auto text-center">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            Get in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
              Touch
            </span>
          </h2>
          <p className="text-lg text-gray-400">
            Have questions about SmartTube AI? We're here to help! Send us a message and we'll
            get back to you as soon as possible.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative bg-[#0B1120] p-8 rounded-2xl shadow-xl border border-white/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 text-left">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#1A2333] border border-[#2D3748] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2762EB] text-white transition-all hover:border-[#2762EB]/50"
                placeholder="Your name"
                disabled={status === 'submitting'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 text-left">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#1A2333] border border-[#2D3748] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2762EB] text-white transition-all hover:border-[#2762EB]/50"
                placeholder="your@email.com"
                disabled={status === 'submitting'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 text-left">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formState.message}
                onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 bg-[#1A2333] border border-[#2D3748] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2762EB] text-white resize-none transition-all hover:border-[#2762EB]/50"
                placeholder="Your message..."
                disabled={status === 'submitting'}
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                >
                  {errorMessage}
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-500 text-sm text-center bg-green-500/10 p-3 rounded-lg border border-green-500/20"
                >
                  Message sent successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={status === 'submitting'}
              className={`w-full py-4 px-6 bg-gradient-to-r from-[#2762EB] to-[#9333EA] text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${status === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 hover:scale-[1.02]'}`}
              whileHover={{ scale: status !== 'submitting' ? 1.02 : 1 }}
              whileTap={{ scale: status !== 'submitting' ? 0.98 : 1 }}
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Message Sent!</span>
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
