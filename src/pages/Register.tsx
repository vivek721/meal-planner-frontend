import React from 'react';
import { RegisterForm } from '../components/organisms/RegisterForm';

export const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
};
