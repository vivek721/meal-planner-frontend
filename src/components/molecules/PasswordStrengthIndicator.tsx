import React from 'react';
import { calculatePasswordStrength } from '../../utils/passwordUtils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  const strengthConfig = {
    weak: {
      label: 'Weak',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      width: 'w-1/3',
    },
    medium: {
      label: 'Medium',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      width: 'w-2/3',
    },
    strong: {
      label: 'Strong',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      width: 'w-full',
    },
  };

  const config = strengthConfig[strength];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} transition-all duration-300 ${config.width}`}
        />
      </div>
    </div>
  );
};
