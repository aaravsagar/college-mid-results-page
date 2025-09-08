import { useState } from 'react';

export function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return '';
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));

    return isValid;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset
  };
}

// Common validation rules
export const validationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return '';
  },
  
  minLength: (min) => (value) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return '';
  },
  
  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return '';
  },
  
  number: (value) => {
    if (value && isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    return '';
  },
  
  positiveNumber: (value) => {
    if (value && (isNaN(Number(value)) || Number(value) < 0)) {
      return 'Must be a positive number';
    }
    return '';
  },
  
  maxValue: (max) => (value) => {
    if (value && Number(value) > max) {
      return `Must be no more than ${max}`;
    }
    return '';
  },
  
  minValue: (min) => (value) => {
    if (value && Number(value) < min) {
      return `Must be at least ${min}`;
    }
    return '';
  }
};