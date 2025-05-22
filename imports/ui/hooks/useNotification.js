// /imports/hooks/useNotification.js
import { useContext } from 'react';
import { NotificationContext } from '/imports/ui/contexts/NotificationContext';

/**
 * Custom hook for notifications
 * @returns {Object} Notification methods
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    // If no context is available, provide a fallback implementation
    // This avoids errors when the hook is used outside the NotificationProvider
    return {
      notifications: [],
      addNotification: () => console.warn('NotificationContext not found'),
      removeNotification: () => console.warn('NotificationContext not found'),
      success: (message) => console.log('Success:', message),
      error: (message) => console.error('Error:', message),
      info: (message) => console.info('Info:', message),
      warning: (message) => console.warn('Warning:', message)
    };
  }

  return context;
};
