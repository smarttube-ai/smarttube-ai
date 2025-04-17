import { motion } from 'framer-motion';
import { Target, Search, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Target,
      title: "Set Your Channel Goals",
      description: "Log in and define what you're aiming for — whether it's growing subscribers, ranking better, or increasing views. SmartTube AI tailors its content strategy based on your exact objectives.",
      gradient: "from-[#2762EB] to-[#9333EA]"
    },
    {
      icon: Search,
      title: "Analyze Videos & Channels",
      description: "Paste a video or channel URL, and let SmartTube AI break it all down — keywords used, engagement insights, SEO score, and hidden ranking signals. Instantly understand what works and what doesn't.",
      gradient: "from-[#9333EA] to-[#2762EB]"
    },
    {
      icon: Sparkles,
      title: "Generate Optimized Video Content",
      description: "Once analyzed, SmartTube AI gives you AI-powered titles, tags, video descriptions, and hashtags — all optimized for YouTube SEO. Just copy, tweak if needed, and publish with confidence.",
      gradient: "from-[#2762EB] to-[#9333EA]"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#9333EA]/5 to-transparent" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            How{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
              SmartTube AI
            </span>{' '}
            Works
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Get started with SmartTube AI in three simple steps and transform your YouTube content creation process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#2762EB]/50 transition-all group"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white font-montserrat mb-4">
                {step.title}
              </h3>
              <p className="text-base">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
