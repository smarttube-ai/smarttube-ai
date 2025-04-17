import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020817] text-white">
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        {/* 404 SVG */}
        <div className="mb-8 w-full max-w-xl mx-auto">
          <svg
            viewBox="0 0 600 300"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2762EB" />
                <stop offset="100%" stopColor="#9333EA" />
              </linearGradient>
              
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* YouTube Play Button with 404 */}
            <g transform="translate(150, 50)">
              {/* Outer rounded rectangle (play button shape) */}
              <rect
                x="0"
                y="0"
                width="300"
                height="200"
                rx="50"
                ry="50"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                filter="url(#glow)"
              />
              
              {/* 4 - First digit */}
              <g>
                {/* Vertical line */}
                <path
                  d="M85,50 L85,150"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Horizontal line */}
                <path
                  d="M50,100 L110,100"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Small highlight */}
                <circle cx="85" cy="50" r="3" fill="#ffffff" opacity="0.8" />
              </g>
              
              {/* 0 - Middle digit */}
              <g>
                <circle
                  cx="150"
                  cy="100"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  filter="url(#glow)"
                />
                {/* Inner glow effect */}
                <circle
                  cx="150"
                  cy="100"
                  r="30"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* Small highlight */}
                <circle cx="130" cy="80" r="4" fill="#ffffff" opacity="0.6" />
              </g>
              
              {/* 4 - Last digit */}
              <g>
                {/* Vertical line */}
                <path
                  d="M215,50 L215,150"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Horizontal line */}
                <path
                  d="M180,100 L250,100"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                {/* Small highlight */}
                <circle cx="215" cy="50" r="3" fill="#ffffff" opacity="0.8" />
              </g>
              
              {/* Play triangle */}
              <path
                d="M130,220 L170,220 L150,250 Z"
                fill="url(#gradient)"
                filter="url(#glow)"
              />
              
              {/* Small highlight on triangle */}
              <circle cx="140" cy="225" r="3" fill="#ffffff" opacity="0.6" />
            </g>
            
            {/* Decorative elements */}
            <g>
              {/* Signal waves */}
              <path
                d="M100,150 Q 120,120 140,150 Q 160,180 180,150"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                opacity="0.5"
              />
              <path
                d="M420,150 Q 440,120 460,150 Q 480,180 500,150"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                opacity="0.5"
              />
              
              {/* Small circles */}
              <circle cx="80" cy="100" r="10" fill="url(#gradient)" opacity="0.7" />
              <circle cx="520" cy="100" r="10" fill="url(#gradient)" opacity="0.7" />
              <circle cx="80" cy="200" r="10" fill="url(#gradient)" opacity="0.7" />
              <circle cx="520" cy="200" r="10" fill="url(#gradient)" opacity="0.7" />
            </g>
          </svg>
        </div>

        {/* Error Text */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#2762EB] to-[#9333EA]">
          Error 404
        </h1>
        
        <p className="text-lg text-gray-400 text-center max-w-md mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Back to Home Button */}
        <Link
          to="/"
          className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] text-white font-medium transition-transform hover:scale-105"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
