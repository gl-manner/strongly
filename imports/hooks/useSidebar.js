// /imports/hooks/useSidebar.js
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar states and behaviors
 * based on NobleUI sidebar functionality
 */
export const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Toggle sidebar collapsed/expanded state
  const toggleSidebar = () => {
    if (window.matchMedia('(min-width: 992px)').matches) {
      // For desktop - toggle folded state
      setCollapsed(!collapsed);
    } else {
      // For mobile - toggle open state
      setOpen(!open);
    }
  };

  // Handle sidebar hover (for folded state)
  const handleSidebarMouseEnter = () => {
    if (collapsed) {
      setHovering(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (collapsed) {
      setHovering(false);
    }
  };

  // Handle window resize to reset sidebar states
  useEffect(() => {
    const handleResize = () => {
      // Reset sidebar states on window resize
      if (window.matchMedia('(min-width: 992px)').matches && open) {
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  // Handle click outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close sidebar when clicked outside on mobile
      if (window.matchMedia('(max-width: 991px)').matches &&
          open &&
          !e.target.closest('.sidebar') &&
          !e.target.closest('.sidebar-toggler')) {
        setOpen(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Determine sidebar CSS classes based on states
  const sidebarClasses = () => {
    let classes = 'sidebar';

    if (collapsed) classes += ' sidebar-folded';
    if (open) classes += ' sidebar-open';
    if (hovering && collapsed) classes += ' open-sidebar-folded';

    return classes;
  };

  return {
    collapsed,
    open,
    hovering,
    toggleSidebar,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
    sidebarClasses
  };
};
