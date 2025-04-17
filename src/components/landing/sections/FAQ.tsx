import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      question: "What Exactly Does SmartTube AI Do?",
      answer: "SmartTube AI helps creators generate SEO-optimized titles, tags, descriptions, and hashtags using real-time video and channel analysis. It simplifies content creation so you can grow faster with less effort."
    },
    {
      question: "Do I Need a YouTube Channel to Use It?",
      answer: "You don't need to connect a channel to explore features, but for the best results, it's recommended to analyze your own videos or channels similar to yours."
    },
    {
      question: "How Is This Different from Other YouTube Tools?",
      answer: "Unlike generic tools, SmartTube AI uses real-time data + AI to provide actionable content suggestions. You're not just getting analytics — you're getting actual video content ready to post."
    },
    {
      question: "Can I Analyze Other Channels and Videos Too?",
      answer: "Yes! You can analyze any public video or channel on YouTube. Great for reverse-engineering what's working in your niche."
    },
    {
      question: "Will SmartTube AI Work for Small or New Channels?",
      answer: "Absolutely. SmartTube AI is built to help creators at any level. Whether you're just starting out or already growing, the platform gives you smart suggestions to improve visibility and performance."
    },
    {
      question: "Can I Customize the AI Suggestions?",
      answer: "Yes. While SmartTube AI gives you ready-to-use titles, descriptions, and hashtags — you can edit and tweak them to match your voice and video style before publishing."
    },
    {
      question: "Is My Channel Data Safe with SmartTube AI?",
      answer: "Yes, 100%. We never store or access your private YouTube data. You only analyze public videos or share links. Your activity remains secure and private."
    }
  ];

  return (
    <section id="faq" className="py-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2762EB]/5 to-transparent" />
      <div className="absolute top-1/4 -right-32 w-64 h-64 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />
      <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-gradient-to-r from-[#9333EA] to-[#2762EB] rounded-full mix-blend-multiply filter blur-3xl opacity-5" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white font-montserrat mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg max-w-2xl mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for,
            feel free to contact our support team.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                className="w-full p-6 text-left bg-white/5 hover:bg-white/[0.07] transition-all flex items-center justify-between"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0">
                      <p className="text-base leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
