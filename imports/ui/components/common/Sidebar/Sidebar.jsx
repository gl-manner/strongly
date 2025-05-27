// imports/ui/components/common/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { useApp } from '/imports/ui/hooks/useApp';
import feather from 'feather-icons';
import './Sidebar.scss';

/**
 * Sidebar component based on NobleUI template
 * This component creates a responsive sidebar with collapsible menu items
 */
const Sidebar = ({ onKubernetesNavigate }) => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useApp();

  // Get current user with better error handling and debugging
  const { currentUser, isAdmin, loading, userRoles } = useTracker(() => {
    const user = Meteor.user();

    if (!user) {
      return {
        currentUser: null,
        isAdmin: false,
        loading: Meteor.loggingIn(),
        userRoles: []
      };
    }

    // Get user roles
    let roles = [];
    let adminStatus = false;

    try {
      roles = Roles.getRolesForUser(user._id);
      adminStatus = Roles.userIsInRole(user._id, 'admin');

      // Debug logging (only in development)
      if (Meteor.isDevelopment) {
        console.log('Current user:', user.emails?.[0]?.address);
        console.log('User ID:', user._id);
        console.log('User roles:', roles);
        console.log('Is admin:', adminStatus);
        console.log('User profile:', user.profile);
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
      // Fallback: check if user has admin role in profile
      adminStatus = user && user.profile && user.profile.roles && user.profile.roles.includes('admin');
    }

    return {
      currentUser: user,
      isAdmin: adminStatus,
      loading: false,
      userRoles: roles
    };
  }, []);

  // Handle sidebar mouse enter and leave
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const handleMouseEnter = () => {
    if (sidebarCollapsed) {
      document.body.classList.add('open-sidebar-folded');
      setSidebarHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (sidebarCollapsed) {
      document.body.classList.remove('open-sidebar-folded');
      setSidebarHovered(false);
    }
  };

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Debug effect to log role changes
  useEffect(() => {
    if (Meteor.isDevelopment && currentUser) {
      console.log('Sidebar - Current user changed:', {
        email: currentUser.emails?.[0]?.address,
        isAdmin,
        userRoles,
        userId: currentUser._id
      });
    }
  }, [currentUser, isAdmin, userRoles]);

  // Determine active menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Determine if path is part of active section
  const isActiveSection = (basePath) => {
    return location.pathname.startsWith(basePath);
  };

  // Check if user has specific permissions
  const hasAccess = (requiredRoles) => {
    if (!currentUser) return false;

    // Admin can access everything
    if (isAdmin) return true;

    // Check if user has the required role
    if (currentUser.profile &&
        currentUser.profile.userType &&
        requiredRoles.includes(currentUser.profile.userType)) {
      return true;
    }

    return false;
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

  // Handle clicking on Kubernetes main menu item
  const handleKubernetesClick = (e) => {
    e.preventDefault();
    // Trigger Kubernetes navigation by calling the provided callback
    if (onKubernetesNavigate) {
      onKubernetesNavigate();
    }
  };

  // Show loading state if needed
  if (loading) {
    return (
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            Strongly<span>AI</span>
          </Link>
        </div>
        <div className="sidebar-body">
          <div className="d-flex justify-content-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          Strongly<span>AI</span>
        </Link>
        <div
          className={`sidebar-toggler ${!sidebarCollapsed ? 'active' : ''}`}
          onClick={toggleSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleSidebar();
            }
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div
        className="sidebar-body"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ul className="nav">
          {/* MAIN category */}
          <li className="nav-item nav-category">MAIN</li>

          {/* Dashboard */}
          <li className={`nav-item ${isActive('/') || isActive('/dashboard') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <i className="link-icon" data-feather="grid"></i>
              <span className="link-title">Dashboard</span>
            </Link>
          </li>

          {/* Apps */}
          <li className={`nav-item ${isActive('/apps') ? 'active' : ''}`}>
            <Link to="/apps" className="nav-link">
              <i className="link-icon" data-feather="box"></i>
              <span className="link-title">Apps</span>
            </Link>
          </li>

          {/* Workflows dropdown */}
          <li className={`nav-item ${isActiveSection('/workflows') ? 'open' : ''}`}>
            <a
              className="nav-link"
              href="#"
              onClick={toggleSubmenu}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleSubmenu(e);
                }
              }}
            >
              <i className="link-icon" data-feather="git-branch"></i>
              <span className="link-title">Workflows</span>
              <i className="link-arrow" data-feather="chevron-down"></i>
            </a>
            <div className={`collapse ${isActiveSection('/workflows') ? 'show' : ''}`}>
              <ul className="nav sub-menu">
                <li className="nav-item">
                  <Link
                    to="/agent-workflow"
                    className={`nav-link ${isActive('/workflows/builder') ? 'active' : ''}`}
                  >
                    Builder
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/workflows/monitor"
                    className={`nav-link ${isActive('/workflows/monitor') ? 'active' : ''}`}
                  >
                    Monitor
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Marketplace */}
          <li className={`nav-item ${isActive('/marketplace') ? 'active' : ''}`}>
            <Link to="/marketplace" className="nav-link">
              <i className="link-icon" data-feather="shopping-bag"></i>
              <span className="link-title">Marketplace</span>
            </Link>
          </li>

          {/* ANALYTICS category */}
          <li className="nav-item nav-category">ANALYTICS</li>

          {/* Users */}
          <li className={`nav-item ${isActive('/analytics/users') ? 'active' : ''}`}>
            <Link to="/analytics/users" className="nav-link">
              <i className="link-icon" data-feather="users"></i>
              <span className="link-title">Users</span>
            </Link>
          </li>

          {/* Models */}
          <li className={`nav-item ${isActive('/analytics/models') ? 'active' : ''}`}>
            <Link to="/analytics/models" className="nav-link">
              <i className="link-icon" data-feather="cpu"></i>
              <span className="link-title">Models</span>
            </Link>
          </li>

          {/* Prompts */}
          <li className={`nav-item ${isActive('/analytics/prompts') ? 'active' : ''}`}>
            <Link to="/analytics/prompts" className="nav-link">
              <i className="link-icon" data-feather="terminal"></i>
              <span className="link-title">Prompts</span>
            </Link>
          </li>

          {/* OPERATIONS category */}
          <li className="nav-item nav-category">OPERATIONS</li>

          {/* Platform(Kubernetes) - Single menu item that activates the Kubernetes sidebar */}
          <li className={`nav-item ${isActiveSection('/kubernetes') ? 'active' : ''}`}>
            <a
              className="nav-link"
              href="#"
              onClick={handleKubernetesClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleKubernetesClick(e);
                }
              }}
            >
              <i className="link-icon" data-feather="server"></i>
              <span className="link-title">Platform</span>
            </a>
          </li>

          {/* AI Gateway */}
          <li className={`nav-item ${isActive('/operations/ai-gateway') ? 'active' : ''}`}>
            <Link to="/operations/ai-gateway" className="nav-link">
              <i className="link-icon" data-feather="shuffle"></i>
              <span className="link-title">AI Gateway</span>
            </Link>
          </li>

          {/* ADMIN category - only visible to admins */}
          {isAdmin && (
            <>
              <li className="nav-item nav-category">ADMIN</li>

              {/* Users Management */}
              <li className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
                <Link to="/admin/users" className="nav-link">
                  <i className="link-icon" data-feather="user-plus"></i>
                  <span className="link-title">Users</span>
                </Link>
              </li>

              {/* Governance */}
              <li className={`nav-item ${isActive('/admin/governance') ? 'active' : ''}`}>
                <Link to="/admin/governance" className="nav-link">
                  <i className="link-icon" data-feather="shield"></i>
                  <span className="link-title">Governance</span>
                </Link>
              </li>

              {/* FinOps */}
              <li className={`nav-item ${isActive('/admin/finops') ? 'active' : ''}`}>
                <Link to="/admin/finops" className="nav-link">
                  <i className="link-icon" data-feather="dollar-sign"></i>
                  <span className="link-title">FinOps</span>
                </Link>
              </li>
            </>
          )}

          {/* SUPPORT category */}
          <li className="nav-item nav-category">SUPPORT</li>

          {/* FAQ */}
          <li className={`nav-item ${isActive('/support/faq') ? 'active' : ''}`}>
            <Link to="/support/faq" className="nav-link">
              <i className="link-icon" data-feather="help-circle"></i>
              <span className="link-title">FAQ</span>
            </Link>
          </li>

          {/* Contact */}
          <li className={`nav-item ${isActive('/support/contact') ? 'active' : ''}`}>
            <Link to="/support/contact" className="nav-link">
              <i className="link-icon" data-feather="mail"></i>
              <span className="link-title">Contact</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
