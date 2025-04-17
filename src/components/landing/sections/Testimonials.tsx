import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -1000]);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      content: "SmartTube AI transformed my channel growth. The SEO suggestions are spot-on, and my views have increased by 300% since I started using it!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Tech Reviewer",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      content: "The AI script generator saves me hours of work. It understands my niche perfectly and helps me create engaging content consistently.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Educational Content",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      content: "As an educational creator, I love how SmartTube AI helps me optimize my content for both engagement and learning. It's a game-changer!",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "Gaming Channel",
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      content: "The real-time analytics and trend suggestions help me stay ahead in the competitive gaming niche. Best investment for my channel!",
      rating: 5
    },
    {
      name: "Lisa Martinez",
      role: "Lifestyle Vlogger",
      image: "https://randomuser.me/api/portraits/women/5.jpg",
      content: "SmartTube AI's thumbnail suggestions and title optimization have dramatically improved my click-through rates. Highly recommended!",
      rating: 5
    },
    {
      name: "David Kim",
      role: "Music Creator",
      image: "https://randomuser.me/api/portraits/men/6.jpg",
      content: "The platform understands music content so well. It helps me reach the right audience and grow my subscriber base consistently.",
      rating: 5
    },
    {
      name: "Rachel Foster",
      role: "Cooking Channel",
      image: "https://randomuser.me/api/portraits/women/7.jpg",
      content: "The recipe video optimization and keyword suggestions are incredible. My cooking videos are now reaching a much wider audience!",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Business Coach",
      image: "https://randomuser.me/api/portraits/men/8.jpg",
      content: "SmartTube AI helps me deliver valuable business content to my audience more effectively. The ROI has been exceptional!",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2762EB]/5 to-transparent" />
      <div className="absolute top-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            Loved by Content Creators
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Join thousands of creators who are growing their channels with SmartTube AI
          </p>
        </motion.div>

        <div ref={containerRef} className="relative overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex gap-6 py-8 w-[300%]"
          >
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
              <motion.div
                key={index}
                className="w-[400px] flex-shrink-0 bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#2762EB]/50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{testimonial.content}</p>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#2762EB] text-[#2762EB]"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
