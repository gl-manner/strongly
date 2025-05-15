// /imports/providers/AppProvider.jsx
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

// Create or use your existing App context
const AppContext = createContext(null);

// Enhanced App Provider with complete NobleUI functionality
export const AppProvider = ({ children }) => {
  // ===== NobleUI Sidebar & Layout State =====
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [config, setConfig] = useState(null);

  // Refs for DOM elements
  const sidebarRef = useRef(null);
  const sidebarBodyRef = useRef(null);
  const mainWrapperRef = useRef(null);

  // ===== NobleUI Initialization =====
  useEffect(() => {
    // Initialize NobleUI config with CSS variables
    initializeConfig();

    // Initialize feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }

    // Initialize Bootstrap components if available
    initializeBootstrapComponents();

    // Initialize PerfectScrollbar if available
    initializePerfectScrollbar();

    // Cleanup on unmount
    return () => {
      // Remove all body classes
      document.body.classList.remove(
        'sidebar-folded',
        'sidebar-open',
        'open-sidebar-folded',
        'overflow-hidden',
        'header-open'
      );
    };
  }, []);

  // Function to get CSS variable value
  const getCssVariableValue = (variableName) => {
    let hex = getComputedStyle(document.documentElement).getPropertyValue(variableName);
    if (hex && hex.length > 0) {
      hex = hex.trim();
    }
    return hex;
  };

  // Initialize NobleUI config with CSS variables
  const initializeConfig = () => {
    const configObject = {
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
      fontFamily: "'Roboto', Helvetica, sans-serif"
    };

    // Set config in state and in window for global access
    setConfig(configObject);
    window.config = configObject;
  };

  // Initialize Bootstrap tooltips and popovers
  const initializeBootstrapComponents = () => {
    try {
      // Check if Bootstrap is available
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
      }
    } catch (error) {
      console.warn('Bootstrap components initialization failed:', error);
    }
  };

  // Initialize PerfectScrollbar for sidebar
  const initializePerfectScrollbar = () => {
    try {
      if (typeof PerfectScrollbar !== 'undefined' && document.querySelector('.sidebar .sidebar-body')) {
        const sidebarBodyScroll = new PerfectScrollbar('.sidebar-body');
        return sidebarBodyScroll;
      }
    } catch (error) {
      console.warn('PerfectScrollbar initialization failed:', error);
    }
    return null;
  };

  // Check if device is mobile on initial load and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = window.matchMedia('(max-width: 991px)').matches;
      setIsMobile(isMobileDevice);

      // Remove classes on resize to prevent layout issues
      if (isMobileDevice) {
        document.body.classList.remove('sidebar-folded', 'open-sidebar-folded');
      } else {
        document.body.classList.remove('sidebar-open');
      }

      // Remove toggler active class
      const sidebarToggler = document.querySelector('.sidebar .sidebar-toggler');
      if (sidebarToggler) {
        sidebarToggler.classList.remove('active');
      }
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

  // ===== Sidebar Functionality =====

  // Toggle sidebar collapsed/expanded state
  const toggleSidebar = () => {
    const sidebarToggler = document.querySelector('.sidebar .sidebar-toggler');

    if (sidebarToggler) {
      sidebarToggler.classList.toggle('active');
    }

    if (window.matchMedia('(min-width: 992px)').matches) {
      // For desktop - toggle folded state
      document.body.classList.toggle('sidebar-folded');
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      // For mobile - toggle open state
      document.body.classList.toggle('sidebar-open');
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Handle sidebar mouse enter (expand on hover)
  const handleSidebarMouseEnter = () => {
    if (document.body.classList.contains('sidebar-folded')) {
      document.body.classList.add('open-sidebar-folded');
      setSidebarHovered(true);
    }
  };

  // Handle sidebar mouse leave (collapse after hover)
  const handleSidebarMouseLeave = () => {
    if (document.body.classList.contains('sidebar-folded')) {
      document.body.classList.remove('open-sidebar-folded');
      setSidebarHovered(false);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      const mainWrapper = document.querySelector('.main-wrapper');
      const sidebar = document.querySelector('.sidebar');

      if (e.target === mainWrapper &&
          document.body.classList.contains('sidebar-open') &&
          !e.target.closest('.sidebar') &&
          !e.target.closest('.sidebar-toggler')) {

        document.body.classList.remove('sidebar-open');

        const sidebarToggler = document.querySelector('.sidebar .sidebar-toggler');
        if (sidebarToggler) {
          sidebarToggler.classList.remove('active');
        }

        setSidebarCollapsed(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // ===== Active Menu Highlighting =====

  // Set active class for menu items
  const setActiveNavItem = (pathname) => {
    setTimeout(() => {
      const current = pathname.split("/").slice(-1)[0].replace(/^\/|\/$/g, '') || '';

      // Add active class to sidebar nav links
      const sidebarNavLinks = document.querySelectorAll('.sidebar .nav li a');
      sidebarNavLinks.forEach(navLink => {
        addActiveClass(navLink, current);
      });

      // Add active class to horizontal menu nav links if present
      const horizontalNavLinks = document.querySelectorAll('.horizontal-menu .nav li a');
      horizontalNavLinks.forEach(navLink => {
        addActiveClass(navLink, current);
      });
    }, 100);
  };

  // Helper function to add active class to nav links
  const addActiveClass = (element, current) => {
    try {
      // Get parents helper function
      const getParents = (el, selector) => {
        const parents = [];
        while ((el = el.parentNode) && el !== document) {
          if (!selector || el.matches(selector)) parents.push(el);
        }
        return parents;
      };

      // Get href attribute
      const href = element.getAttribute('href');
      if (!href) return;

      if (current === "") {
        // For root url
        if (href.indexOf("index.html") !== -1 || href === '/' || href.indexOf("/dashboard") !== -1) {
          const elParents = getParents(element, '.nav-item');
          if (elParents.length) {
            elParents[elParents.length - 1].classList.add('active');
          }

          if (getParents(element, '.sub-menu').length) {
            const collapse = element.closest('.collapse');
            if (collapse) {
              collapse.classList.add('show');
            }
            element.classList.add('active');
          }
        }
      } else {
        // For other urls
        if (href.indexOf(current) !== -1) {
          const elParents = getParents(element, '.nav-item');
          if (elParents.length) {
            elParents[elParents.length - 1].classList.add('active');
          }

          if (getParents(element, '.sub-menu').length) {
            const collapse = element.closest('.collapse');
            if (collapse) {
              collapse.classList.add('show');
            }
            element.classList.add('active');
          }

          if (getParents(element, '.submenu-item').length) {
            element.classList.add('active');
            const navItemActive = element.closest('.nav-item.active');
            if (navItemActive && element.closest('.nav-item.active .submenu')) {
              navItemActive.classList.add('show-submenu');
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error setting active nav item:', error);
    }
  };

  // ===== Clipboard Functionality =====

  // Initialize clipboard.js if available
  useEffect(() => {
    try {
      const clipboardButtons = document.querySelectorAll('.btn-clipboard');

      if (clipboardButtons.length && typeof ClipboardJS !== 'undefined') {
        clipboardButtons.forEach(btn => {
          btn.addEventListener('mouseover', function() {
            this.innerText = 'copy to clipboard';
          });

          btn.addEventListener('mouseout', function() {
            this.innerText = 'copy';
          });
        });

        const clipboard = new ClipboardJS('.btn-clipboard');

        clipboard.on('success', function(e) {
          e.trigger.innerHTML = 'copied';
          setTimeout(function() {
            e.trigger.innerHTML = 'copy';
            e.clearSelection();
          }, 300);
        });

        // Cleanup
        return () => {
          clipboard.destroy();
        };
      }
    } catch (error) {
      console.warn('Clipboard initialization failed:', error);
    }
  }, []);

  // ===== Horizontal Menu Functionality =====

  // Initialize horizontal menu functionality
  const initializeHorizontalMenu = () => {
    const horizontalMenu = document.querySelector('.horizontal-menu');

    if (horizontalMenu) {
      // Horizontal menu toggle button for mobile/tablet
      const horizontalMenuToggleButton = document.querySelector('[data-toggle="horizontal-menu-toggle"]');
      const bottomNavbar = document.querySelector('.horizontal-menu .bottom-navbar');

      if (horizontalMenuToggleButton && bottomNavbar) {
        horizontalMenuToggleButton.addEventListener('click', function() {
          bottomNavbar.classList.toggle('header-toggled');
          horizontalMenuToggleButton.classList.toggle('open');
          document.body.classList.toggle('header-open');
        });
      }

      // Horizontal menu nav-item click submenu show/hide on mobile/tablet
      if (window.matchMedia('(max-width: 991px)').matches) {
        const navItems = document.querySelectorAll('.horizontal-menu .page-navigation > .nav-item');

        navItems.forEach(function(navItem) {
          navItem.addEventListener('click', function() {
            if (!this.classList.contains('show-submenu')) {
              navItems.forEach(function(item) {
                item.classList.remove('show-submenu');
              });
            }
            this.classList.toggle('show-submenu');
          });
        });
      }

      // Horizontal menu fixed on scroll
      window.addEventListener('scroll', function() {
        if (window.matchMedia('(min-width: 992px)').matches) {
          if (window.scrollY >= 60) {
            horizontalMenu.classList.add('fixed-on-scroll');
          } else {
            horizontalMenu.classList.remove('fixed-on-scroll');
          }
        }
      });
    }
  };

  // Initialize horizontal menu on mount
  useEffect(() => {
    initializeHorizontalMenu();
  }, []);

  // ===== Additional Utility Functions =====

  // Reinitialize everything (useful after route changes or DOM updates)
  const reinitialize = () => {
    // Re-initialize feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }

    // Re-initialize other components
    initializeBootstrapComponents();
    initializePerfectScrollbar();

    // Get current pathname and set active nav item
    const pathname = window.location.pathname;
    setActiveNavItem(pathname);
  };

  // Force sidebar collapsed state
  const collapseSidebar = () => {
    if (!document.body.classList.contains('sidebar-folded')) {
      document.body.classList.add('sidebar-folded');
      setSidebarCollapsed(true);

      const sidebarToggler = document.querySelector('.sidebar .sidebar-toggler');
      if (sidebarToggler) {
        sidebarToggler.classList.add('active');
      }
    }
  };

  // Force sidebar expanded state
  const expandSidebar = () => {
    if (document.body.classList.contains('sidebar-folded')) {
      document.body.classList.remove('sidebar-folded');
      setSidebarCollapsed(false);

      const sidebarToggler = document.querySelector('.sidebar .sidebar-toggler');
      if (sidebarToggler) {
        sidebarToggler.classList.remove('active');
      }
    }
  };

  // ===== ADD YOUR EXISTING APP CONTEXT STATE AND FUNCTIONS HERE =====
  // This is where you would add all your existing app state and functions

  // Combine NobleUI functionality with your existing app context
  const value = {
    // NobleUI Config
    config,

    // NobleUI Sidebar State
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    sidebarHovered,

    // NobleUI Sidebar Functions
    toggleSidebar,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
    collapseSidebar,
    expandSidebar,

    // NobleUI Utilities
    reinitialize,
    setActiveNavItem,

    // Refs
    sidebarRef,
    sidebarBodyRef,
    mainWrapperRef,

    // Your existing app context values would go here
    // theme,
    // setTheme,
    // language,
    // setLanguage,
    // ... other values and functions
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
