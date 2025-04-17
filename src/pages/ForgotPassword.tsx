import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

export default function ForgotPassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] p-4">
      <ForgotPasswordForm />
    </div>
  );
}
