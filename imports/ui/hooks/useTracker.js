// /imports/hooks/useTracker.js
import { useTracker as meteorUseTracker } from 'meteor/react-meteor-data';
import { useState, useEffect } from 'react';

/**
 * Enhanced useTracker hook with error handling and loading state
 * Designed to work with Meteor 3's async operations
 *
 * @param {Function} trackerFn - Tracker function that returns the tracked data
 * @param {Array} deps - Dependency array for the tracker function
 * @param {Object} options - Options for the tracker function
 * @returns {Object} Object with tracked data, loading state, and error state
 */
export const useTracker = (trackerFn, deps = [], options = {}) => {
  const [error, setError] = useState(null);

  // Default options
  const {
    onError = (e) => console.error('Tracker error:', e),
    defaultValue = {}
  } = options;

  // Create a wrapper for the tracker function to handle errors
  const errorHandlingTrackerFn = () => {
    try {
      setError(null);
      return trackerFn();
    } catch (e) {
      setError(e);
      onError(e);
      return defaultValue;
    }
  };

  // Use the Meteor useTracker hook with our error handling wrapper
  const result = meteorUseTracker(errorHandlingTrackerFn, deps);

  // Return the result with error state
  return {
    ...result,
    error
  };
};
