import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Youtube } from 'lucide-react';
import TypewriterComponent from 'typewriter-effect';
import DotGrid from '../DotGrid';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative h-[100vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Dot Grid Background */}
      <DotGrid />

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <Youtube className="w-12 h-12 text-[#ffffff]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white font-montserrat mb-6">
            Your AI Partner For{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
            YouTube Success
            </span>
          </h1>
          <div className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            <TypewriterComponent
              options={{
                strings: [
                  'Generate SEO-Optimized Titles & Descriptions',
                  'Analyze Trending Topics in Your Niche',
                  'Create Engaging Video Scripts',
                  'Get Real-Time Performance Insights',
                  'Optimize Your Content Strategy'
                ],
                autoStart: true,
                loop: true,
                delay: 40,
                deleteSpeed: 20
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#features"
            className="px-8 py-4 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 group"
          >
            Explore Features
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-colors"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-8 -left-32 w-64 h-64 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>
    </section>
  );
}
