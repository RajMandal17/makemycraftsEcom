import { useState, useCallback, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldTouched: (name: keyof T, isTouched: boolean) => void;
  resetForm: () => void;
  isValid: boolean;
}


export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  
  const validateForm = useCallback(() => {
    if (!options.validate) return {};
    
    const validationErrors = options.validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, options]);
  
  
  const isValid = Object.keys(errors).length === 0;

  
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  
  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  
  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    
    const touchedFields = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    
    setTouched(touchedFields);
    
    
    const validationErrors = validateForm();
    
    
    if (Object.keys(validationErrors).length === 0 && options.onSubmit) {
      options.onSubmit(values);
    }
  }, [values, options, validateForm]);

  
  const resetForm = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setTouched({});
  }, [options.initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm,
    isValid,
  };
}
