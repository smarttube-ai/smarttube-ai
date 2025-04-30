import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BackToTop from './components/BackToTop';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import AnnouncementBanner from './components/AnnouncementBanner';

// Main app components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LandingPage = React.lazy(() => import('./components/landing/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const RegisterSuccess = React.lazy(() => import('./pages/RegisterSuccess'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = React.lazy(() => import('./pages/TermsAndConditions'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));

// Admin components
const AdminGuard = React.lazy(() => import('./components/admin/AdminGuard'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const UsersAdmin = React.lazy(() => import('./pages/admin/Users'));
const PlansAdmin = React.lazy(() => import('./pages/admin/Plans'));
const LimitsAdmin = React.lazy(() => import('./pages/admin/Limits'));
const PaymentsAdmin = React.lazy(() => import('./pages/admin/Payments'));
const SettingsAdmin = React.lazy(() => import('./pages/admin/Settings'));
const AnnouncementsAdmin = React.lazy(() => import('./pages/admin/Announcements'));

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Show announcement banner only for authenticated users */}
        {user && <AnnouncementBanner />}
        
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard/*"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/register-success"
              element={!user ? <RegisterSuccess /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/forgot-password"
              element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/reset-password"
              element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            
            {/* Auth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="plans" element={<PlansAdmin />} />
              <Route path="limits" element={<LimitsAdmin />} />
              <Route path="payments" element={<PaymentsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="announcements" element={<AnnouncementsAdmin />} />
            </Route>
            
            {/* 404 page - this must be the last route to catch all unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BackToTop />
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;