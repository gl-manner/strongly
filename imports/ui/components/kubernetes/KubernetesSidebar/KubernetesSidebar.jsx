import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useApp } from '/imports/hooks/useApp';
import feather from 'feather-icons';
import './KubernetesSidebar.scss';

/**
 * Kubernetes specific sidebar that appears when Kubernetes section is active
 * This sidebar contains links to different Kubernetes management screens
 */
const KubernetesSidebar = () => {
  const location = useLocation();
  const { user, isAdmin } = useTracker(() => {
    const user = Meteor.user();
    return {
      user,
      isAdmin: user && Roles.userIsInRole(user._id, 'admin')
    };
  }, []);

  const { sidebarCollapsed, toggleSidebar } = useApp();

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Determine active menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Determine if path is part of active section
  const isActiveSection = (basePath) => {
    return location.pathname.startsWith(basePath);
  };

  // Handle submenu toggling
  const toggleSubmenu = (e) => {
    e.preventDefault();
    const parent = e.currentTarget.parentNode;

    if (parent.classList.contains('open')) {
      parent.classList.remove('open');
      const submenu = parent.querySelector('.collapse');
      if (submenu) {
        submenu.classList.remove('show');
      }
    } else {
      parent.classList.add('open');
      const submenu = parent.querySelector('.collapse');
      if (submenu) {
        submenu.classList.add('show');
      }

      // Close other open submenus in the same level
      const siblings = Array.from(parent.parentNode.children).filter(item =>
        item !== parent && item.classList.contains('open')
      );

      siblings.forEach(item => {
        item.classList.remove('open');
        const submenu = item.querySelector('.collapse');
        if (submenu) {
          submenu.classList.remove('show');
        }
      });
    }
  };

  return (
    <nav className="sidebar kubernetes-sidebar">
      <div className="sidebar-header">
        <Link to="/kubernetes/dashboard" className="sidebar-brand">
          <i data-feather="server" className="me-2"></i>
          Kubernetes
        </Link>
        <div className="back-button" onClick={toggleSidebar}>
          <i data-feather="arrow-left"></i>
        </div>
      </div>

      <div className="sidebar-body">
        <ul className="nav">
          {/* KUBERNETES category */}
          <li className="nav-item nav-category">MANAGEMENT</li>

          {/* Dashboard */}
          <li className={`nav-item ${isActive('/kubernetes/dashboard') ? 'active' : ''}`}>
            <Link to="/kubernetes/dashboard" className="nav-link">
              <i className="link-icon" data-feather="grid"></i>
              <span className="link-title">Dashboard</span>
            </Link>
          </li>

          {/* Clusters */}
          <li className={`nav-item ${isActive('/kubernetes/clusters') ? 'active' : ''}`}>
            <Link to="/kubernetes/clusters" className="nav-link">
              <i className="link-icon" data-feather="server"></i>
              <span className="link-title">Clusters</span>
            </Link>
          </li>

          {/* Deployments */}
          <li className={`nav-item ${isActive('/kubernetes/deployments') ? 'active' : ''}`}>
            <Link to="/kubernetes/deployments" className="nav-link">
              <i className="link-icon" data-feather="package"></i>
              <span className="link-title">Deployments</span>
            </Link>
          </li>

          {/* Pods */}
          <li className={`nav-item ${isActive('/kubernetes/pods') ? 'active' : ''}`}>
            <Link to="/kubernetes/pods" className="nav-link">
              <i className="link-icon" data-feather="box"></i>
              <span className="link-title">Pods</span>
            </Link>
          </li>

          {/* Services */}
          <li className={`nav-item ${isActive('/kubernetes/services') ? 'active' : ''}`}>
            <Link to="/kubernetes/services" className="nav-link">
              <i className="link-icon" data-feather="link"></i>
              <span className="link-title">Services</span>
            </Link>
          </li>

          {/* Storage */}
          <li className={`nav-item ${isActive('/kubernetes/storage') ? 'active' : ''}`}>
            <Link to="/kubernetes/storage" className="nav-link">
              <i className="link-icon" data-feather="database"></i>
              <span className="link-title">Storage</span>
            </Link>
          </li>
          
          {/* Monitoring */}
          <li className={`nav-item ${isActive('/kubernetes/monitoring') ? 'active' : ''}`}>
            <Link to="/kubernetes/monitoring" className="nav-link">
              <i className="link-icon" data-feather="activity"></i>
              <span className="link-title">Monitoring</span>
            </Link>
          </li>

          {/* ADMINISTRATION category - only visible to admins */}
          {isAdmin && (
            <>
              <li className="nav-item nav-category">ADMINISTRATION</li>

              {/* Configuration */}
              <li className={`nav-item ${isActive('/admin/kubernetes/config') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/config" className="nav-link">
                  <i className="link-icon" data-feather="settings"></i>
                  <span className="link-title">Configuration</span>
                </Link>
              </li>

              {/* Resources */}
              <li className={`nav-item ${isActive('/admin/kubernetes/resources') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/resources" className="nav-link">
                  <i className="link-icon" data-feather="cpu"></i>
                  <span className="link-title">Resources</span>
                </Link>
              </li>

              {/* Templates */}
              <li className={`nav-item ${isActive('/admin/kubernetes/templates') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/templates" className="nav-link">
                  <i className="link-icon" data-feather="file-text"></i>
                  <span className="link-title">Templates</span>
                </Link>
              </li>

              {/* Security */}
              <li className={`nav-item ${isActive('/admin/kubernetes/security') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/security" className="nav-link">
                  <i className="link-icon" data-feather="shield"></i>
                  <span className="link-title">Security</span>
                </Link>
              </li>
            </>
          )}
          
          {/* BACK TO MAIN section */}
          <li className="nav-item nav-category">MAIN APP</li>
          
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link" onClick={toggleSidebar}>
              <i className="link-icon" data-feather="arrow-left"></i>
              <span className="link-title">Back to Main App</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default KubernetesSidebar;