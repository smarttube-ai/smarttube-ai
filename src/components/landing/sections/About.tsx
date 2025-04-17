import { motion } from 'framer-motion';
import { Bot, Youtube, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
              Revolutionize Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
                YouTube Content
              </span>
            </h2>

            <div className="space-y-6 text-lg">
              <p>
                SmartTube AI is your ultimate companion for YouTube content creation. Our platform
                combines cutting-edge AI technology with deep YouTube analytics to help you create
                content that truly resonates with your audience.
              </p>

              <p>
                From generating engaging scripts to optimizing your SEO, our suite of AI tools
                streamlines your content creation process, saving you hours of work while
                maximizing your channel's growth potential.
              </p>

              <p>
                Whether you're a seasoned creator or just starting out, SmartTube AI provides the
                tools and insights you need to stand out in the competitive YouTube landscape.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              {
                icon: Bot,
                title: 'AI-Powered',
                description: 'Advanced AI algorithms for content optimization',
              },
              {
                icon: Youtube,
                title: 'YouTube Focus',
                description: 'Specialized tools for YouTube success',
              },
              {
                icon: Sparkles,
                title: 'Smart Analytics',
                description: 'Data-driven insights for growth',
              },
              {
                icon: Bot,
                title: 'Auto Generate',
                description: 'One-click content generation',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#2762EB]/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-montserrat font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
