import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    
    navigate('/dashboard/customer/profile', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting to your profile...</p>
    </div>
  );
};

export default ProfileRedirect;
