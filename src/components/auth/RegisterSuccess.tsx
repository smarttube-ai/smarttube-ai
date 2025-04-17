import { Link } from 'react-router-dom';
import { CheckCircle, Youtube } from 'lucide-react';

export default function RegisterSuccess() {
  return (
    <div className="w-full max-w-md mx-auto bg-[#020817]">
      <div className="w-full bg-[#030C20] rounded-lg shadow-lg border border-gray-800 p-8">
        <div className="flex justify-center mb-8">
          <div className="w-36 h-20 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SmartTube AI</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Registration Complete!</h2>
          
          <p className="text-center text-gray-400 mb-6">
            Please check your email to verify your account. Once verified, you can log in to access your dashboard.
          </p>
          
          <Link
            to="/login"
            className="w-full py-3 bg-white hover:bg-gray-100 text-[#020817] font-medium rounded-md transition-colors text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
