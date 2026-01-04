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

/**
 * A custom hook for handling form state and validation
 * @param options Configuration options for the form
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  // Run validation
  const validateForm = useCallback(() => {
    if (!options.validate) return {};
    
    const validationErrors = options.validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [values, options]);
  
  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Handle input changes
  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Set a field value programmatically
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle input blur (for marking fields as touched)
  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  // Set a field as touched programmatically
  const setFieldTouched = useCallback((name: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const touchedFields = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    
    setTouched(touchedFields);
    
    // Validate form
    const validationErrors = validateForm();
    
    // If there are no errors and onSubmit is provided, call it
    if (Object.keys(validationErrors).length === 0 && options.onSubmit) {
      options.onSubmit(values);
    }
  }, [values, options, validateForm]);

  // Reset the form to initial values
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
