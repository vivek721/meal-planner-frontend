import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '../atoms/Input';

interface FormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<any>;
  helperText?: string;
  required?: boolean;
  autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  error,
  register,
  helperText,
  required = false,
  autoComplete,
}) => {
  return (
    <Input
      {...register(name)}
      label={label}
      type={type}
      placeholder={placeholder}
      error={error?.message}
      helperText={helperText}
      required={required}
      fullWidth
      autoComplete={autoComplete}
    />
  );
};
