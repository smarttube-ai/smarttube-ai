import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';

export default function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: '2fe178df-6ab0-4bd7-ab49-d91f0e592f94',
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <footer className="bg-black/30 border-t border-white/10 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white font-montserrat">YTube AI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transform your YouTube content creation process with AI-powered insights, optimization, and automation tools.
            </p>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Contact Us</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#2762EB] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#2762EB] text-white placeholder-gray-400"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#2762EB] text-white placeholder-gray-400 resize-none"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Send Message
              </motion.button>
              {success && (
                <p className="text-green-500 text-center mt-4">
                  Message sent successfully!
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} YTube AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
