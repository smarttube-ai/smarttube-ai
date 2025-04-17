import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

export default function ResetPassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] p-4">
      <ResetPasswordForm />
    </div>
  );
}
