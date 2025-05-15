// /imports/ui/layouts/MainLayout/MainLayout.jsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import feather from 'feather-icons';
import './MainLayout.scss';

/**
 * MainLayout component that incorporates NobleUI layout structure
 * This layout includes the sidebar, navbar, footer, and content area
 */
export const MainLayout = () => {
  // Initialize feather icons when component mounts or updates
  useEffect(() => {
    // Initialize feather icons
    feather.replace();

    // Add a MutationObserver to watch for DOM changes and reinitialize feather icons
    const observer = new MutationObserver(() => {
      feather.replace();
    });

    // Watch for changes in the entire document body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize perfect scrollbar for sidebar
  useEffect(() => {
    if (typeof PerfectScrollbar !== 'undefined') {
      const sidebarBodyEl = document.querySelector('.sidebar .sidebar-body');
      if (sidebarBodyEl) {
        const ps = new PerfectScrollbar(sidebarBodyEl);
        // Cleanup on unmount
        return () => {
          ps.destroy();
        };
      }
    }
  }, []);

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div className="page-wrapper">
        <Navbar />
        <div className="page-content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
