import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterSuccessComponent from '../components/auth/RegisterSuccess';

export default function RegisterSuccess() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] p-4">
      <RegisterSuccessComponent />
    </div>
  );
}
