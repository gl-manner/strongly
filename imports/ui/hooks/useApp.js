// /imports/ui/hooks/useApp.js
import React, { useState, useEffect, createContext, useContext } from 'react';

// Create App context
const AppContext = createContext(null);

// App Provider component
export const AppProvider = ({ children }) => {
  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [kubernetesSidebarActive, setKubernetesSidebarActive] = useState(false);

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

    // Add class for Kubernetes sidebar when active
    if (kubernetesSidebarActive) {
      document.body.classList.add('kubernetes-active');
    } else {
      document.body.classList.remove('kubernetes-active');
    }

    // Cleanup function for unmounting
    return () => {
      document.body.classList.remove('sidebar-folded', 'sidebar-open', 'kubernetes-active');
    };
  }, [sidebarCollapsed, isMobile, kubernetesSidebarActive]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarCollapsed &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.sidebar-toggler') &&
        !e.target.closest('.kubernetes-sidebar')
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

  // Functions to activate/deactivate the Kubernetes sidebar
  const activateKubernetesSidebar = () => {
    setKubernetesSidebarActive(true);
  };

  const deactivateKubernetesSidebar = () => {
    setKubernetesSidebarActive(false);
  };

  // Theme state
  const [theme, setTheme] = useState('light');

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.classList.toggle('dark-mode', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
  }, []);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Provide all app state and functions
  const value = {
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    isMobile,
    kubernetesSidebarActive,
    setKubernetesSidebarActive, // ✅ ADDED: Allow components to set this directly
    activateKubernetesSidebar,
    deactivateKubernetesSidebar,
    theme,
    toggleTheme,
    loading,
    setLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the App context
export const useApp = () => {
  const context = useContext(AppContext);

  // If no context is available, provide a dummy implementation
  if (!context) {
    console.warn(
      'useApp hook was called outside of AppProvider context. Using dummy implementation.'
    );

    // Return a dummy implementation that won't cause rendering errors
    return {
      sidebarCollapsed: false,
      setSidebarCollapsed: () => {},
      toggleSidebar: () => {
        console.warn('toggleSidebar called outside AppProvider context');
        // Still provide basic functionality
        if (window.matchMedia('(min-width: 992px)').matches) {
          document.body.classList.toggle('sidebar-folded');
        } else {
          document.body.classList.toggle('sidebar-open');
        }
      },
      isMobile: window.matchMedia('(max-width: 991px)').matches,
      kubernetesSidebarActive: false,
      setKubernetesSidebarActive: () => {},
      activateKubernetesSidebar: () => {},
      deactivateKubernetesSidebar: () => {},
      theme: 'light',
      toggleTheme: () => console.warn('toggleTheme called outside AppProvider context'),
      loading: false,
      setLoading: () => console.warn('setLoading called outside AppProvider context')
    };
  }

  return context;
};
