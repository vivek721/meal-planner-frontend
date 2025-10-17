import React from 'react';
import { LoginForm } from '../components/organisms/LoginForm';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};
