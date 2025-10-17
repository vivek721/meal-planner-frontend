import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  error,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 pr-10 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            appearance-none bg-white
            ${error ? 'border-error-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'text-gray-700'}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
};
