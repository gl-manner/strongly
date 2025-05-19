// /imports/ui/components/common/ThemeToggle/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';
import { ThemeService } from '/imports/utils/client/themeService';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize component state based on current theme
  useEffect(() => {
    setIsDarkMode(ThemeService.getCurrentTheme() === 'dark');
  }, []);
  
  // Initialize feather icons after render
  useEffect(() => {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    const newTheme = ThemeService.toggleTheme();
    setIsDarkMode(newTheme === 'dark');
  };

  return (
    <div className="theme-toggle">
      <button 
        className="btn btn-link p-0 theme-toggle-btn" 
        onClick={handleToggleTheme}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <i data-feather="sun" className="icon-md"></i>
        ) : (
          <i data-feather="moon" className="icon-md"></i>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;