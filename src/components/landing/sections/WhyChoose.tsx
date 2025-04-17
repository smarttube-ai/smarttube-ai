import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Bot, Layout } from 'lucide-react';

export default function WhyChoose() {
  const benefits = [
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Reduce content creation time by up to 80% with AI-powered automation',
      gradient: 'from-[#2762EB] to-[#9333EA]',
    },
    {
      icon: Sparkles,
      title: 'Boost SEO',
      description: 'Get higher rankings with AI-optimized titles, tags, and descriptions',
      gradient: 'from-[#9333EA] to-[#2762EB]',
    },
    {
      icon: Bot,
      title: 'AI-Powered',
      description: 'Leverage cutting-edge AI technology for smarter content creation',
      gradient: 'from-[#2762EB] to-[#9333EA]',
    },
    {
      icon: Layout,
      title: 'Beautiful UI',
      description: 'Enjoy a modern, intuitive dark interface designed for creators',
      gradient: 'from-[#9333EA] to-[#2762EB]',
    },
  ];

  return (
    <section id="why-choose" className="py-20 px-4 bg-white/[0.02] relative">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            Why Choose{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
              SmartTube AI
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Experience the future of YouTube content creation with our powerful AI tools and
            beautiful interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#2762EB]/50 transition-all group text-center"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${benefit.gradient} mx-auto flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/20`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-montserrat mb-4">
                {benefit.title}
              </h3>
              <p>{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { value: '80%', label: 'Time Saved' },
            { value: '2x', label: 'Engagement Rate' },
            { value: '50%', label: 'Higher Rankings' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA] font-montserrat mb-2">
                {stat.value}
              </div>
              <div className="text-white font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
