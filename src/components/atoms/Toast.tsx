import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-success-50',
      borderColor: 'border-success-500',
      textColor: 'text-success-700',
      iconColor: 'text-success-500',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-error-50',
      borderColor: 'border-error-500',
      textColor: 'text-error-700',
      iconColor: 'text-error-500',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-500',
      textColor: 'text-warning-700',
      iconColor: 'text-warning-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-info-50',
      borderColor: 'border-info-500',
      textColor: 'text-info-700',
      iconColor: 'text-info-500',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4
        max-w-sm animate-slide-up
        ${config.bgColor} ${config.borderColor}
        ${className}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`${config.textColor} hover:opacity-70 transition-opacity`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Add animation to index.css
// @keyframes slide-up {
//   from {
//     transform: translateY(100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateY(0);
//     opacity: 1;
//   }
// }
// .animate-slide-up {
//   animation: slide-up 0.3s ease-out;
// }
