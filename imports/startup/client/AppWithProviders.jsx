// This file creates a component that wraps your app with all the necessary providers

import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppProvider } from '/imports/hooks/useApp';
import { NotificationProvider } from '/imports/ui/contexts/NotificationContext';
import { AuthProvider } from '/imports/ui/contexts/AuthContext';

/**
 * App providers wrapper component
 * This wraps the application with all necessary context providers
 * Providers should be nested in order from most global to most specific
 */
export const AppWithProviders = () => {
  return (
    <AppProvider>
      <NotificationProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </NotificationProvider>
    </AppProvider>
  );
};

export default AppWithProviders;