import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AccessDashboard() {
  const { user } = useAuth();

  const handleAccess = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <section id="access" className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2762EB]/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] opacity-5 blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
              Ready to Transform Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
                YouTube Content?
              </span>
            </h2>
            <p className="text-lg mb-8">
              Join thousands of content creators who are already using SmartTube AI to streamline
              their content creation process and grow their channels.
            </p>
            <motion.button
              onClick={handleAccess}
              className="px-8 py-4 rounded-lg font-medium text-white bg-gradient-to-r from-[#2762EB] to-[#9333EA] hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center space-x-2 mx-auto lg:mx-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{user ? 'Access Dashboard' : 'Get Started Now'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Mockup Header */}
              <div className="bg-white/5 p-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
              
              {/* Dashboard Screenshot */}
              <div className="aspect-[16/9] bg-[#020817] p-4">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Sidebar Mockup */}
                  <div className="col-span-1 bg-white/5 rounded-lg p-4">
                    <div className="w-full h-4 bg-white/10 rounded mb-4" />
                    <div className="w-3/4 h-4 bg-white/10 rounded mb-4" />
                    <div className="w-5/6 h-4 bg-white/10 rounded" />
                  </div>
                  
                  {/* Main Content Mockup */}
                  <div className="col-span-2 space-y-4">
                    <div className="w-full h-32 bg-white/5 rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-white/5 rounded-lg" />
                      <div className="h-24 bg-white/5 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full opacity-20 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
