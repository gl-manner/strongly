// client/main.jsx
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from '/imports/startup/client/routes';
import feather from 'feather-icons';
import { ThemeService } from '/imports/utils/client/themeService';

// Import the AppProvider
import { AppProvider } from '/imports/hooks/useApp';
// Import NotificationProvider if using notifications
import { NotificationProvider } from '/imports/ui/contexts/NotificationContext';
// Import AuthProvider if using auth context
import { AuthProvider } from '/imports/ui/contexts/AuthContext';

// Import main styles
import './main.scss';

Meteor.startup(() => {
  // Initialize the theme based on user preference
  ThemeService.initialize();

  const container = document.getElementById('react-target');
  const root = createRoot(container);

  // Render the app with RouterProvider
  // The providers are now integrated in the router itself
  root.render(
    <RouterProvider router={router} />
  );

  // Initialize feather icons
  feather.replace();

  // Initialize tooltips and popovers (Bootstrap)
  const enableTooltipsAndPopovers = () => {
    // Need to wait for Bootstrap to load
    if (typeof bootstrap !== 'undefined') {
      // Initialize tooltips
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
      // Initialize popovers
      const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
      popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
      });
    } else {
      // Retry after a delay if bootstrap isn't loaded yet
      setTimeout(enableTooltipsAndPopovers, 500);
    }
  };

  // Initialize tooltips and popovers
  enableTooltipsAndPopovers();

  // Set up global NobleUI config
  const setupNobleUIConfig = () => {
    // Root css-variable value getter
    const getCssVariableValue = (variableName) => {
      let hex = getComputedStyle(document.documentElement).getPropertyValue(variableName);
      if (hex && hex.length > 0) {
        hex = hex.trim();
      }
      return hex;
    };

    // Global variables for NobleUI
    window.config = {
      colors: {
        primary: getCssVariableValue('--bs-primary'),
        secondary: getCssVariableValue('--bs-secondary'),
        success: getCssVariableValue('--bs-success'),
        info: getCssVariableValue('--bs-info'),
        warning: getCssVariableValue('--bs-warning'),
        danger: getCssVariableValue('--bs-danger'),
        light: getCssVariableValue('--bs-light'),
        dark: getCssVariableValue('--bs-dark'),
        gridBorder: "rgba(77, 138, 240, .15)",
      },
      fontFamily: "'Inter', 'Roboto', Helvetica, sans-serif"
    };
  };

  // Setup NobleUI config
  setupNobleUIConfig();

  // Handle layout-specific behaviors that may not be covered by React components
  document.addEventListener('DOMContentLoaded', () => {
    // This ensures any dynamic content added after initial render still gets feather icons
    const observer = new MutationObserver(() => {
      feather.replace();
    });

    // Watch for changes in the entire document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
});
