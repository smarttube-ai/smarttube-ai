import { motion } from 'framer-motion';
import {
  Brain,
  Clock,
  Search,
  LineChart,
  Layout,
  Users
} from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Brain,
      title: "Smarter Content Decisions",
      description: "SmartTube AI helps you understand what works best by analyzing trends, audiences, and search behavior. Make every video a strategic move.",
      gradient: "from-[#2762EB] to-[#9333EA]"
    },
    {
      icon: Clock,
      title: "Save Hours of Time",
      description: "Stop wasting hours on research, scripts, and optimization. Automate tedious tasks so you can focus on creating.",
      gradient: "from-[#9333EA] to-[#2762EB]"
    },
    {
      icon: Search,
      title: "Always SEO-Ready",
      description: "Every suggestion you get is already optimized for YouTube's algorithm — from titles to tags to descriptions.",
      gradient: "from-[#2762EB] to-[#9333EA]"
    },
    {
      icon: LineChart,
      title: "Instant Insights, Real-Time Results",
      description: "Get instant feedback on your video ideas and see real-time SEO scores to improve before you even upload.",
      gradient: "from-[#9333EA] to-[#2762EB]"
    },
    {
      icon: Layout,
      title: "Works With Your Workflow",
      description: "Use it standalone or plug it into your browser with a floating dashboard. It adapts to your creative flow.",
      gradient: "from-[#2762EB] to-[#9333EA]"
    },
    {
      icon: Users,
      title: "Built For All Creators",
      description: "Whether you're just starting or already earning from YouTube, SmartTube AI grows with you — not against you.",
      gradient: "from-[#9333EA] to-[#2762EB]"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2762EB]/5 to-transparent" />
      <div className="absolute top-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            What You'll Love About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
              SmartTube AI
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Discover how SmartTube AI transforms your content creation process and helps you grow your channel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#2762EB]/50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-montserrat mb-4">
                {feature.title}
              </h3>
              <p className="text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
