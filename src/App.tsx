import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BackToTop from './components/BackToTop';

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

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
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
            {/* 404 page - this will catch all unmatched routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BackToTop />
        </Suspense>
      </div>
    </Router>
  );
}

export default App;