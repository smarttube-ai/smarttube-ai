import { Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-[#050d1f] relative z-10">
      <div className="container mx-auto">
        {/* Top section with Logo and Policy Pages */}
        <div className="flex flex-col md:flex-row justify-between items-center py-4 border-b border-border/30">
          <div className="mb-4 md:mb-0">
            <Link 
              to="/" 
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SmartTube AI</span>
            </Link>
          </div>
          
          <div className="flex space-x-6">
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-and-conditions" 
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
        
        {/* Bottom section with Footer Credits */}
        <div className="py-4 text-center text-sm text-muted-foreground/60">
          &copy; {new Date().getFullYear()} SmartTube AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
