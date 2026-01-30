/**
 * Validation utilities for form inputs
 */

// Email validation regex - comprehensive pattern
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Indian mobile number regex - 10 digits starting with 6-9
export const MOBILE_REGEX = /^[6-9]\d{9}$/;

// Username validation - alphanumeric with underscore, 3-20 chars
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Password validation - at least 6 chars
export const PASSWORD_MIN_LENGTH = 6;

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid email address (e.g., user@example.com)' 
    };
  }

  // Additional checks
  if (trimmedEmail.length > 100) {
    return { isValid: false, message: 'Email address is too long (max 100 characters)' };
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return { isValid: false, message: 'Email address cannot contain consecutive dots' };
  }

  // Check if email starts or ends with dot
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return { isValid: false, message: 'Email address cannot start or end with a dot' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate Indian mobile number
 * @param {string} mobile - Mobile number to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateMobile = (mobile) => {
  if (!mobile || typeof mobile !== 'string') {
    return { isValid: false, message: 'Mobile number is required' };
  }

  const trimmedMobile = mobile.trim();
  
  if (!trimmedMobile) {
    return { isValid: false, message: 'Mobile number is required' };
  }

  // Remove any non-digit characters
  const digitsOnly = trimmedMobile.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10) {
    return { isValid: false, message: 'Mobile number must be exactly 10 digits' };
  }

  if (!MOBILE_REGEX.test(digitsOnly)) {
    return { 
      isValid: false, 
      message: 'Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { isValid: false, message: 'Username is required' };
  }

  const trimmedUsername = username.trim();
  
  if (!trimmedUsername) {
    return { isValid: false, message: 'Username is required' };
  }

  if (trimmedUsername.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }

  if (trimmedUsername.length > 20) {
    return { isValid: false, message: 'Username must be less than 20 characters long' };
  }

  if (!USERNAME_REGEX.test(trimmedUsername)) {
    return { 
      isValid: false, 
      message: 'Username can only contain letters, numbers, and underscores' 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {string} confirmPassword - Confirm password to match
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validatePassword = (password, confirmPassword = null) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` 
    };
  }

  if (password.length > 100) {
    return { isValid: false, message: 'Password is too long (max 100 characters)' };
  }

  // Check for password match if confirm password is provided
  if (confirmPassword !== null && password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate name (first name, last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid: boolean, message: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, message: `${fieldName} is too long (max 50 characters)` };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate registration form data
 * @param {Object} formData - Form data object
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateRegistrationForm = (formData) => {
  const errors = [];

  // Validate first name
  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.push(firstNameValidation.message);
  }

  // Validate last name
  const lastNameValidation = validateName(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.push(lastNameValidation.message);
  }

  // Validate username
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.push(usernameValidation.message);
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.message);
  }

  // Validate mobile number
  const mobileValidation = validateMobile(formData.mobileNumber);
  if (!mobileValidation.isValid) {
    errors.push(mobileValidation.message);
  }

  // Validate password
  const passwordValidation = validatePassword(formData.password, formData.confirmPassword);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.message);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format mobile number input (only digits, max 10)
 * @param {string} value - Input value
 * @returns {string} Formatted value
 */
export const formatMobileInput = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Get email domain suggestions for common typos
 * @param {string} email - Email to check
 * @returns {Array} Array of suggestions
 */
export const getEmailSuggestions = (email) => {
  if (!email || !email.includes('@')) return [];
  
  const [localPart, domain] = email.split('@');
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  const suggestions = [];
  
  // Check for common typos
  const typoMap = {
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlook.co': 'outlook.com'
  };
  
  if (typoMap[domain]) {
    suggestions.push(`${localPart}@${typoMap[domain]}`);
  }
  
  // Check for partial matches
  commonDomains.forEach(commonDomain => {
    if (domain.length > 2 && commonDomain.startsWith(domain.toLowerCase())) {
      suggestions.push(`${localPart}@${commonDomain}`);
    }
  });
  
  return suggestions;
};
