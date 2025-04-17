import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RegisterForm1 from '../components/auth/RegisterForm1';
import RegisterForm2 from '../components/auth/RegisterForm2';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817] p-4">
      {step === 1 ? (
        <RegisterForm1 
          onNext={(data) => {
            setUserData(data);
            setStep(2);
          }}
          initialData={userData}
        />
      ) : (
        <RegisterForm2 
          userData={userData}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}
