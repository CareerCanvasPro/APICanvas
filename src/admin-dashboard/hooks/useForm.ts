import { useState, useCallback } from 'react';

interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Record<keyof T, string> | null;
}

export function useForm<T extends Record<string, any>>({ 
  initialValues, 
  onSubmit, 
  validate 
}: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((
    field: keyof T,
    value: any
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => prev ? { ...prev, [field]: '' } : null);
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  }, [values, validate, onSubmit]);

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setValues
  };
}