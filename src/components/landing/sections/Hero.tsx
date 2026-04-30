import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import TypewriterComponent from 'typewriter-effect';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#03040B]"
    >
      {/* Subtle grid pattern with dot intersections */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 90%)'
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundPosition: '-0.5px -0.5px'
          }}
        />
      </div>

      {/* Floating dot pattern / Particles */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          backgroundPosition: '0 0, 45px 45px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      {/* Large soft blue glow on the left */}
      <div className="pointer-events-none absolute left-0 top-1/4 h-[40rem] w-[40rem] -translate-x-1/3 rounded-full bg-[#2762EB]/45 blur-[130px]" />
      
      {/* Large soft purple glow on the right */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[40rem] w-[40rem] translate-x-1/3 rounded-full bg-[#9333EA]/45 blur-[130px]" />

      {/* Faint ambient glow behind the center content */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[25rem] w-[45rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[100px]" />

      {/* Subtle curved arc glow near the bottom */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-[70vw] h-[15rem] -translate-x-1/2 translate-y-1/2 rounded-[100%] bg-gradient-to-t from-[#9333EA]/20 to-transparent blur-[50px]" />

      <div className="max-w-[1000px] mx-auto relative z-10 text-center flex flex-col items-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 relative w-full"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Your AI Partner For <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F81FF] to-[#A855F7] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              YouTube Success
            </span>
          </h1>
          
          <div className="text-lg md:text-xl text-slate-300/90 max-w-2xl mx-auto font-medium tracking-wide min-h-[40px]">
            <TypewriterComponent
              options={{
                strings: [
                  'Analyze Trending Topics in Your Niche',
                  'Get Real-Time Performance Insights',
                  'Optimize Your Content Strategy',
                  'Create Engaging Video Scripts',
                  'Get Real-Time Performance Insights'
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
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-6"
        >
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#2762EB] to-[#9333EA] rounded-full text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              Explore Features
              <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-semibold border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)]"
          >
            See How It Works
          </a>
        </motion.div>
      </div>
    </section>
  );
}

