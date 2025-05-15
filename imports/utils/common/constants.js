// /imports/utils/common/constants.js

/**
 * Application Constants
 */

// App Information
export const APP_NAME = 'Strongly.AI';
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@strongly.ai';

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive'
};

// User Approval Status
export const APPROVAL_STATUS = {
  APPROVED: true,
  PENDING: false
};

// Form Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 50,
  MAX_BIO_LENGTH: 500
};

// FAQ Categories
export const FAQ_CATEGORIES = [
  {
    id: 'general',
    name: 'General',
    icon: 'info'
  },
  {
    id: 'account',
    name: 'Account',
    icon: 'user'
  },
  {
    id: 'features',
    name: 'Features',
    icon: 'package'
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: 'settings'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: 'credit-card'
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'help-circle'
  }
];

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  MEDIUM: 'MMM D, YYYY',
  LONG: 'MMMM D, YYYY',
  WITH_TIME: 'MMM D, YYYY h:mm A'
};

// API Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'strongly_auth_token',
  USER_PREFERENCES: 'strongly_user_prefs',
  THEME: 'strongly_theme'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Notification Display Duration (in ms)
export const NOTIFICATION_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  USERS: {
    GET: '/api/users',
    UPDATE: '/api/users/update',
    DELETE: '/api/users/delete',
    APPROVE: '/api/users/approve'
  },
  FAQ: {
    GET: '/api/faq',
    CREATE: '/api/faq/create',
    UPDATE: '/api/faq/update',
    DELETE: '/api/faq/delete'
  }
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  FAQ: '/faq',
  ADMIN: {
    USERS: '/admin/users',
    FAQ: '/admin/faq',
    SETTINGS: '/admin/settings'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  ACCOUNT_NOT_FOUND: 'Account not found. Please check your credentials.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  ACCOUNT_NOT_APPROVED: 'Your account is pending approval.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully.',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Registration successful! Please check your email to verify your account.',
  PASSWORD_RESET_EMAIL: 'Password reset instructions have been sent to your email.',
  PASSWORD_RESET: 'Your password has been reset successfully.',
  PROFILE_UPDATE: 'Profile updated successfully.',
  ACCOUNT_APPROVED: 'Account approved successfully.',
  FAQ_CREATED: 'FAQ created successfully.',
  FAQ_UPDATED: 'FAQ updated successfully.',
  FAQ_DELETED: 'FAQ deleted successfully.'
};

// Export all constants as a single object
export default {
  APP_NAME,
  APP_VERSION,
  SUPPORT_EMAIL,
  ROLES,
  USER_STATUS,
  APPROVAL_STATUS,
  VALIDATION,
  FAQ_CATEGORIES,
  PAGINATION,
  DATE_FORMATS,
  STATUS_CODES,
  STORAGE_KEYS,
  THEMES,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
