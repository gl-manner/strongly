// /imports/hooks/useSubscription.js
import { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';

/**
 * Custom hook for Meteor subscriptions
 * Works with Meteor 3's asynchronous publications
 *
 * @param {string} subscriptionName - Name of the subscription
 * @param {...any} args - Arguments to pass to the subscription
 * @returns {Object} Object with isReady and error states
 */
export const useSubscription = (subscriptionName, ...args) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    try {
      // Create subscription with callbacks
      subscription = Meteor.subscribe(subscriptionName, ...args, {
        onReady: () => setIsReady(true),
        onError: (error) => setError(error)
      });
    } catch (err) {
      setError(err);
      console.error(`Error in subscription ${subscriptionName}:`, err);
    }

    // Clean up subscription when component unmounts
    // or when dependencies change
    return () => {
      if (subscription) {
        subscription.stop();
      }
    };
  }, [subscriptionName, ...args]);

  return { isReady, error };
};
