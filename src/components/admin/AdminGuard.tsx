import React from 'react';
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
  const { initialized, user, isAdmin } = useAuth();
  const location = useLocation();

  // Wait for authentication to initialize
  if (!initialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#01040B]">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-[#1E293B] rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated but not admin, redirect to dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  // If admin, render the protected route
  return <>{children}</>;
};

export default AdminGuard; 