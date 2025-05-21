// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password (at least 8 chars, includes uppercase, lowercase, and number)
export const isStrongPassword = (password) => {
  // Not requiring strong password for demo
  return password.length >= 8;
  // For production, use a stronger validation like:
  // const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  // return passwordRegex.test(password);
};

// Validate username (alphanumeric, 3-20 chars)
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Validate form schema
export const validateForm = (formData, schema) => {
  const errors = {};

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = formData[field];

    // Check required
    if (rules.required && !value) {
      errors[field] = `${rules.label || field} is required`;
      return; // Skip other validations if required and empty
    }

    // Check min length
    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
    }

    // Check max length
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[field] = `${rules.label || field} must be less than ${rules.maxLength} characters`;
    }

    // Check email format
    if (rules.isEmail && value && !isValidEmail(value)) {
      errors[field] = `${rules.label || field} must be a valid email address`;
    }

    // Check password strength
    if (rules.isStrongPassword && value && !isStrongPassword(value)) {
      errors[field] = `${rules.label || field} must be at least 8 characters`;
    }

    // Check username format
    if (rules.isUsername && value && !isValidUsername(value)) {
      errors[field] = `${rules.label || field} must be 3-20 alphanumeric characters or underscores`;
    }

    // Check match with another field
    if (rules.match && formData[rules.match] !== value) {
      errors[field] = `${rules.label || field} doesn't match ${rules.matchLabel || rules.match}`;
    }

    // Custom validator
    if (rules.validator && value) {
      const validatorResult = rules.validator(value, formData);
      if (validatorResult !== true) {
        errors[field] = validatorResult;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 