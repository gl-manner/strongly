// /imports/hooks/useApp.js
import { useState, useEffect, createContext, useContext } from 'react';

// Create App context
const AppContext = createContext(null);

// App Provider component
export const AppProvider = ({ children }) => {
  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  // Update mobile state on window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 991px)').matches);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Apply body classes based on sidebar state
  useEffect(() => {
    if (isMobile) {
      // For mobile devices
      document.body.classList.toggle('sidebar-open', sidebarCollapsed);
    } else {
      // For desktop devices
      document.body.classList.toggle('sidebar-folded', sidebarCollapsed);
    }

    // Cleanup function for unmounting
    return () => {
      document.body.classList.remove('sidebar-folded', 'sidebar-open');
    };
  }, [sidebarCollapsed, isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarCollapsed &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.sidebar-toggler')
      ) {
        setSidebarCollapsed(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarCollapsed, isMobile]);

  // Provide all app state and functions
  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    isMobile
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the App context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
