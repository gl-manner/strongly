// /imports/ui/contexts/ThemeContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      enableDarkMode();
    }
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      // Switch to dark mode
      enableDarkMode();
      localStorage.setItem('theme', 'dark');
    } else {
      // Switch to light mode
      disableDarkMode();
      localStorage.setItem('theme', 'light');
    }
  };

  // Enable dark mode by adding the CSS file dynamically
  const enableDarkMode = () => {
    // Remove the light theme CSS if present
    const lightStylesheet = document.getElementById('light-stylesheet');
    if (lightStylesheet) {
      lightStylesheet.disabled = true;
    }

    // Add the dark theme CSS if it doesn't exist
    let darkStylesheet = document.getElementById('dark-stylesheet');
    if (!darkStylesheet) {
      darkStylesheet = document.createElement('link');
      darkStylesheet.id = 'dark-stylesheet';
      darkStylesheet.rel = 'stylesheet';
      darkStylesheet.href = '/assets/css/dark-style.css';
      document.head.appendChild(darkStylesheet);
    } else {
      darkStylesheet.disabled = false;
    }

    // Add dark-mode class to body
    document.body.classList.add('dark-mode');
  };

  // Disable dark mode
  const disableDarkMode = () => {
    // Enable light theme CSS
    const lightStylesheet = document.getElementById('light-stylesheet');
    if (lightStylesheet) {
      lightStylesheet.disabled = false;
    }

    // Disable dark theme CSS
    const darkStylesheet = document.getElementById('dark-stylesheet');
    if (darkStylesheet) {
      darkStylesheet.disabled = true;
    }

    // Remove dark-mode class from body
    document.body.classList.remove('dark-mode');
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing the theme
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};