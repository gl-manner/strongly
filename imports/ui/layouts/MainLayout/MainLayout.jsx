import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import KubernetesSidebar from '../../pages/kubernetes/components/KubernetesSidebar/KubernetesSidebar';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { useApp } from '../../hooks/useApp';
import feather from 'feather-icons';
import './MainLayout.scss';

/**
 * MainLayout component that incorporates NobleUI layout structure
 * This layout includes the sidebar, navbar, footer, and content area
 * It handles the conditional rendering of the main vs Kubernetes sidebar
 * Now both sidebars follow the same NobleUI patterns for consistency
 */
export const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to manage which sidebar is active
  const [showKubernetesSidebar, setShowKubernetesSidebar] = useState(false);

  // Check if we're in the Kubernetes section based on the URL path
  useEffect(() => {
    const isKubernetesPath = location.pathname.startsWith('/kubernetes');
    setShowKubernetesSidebar(isKubernetesPath);
  }, [location.pathname]);

  // Initialize feather icons when component mounts or when active sidebar changes
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
  }, [showKubernetesSidebar]);

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
  }, [showKubernetesSidebar]);

  // Handle navigation to Kubernetes section
  const handleKubernetesNavigate = () => {
    setShowKubernetesSidebar(true);
    navigate('/kubernetes/dashboard');
  };

  return (
    <div className="main-wrapper">
      {/* Conditionally render either main sidebar or Kubernetes sidebar */}
      {!showKubernetesSidebar ? (
        <Sidebar onKubernetesNavigate={handleKubernetesNavigate} />
      ) : (
        <KubernetesSidebar />
      )}

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