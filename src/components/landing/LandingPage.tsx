import { useEffect } from 'react';
import Hero from './sections/Hero';
import About from './sections/About';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import WhyChoose from './sections/WhyChoose';
import Testimonials from './sections/Testimonials';
import AccessDashboard from './sections/AccessDashboard';
import FAQ from './sections/FAQ';
import Contact from './sections/Contact';
import Navbar from './Navbar';
import ParticlesBackground from './ParticlesBackground';
import Footer from '../Footer';

export default function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#020817] text-gray-300 relative">
      <ParticlesBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <HowItWorks />
        <WhyChoose />
        <Testimonials />
        <AccessDashboard />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
