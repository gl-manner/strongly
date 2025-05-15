// /imports/ui/contexts/AppContext.jsx
import React, { createContext, useState } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    sidebarCollapsed,
    theme,
    loading,
    toggleSidebar,
    toggleTheme,
    setLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
