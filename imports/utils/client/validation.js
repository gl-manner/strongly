// /imports/utils/client/validation.js

/**
 * Email validation helper
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email) return false;

  // Basic email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      score: 0,
      isValid: false,
      feedback: 'Password is required'
    };
  }

  // Calculate score based on different criteria
  let score = 0;
  const feedback = [];

  // Length checks
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 25;
  }

  if (password.length >= 12) {
    score += 10;
  }

  // Complexity checks
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score += 15;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score += 15;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score += 15;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters');
  } else {
    score += 20;
  }

  // Normalize score to max 100
  score = Math.min(100, score);

  // Categorize strength
  let strength = 'very weak';
  if (score >= 80) strength = 'very strong';
  else if (score >= 60) strength = 'strong';
  else if (score >= 40) strength = 'medium';
  else if (score >= 20) strength = 'weak';

  return {
    score,
    isValid: score >= 40, // Consider medium or better to be valid
    strength,
    feedback: feedback.length > 0 ? feedback : []
  };
};

/**
 * URL validation helper
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Phone number validation helper
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;

  // Remove all non-digits
  const cleaned = ('' + phone).replace(/\D/g, '');

  // Check length (most phone numbers are 10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Form field validation helper
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules
 * @returns {Object} Object with errors and isValid flag
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  // Process each field according to its rules
  Object.keys(rules).forEach(fieldName => {
    const value = formData[fieldName];
    const fieldRules = rules[fieldName];

    // Required check
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[fieldName] = fieldRules.required === true
        ? 'This field is required'
        : fieldRules.required;
      return;
    }

    // Type checks
    if (value && fieldRules.type) {
      switch (fieldRules.type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors[fieldName] = 'Please enter a valid email address';
          }
          break;
        case 'url':
          if (!isValidUrl(value)) {
            errors[fieldName] = 'Please enter a valid URL';
          }
          break;
        case 'phone':
          if (!isValidPhone(value)) {
            errors[fieldName] = 'Please enter a valid phone number';
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors[fieldName] = 'Please enter a valid number';
          }
          break;
      }
    }

    // Min length check
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[fieldName] = `Must be at least ${fieldRules.minLength} characters`;
    }

    // Max length check
    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[fieldName] = `Cannot exceed ${fieldRules.maxLength} characters`;
    }

    // Pattern check
    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[fieldName] = fieldRules.message || 'Invalid format';
    }

    // Min/max value checks for numbers
    if (value && fieldRules.type === 'number') {
      const numValue = Number(value);

      if (fieldRules.min !== undefined && numValue < fieldRules.min) {
        errors[fieldName] = `Value must be at least ${fieldRules.min}`;
      }

      if (fieldRules.max !== undefined && numValue > fieldRules.max) {
        errors[fieldName] = `Value cannot exceed ${fieldRules.max}`;
      }
    }

    // Custom validation function
    if (value && fieldRules.validate) {
      const customError = fieldRules.validate(value, formData);
      if (customError) {
        errors[fieldName] = customError;
      }
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Examples of validation rules
 *
 * const rules = {
 *   name: {
 *     required: true,
 *     minLength: 2,
 *     maxLength: 50
 *   },
 *   email: {
 *     required: true,
 *     type: 'email'
 *   },
 *   password: {
 *     required: true,
 *     minLength: 8,
 *     validate: (value) => {
 *       const result = validatePassword(value);
 *       return result.isValid ? null : 'Password is not strong enough';
 *     }
 *   },
 *   confirmPassword: {
 *     required: true,
 *     validate: (value, formData) => value === formData.password
 *       ? null
 *       : 'Passwords do not match'
 *   }
 * };
 *
 * Usage:
 * const { errors, isValid } = validateForm(formData, rules);
 */

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty, false otherwise
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';

  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
