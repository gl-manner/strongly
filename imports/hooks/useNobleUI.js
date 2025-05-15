// imports/hooks/useNobleUI.js

import { useEffect, useState } from 'react';
import feather from 'feather-icons';

/**
 * Custom hook to manage NobleUI functionality
 * This hook encapsulates all NobleUI JS functionality as React hooks
 */
export const useNobleUI = () => {
  const [sidebarFolded, setSidebarFolded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize NobleUI config
  useEffect(() => {
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
      fontFamily: "'Roboto', Helvetica, sans-serif"
    };

    // Initialize feather icons
    feather.replace();

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

    // Cleanup function
    return () => {
      // Dispose tooltips and popovers on unmount to prevent memory leaks
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        const tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (tooltip) {
          tooltip.dispose();
        }
      });

      popoverTriggerList.forEach(popoverTriggerEl => {
        const popover = bootstrap.Popover.getInstance(popoverTriggerEl);
        if (popover) {
          popover.dispose();
        }
      });
    };
  }, []);

  // Handle sidebar toggle functionality
  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 992px)').matches) {
      setSidebarFolded(!sidebarFolded);
      document.body.classList.toggle('sidebar-folded');
    } else if (window.matchMedia('(max-width: 991px)').matches) {
      setSidebarOpen(!sidebarOpen);
      document.body.classList.toggle('sidebar-open');
    }
  };

  // Handle window resize to reset sidebar state
  useEffect(() => {
    const handleResize = () => {
      document.body.classList.remove('sidebar-folded', 'sidebar-open');
      setSidebarFolded(false);
      setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle sidebar hover effect for folded sidebar
  const handleSidebarMouseEnter = () => {
    if (sidebarFolded) {
      document.body.classList.add('open-sidebar-folded');
    }
  };

  const handleSidebarMouseLeave = () => {
    if (sidebarFolded) {
      document.body.classList.remove('open-sidebar-folded');
    }
  };

  // Add active class to nav links based on current URL
  useEffect(() => {
    const addActiveClass = (element) => {
      // Get current URL path
      const current = window.location.pathname.split("/").slice(-1)[0].replace(/^\/|\/$/g, '');

      // Get parents of the 'el' with a selector
      function getParents(el, selector) {
        const parents = [];
        while ((el = el.parentNode) && el !== document) {
          if (!selector || el.matches(selector)) parents.push(el);
        }
        return parents;
      }

      if (current === "") {
        // For root url
        if (element.getAttribute('href')?.indexOf("index.html") !== -1) {
          const elParents = getParents(element, '.nav-item');
          if (elParents.length) {
            elParents[elParents.length - 1].classList.add('active');
          }
          if (getParents(element, '.sub-menu').length) {
            element.closest('.collapse').classList.add('show');
            element.classList.add('active');
          }
        }
      } else {
        // For other urls
        if (element.getAttribute('href')?.indexOf(current) !== -1) {
          const elParents = getParents(element, '.nav-item');
          if (elParents.length) {
            elParents[elParents.length - 1].classList.add('active');
          }
          if (getParents(element, '.sub-menu').length) {
            element.closest('.collapse').classList.add('show');
            element.classList.add('active');
          }
          if (getParents(element, '.submenu-item').length) {
            element.classList.add('active');
            if (element.closest('.nav-item.active .submenu')) {
              element.closest('.nav-item.active').classList.add('show-submenu');
            }
          }
        }
      }
    };

    // Add active class to sidebar nav links
    const sidebarNavLinks = document.querySelectorAll('.sidebar .nav li a');
    sidebarNavLinks.forEach(navLink => {
      addActiveClass(navLink);
    });

    // Add active class to horizontal menu nav links
    const horizontalNavLinks = document.querySelectorAll('.horizontal-menu .nav li a');
    horizontalNavLinks.forEach(navLink => {
      addActiveClass(navLink);
    });
  }, []);

  // Function to initialize perfect scrollbar on an element
  const initPerfectScrollbar = (selector) => {
    useEffect(() => {
      if (typeof PerfectScrollbar !== 'undefined') {
        const element = document.querySelector(selector);
        if (element) {
          const ps = new PerfectScrollbar(element);

          return () => {
            ps.destroy();
          };
        }
      }
    }, [selector]);
  };

  // Initialize horizontal menu functionality
  const initHorizontalMenu = () => {
    useEffect(() => {
      const horizontalMenu = document.querySelector('.horizontal-menu');
      if (!horizontalMenu) return;

      // Handle scroll for fixed header
      const handleScroll = () => {
        if (window.matchMedia('(min-width: 992px)').matches) {
          if (window.scrollY >= 60) {
            horizontalMenu.classList.add('fixed-on-scroll');
          } else {
            horizontalMenu.classList.remove('fixed-on-scroll');
          }
        }
      };

      window.addEventListener('scroll', handleScroll);

      // Handle horizontal menu toggle for mobile/tablet
      const horizontalMenuToggleButton = document.querySelector('[data-toggle="horizontal-menu-toggle"]');
      const bottomNavbar = document.querySelector('.horizontal-menu .bottom-navbar');

      if (horizontalMenuToggleButton && bottomNavbar) {
        const toggleHorizontalMenu = () => {
          bottomNavbar.classList.toggle('header-toggled');
          horizontalMenuToggleButton.classList.toggle('open');
          document.body.classList.toggle('header-open');
        };

        horizontalMenuToggleButton.addEventListener('click', toggleHorizontalMenu);

        // Reset on resize
        const resetHorizontalMenu = () => {
          bottomNavbar.classList.remove('header-toggled');
          horizontalMenuToggleButton.classList.remove('open');
          document.body.classList.remove('header-open');
        };

        window.addEventListener('resize', resetHorizontalMenu);

        return () => {
          window.removeEventListener('scroll', handleScroll);
          horizontalMenuToggleButton.removeEventListener('click', toggleHorizontalMenu);
          window.removeEventListener('resize', resetHorizontalMenu);
        };
      }

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  };

  // Initialize clipboard functionality
  const initClipboard = () => {
    useEffect(() => {
      if (typeof ClipboardJS !== 'undefined') {
        const clipboardButtons = document.querySelectorAll('.btn-clipboard');

        if (clipboardButtons.length) {
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

          return () => {
            clipboard.destroy();
          };
        }
      }
    }, []);
  };

  // Handle backdrop click to close sidebar on mobile
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const mainWrapper = document.querySelector('.main-wrapper');
      const sidebar = document.querySelector('.sidebar');

      if (sidebar && e.target === mainWrapper && document.body.classList.contains('sidebar-open')) {
        document.body.classList.remove('sidebar-open');
        setSidebarOpen(false);
      }
    };

    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return {
    sidebarFolded,
    sidebarOpen,
    toggleSidebar,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
    initPerfectScrollbar,
    initHorizontalMenu,
    initClipboard
  };
};

export default useNobleUI;
