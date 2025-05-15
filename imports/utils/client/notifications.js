// /imports/utils/client/notifications.js
import { NotificationContext } from '/imports/ui/contexts/NotificationContext';
import { useContext } from 'react';

/**
 * Get notification methods from context
 * @returns {Object} Notification methods
 */
export const useNotifications = () => {
  return useContext(NotificationContext);
};

/**
 * Show a success notification
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
export const showSuccess = (message, options = {}) => {
  const notifications = useNotifications();
  notifications.success(message, options);
};

/**
 * Show an error notification
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
export const showError = (message, options = {}) => {
  const notifications = useNotifications();
  notifications.error(message, options);
};

/**
 * Show an info notification
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
export const showInfo = (message, options = {}) => {
  const notifications = useNotifications();
  notifications.info(message, options);
};

/**
 * Show a warning notification
 * @param {string} message - Notification message
 * @param {Object} options - Additional options
 */
export const showWarning = (message, options = {}) => {
  const notifications = useNotifications();
  notifications.warning(message, options);
};

/**
 * Extract error message from a Meteor error
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
export const extractErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // Meteor errors have a 'reason' property
  if (error.reason) return error.reason;

  // Check for network errors
  if (error.message && error.message.includes('Network request failed')) {
    return 'Network error. Please check your connection.';
  }

  // Default to standard error message
  return error.message || 'An unknown error occurred';
};

/**
 * Handle method errors and show appropriate notifications
 * @param {Error} error - Error object
 * @param {Object} options - Options for handling the error
 */
export const handleMethodError = (error, options = {}) => {
  const {
    defaultMessage = 'An error occurred',
    showNotification = true,
    logError = true
  } = options;

  // Extract error message
  const errorMessage = extractErrorMessage(error) || defaultMessage;

  // Log error if enabled
  if (logError) {
    console.error('Method error:', error);
  }

  // Show notification if enabled
  if (showNotification) {
    showError(errorMessage);
  }

  return errorMessage;
};

/**
 * Create a notification handler for Meteor methods
 * @param {Function} methodCall - Meteor method call function
 * @param {Object} options - Options for the handler
 * @returns {Promise} Promise that resolves to the method result
 */
export const withNotifications = async (methodCall, options = {}) => {
  const {
    successMessage,
    errorMessage,
    showSuccess: displaySuccess = !!successMessage,
    showError: displayError = true,
    logError = true
  } = options;

  try {
    const result = await methodCall();

    // Show success notification if enabled
    if (displaySuccess && successMessage) {
      showSuccess(successMessage);
    }

    return result;
  } catch (error) {
    // Handle error with notifications
    handleMethodError(error, {
      defaultMessage: errorMessage || 'An error occurred',
      showNotification: displayError,
      logError
    });

    // Re-throw the error so caller can handle it
    throw error;
  }
};

// Export a singleton for direct usage without React context
export const Notifications = {
  // These methods require manual setup with a notification system
  // and are primarily for use in non-React contexts

  /**
   * Set notification handler functions
   * @param {Object} handlers - Handler functions
   */
  setHandlers: (handlers) => {
    Notifications._handlers = handlers;
  },

  /**
   * Show a success notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  success: (message, options = {}) => {
    if (Notifications._handlers?.success) {
      Notifications._handlers.success(message, options);
    } else {
      console.log('Success:', message);
    }
  },

  /**
   * Show an error notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  error: (message, options = {}) => {
    if (Notifications._handlers?.error) {
      Notifications._handlers.error(message, options);
    } else {
      console.error('Error:', message);
    }
  },

  /**
   * Show an info notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  info: (message, options = {}) => {
    if (Notifications._handlers?.info) {
      Notifications._handlers.info(message, options);
    } else {
      console.info('Info:', message);
    }
  },

  /**
   * Show a warning notification
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   */
  warning: (message, options = {}) => {
    if (Notifications._handlers?.warning) {
      Notifications._handlers.warning(message, options);
    } else {
      console.warn('Warning:', message);
    }
  }
};
