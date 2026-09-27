import { UseFormRegister, FieldError, FieldValues, Path } from 'react-hook-form';
import { Input } from '../atoms/Input';

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  register: UseFormRegister<TFieldValues>;
  helperText?: string;
  required?: boolean;
  autoComplete?: string;
}

export const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  error,
  register,
  helperText,
  required = false,
  autoComplete,
}: FormFieldProps<TFieldValues>) => {
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
