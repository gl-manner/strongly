// /imports/ui/contexts/NotificationContext.jsx
import React, { createContext, useState } from 'react';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notifications after timeout unless specified
    if (notification.timeout !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.timeout || 5000);
    }

    return id;
  };

  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Helper methods for common notifications
  const success = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      ...options
    });
  };

  const error = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      ...options
    });
  };

  const info = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      ...options
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
