import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard component
 * Protects routes by ensuring only users with admin role can access them
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { initialized, user, isAdmin, refreshProfile } = useAuth();
  const location = useLocation();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const validateAdmin = async () => {
      setIsCheckingAdmin(true);
      
      // If we already know the user is admin, skip additional checks
      if (isAdmin()) {
        setAdminStatus(true);
        setIsCheckingAdmin(false);
        return;
      }
      
      try {
        // Try refreshing the profile to ensure we have the latest data
        await refreshProfile();
        
        // Check if user is admin after refresh
        const adminCheck = isAdmin();
        setAdminStatus(adminCheck);
        
        // If not admin and we haven't exceeded max retries, try again
        if (!adminCheck && retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000); // Wait 1 second before retrying
        }
      } catch (error) {
        console.error('Error validating admin status:', error);
        setAdminStatus(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (initialized && user) {
      validateAdmin();
    }
  }, [initialized, user, retryCount]);

  // Wait for authentication to initialize
  if (!initialized || isCheckingAdmin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#01040B]">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-[#1E293B] rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">
          {retryCount > 0 ? `Verifying admin access... (Attempt ${retryCount}/${MAX_RETRIES})` : 'Loading...'}
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated but not admin, redirect to dashboard
  if (adminStatus === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // If admin, render the protected route
  return <>{children}</>;
};

export default AdminGuard; 