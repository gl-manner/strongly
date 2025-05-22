// /imports/hooks/useMethod.js
import { useState, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import { useNotification } from './useNotification';

/**
 * Custom hook for Meteor method calls with loading and error states
 * Supports Meteor 3's async methods pattern
 *
 * @param {string} methodName - Name of the Meteor method to call
 * @param {Object} options - Options for method call handling
 * @returns {Object} Object with call function, loading state, and error state
 */
export const useMethod = (methodName, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notification = useNotification();

  /**
   * Call the Meteor method with the provided arguments
   * Uses Meteor.callAsync for Meteor 3 compatibility
   */
  const call = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Use Meteor.callAsync for Meteor 3
      const result = await Meteor.callAsync(methodName, ...args);

      // Show success notification if enabled in options
      if (options.successMessage) {
        notification.success(options.successMessage);
      }

      return result;
    } catch (err) {
      setError(err);

      // Show error notification if enabled in options
      if (options.errorMessage) {
        notification.error(options.errorMessage);
      } else if (err.message && options.showErrorNotification !== false) {
        notification.error(err.message);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [methodName, notification, options]);

  return { call, loading, error };
};
