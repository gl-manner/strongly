// /imports/utils/client/themeService.js
/**
 * Theme service for handling theme switching
 */
export const ThemeService = {
  /**
   * Initialize theme from localStorage
   */
  initialize() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    }
  },

  /**
   * Enable dark mode
   */
  enableDarkMode() {
    // Add a dark stylesheet link element
    const darkStylesheet = document.createElement('link');
    darkStylesheet.rel = 'stylesheet';
    darkStylesheet.id = 'dark-stylesheet';
    darkStylesheet.href = '/assets/css/dark-style.css';
    document.head.appendChild(darkStylesheet);
    
    // Apply a class to the body for other styles
    document.body.classList.add('dark-mode');
    
    // Save preference
    localStorage.setItem('theme', 'dark');
  },

  /**
   * Disable dark mode
   */
  disableDarkMode() {
    // Remove the dark stylesheet if it exists
    const darkStylesheet = document.getElementById('dark-stylesheet');
    if (darkStylesheet) {
      darkStylesheet.remove();
    }
    
    // Remove the body class
    document.body.classList.remove('dark-mode');
    
    // Save preference
    localStorage.setItem('theme', 'light');
  },

  /**
   * Toggle between light and dark modes
   */
  toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
      this.disableDarkMode();
      return 'light';
    } else {
      this.enableDarkMode();
      return 'dark';
    }
  },

  /**
   * Get current theme
   */
  getCurrentTheme() {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  }
};