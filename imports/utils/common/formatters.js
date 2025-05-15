// /imports/utils/common/formatters.js

/**
 * Format a date to a readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const dateObj = new Date(date);

  // If date is invalid, return empty string
  if (isNaN(dateObj.getTime())) return '';

  const {
    format = 'default',
    includeTime = false
  } = options;

  // Date and time formatting options
  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  // Format based on specified format type
  switch (format) {
    case 'short':
      dateOptions.month = 'numeric';
      break;
    case 'long':
      dateOptions.month = 'long';
      dateOptions.weekday = 'long';
      break;
    case 'numeric':
      dateOptions.month = 'numeric';
      dateOptions.year = '2-digit';
      break;
    // default format uses the default options
  }

  // Include time if requested
  if (includeTime) {
    return dateObj.toLocaleString(undefined, { ...dateOptions, ...timeOptions });
  }

  return dateObj.toLocaleDateString(undefined, dateOptions);
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format a number with commas
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '';

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

/**
 * Format a file size in bytes to a human-readable string
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return '';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format a phone number to a standard format
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  // Remove all non-digits
  const cleaned = ('' + phone).replace(/\D/g, '');

  // Check if number is valid
  if (cleaned.length < 10) return phone;

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
  }

  // If doesn't match expected formats, return as is
  return phone;
};

/**
 * Convert a string to title case
 * @param {string} text - Text to convert
 * @returns {string} Title case text
 */
export const toTitleCase = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Pluralize a word based on count
 * @param {string} singular - Singular form of the word
 * @param {string} plural - Plural form of the word
 * @param {number} count - Count to determine pluralization
 * @returns {string} Pluralized word
 */
export const pluralize = (singular, plural, count) => {
  return count === 1 ? singular : plural;
};

/**
 * Format a value as a percentage
 * @param {number} value - Value to format (e.g., 0.25 for 25%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '';

  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format a time duration in seconds
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Calculate time elapsed since a given date
 * @param {Date|string|number} date - Date to calculate from
 * @returns {string} Elapsed time description (e.g., "2 days ago")
 */
export const timeAgo = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);

  // If date is invalid, return empty string
  if (isNaN(dateObj.getTime())) return '';

  const now = new Date();
  const seconds = Math.floor((now - dateObj) / 1000);

  // Time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  let counter;
  let intervalType;

  for (const [key, value] of Object.entries(intervals)) {
    counter = Math.floor(seconds / value);

    if (counter > 0) {
      intervalType = key;
      break;
    }
  }

  // Add 's' for plural
  if (counter !== 1) {
    intervalType += 's';
  }

  return `${counter} ${intervalType} ago`;
};

/**
 * Truncate a string with ellipsis if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + '...';
};
