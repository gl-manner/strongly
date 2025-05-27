import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { useApp } from '/imports/ui/hooks/useApp';
import feather from 'feather-icons';
import './KubernetesSidebar.scss';

/**
 * Kubernetes specific sidebar that appears when Kubernetes section is active
 * Now follows the same patterns as the main sidebar for consistency
 */
const KubernetesSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useApp();

  // Get current user with better error handling (same pattern as main sidebar)
  const { currentUser, isAdmin, loading } = useTracker(() => {
    const user = Meteor.user();

    // Handle case where Roles package might not be available
    let adminStatus = false;
    try {
      adminStatus = user && Roles.userIsInRole(user._id, 'admin');
    } catch (error) {
      console.warn('Roles package not available or error checking admin status:', error);
      // Fallback: check if user has admin role in profile
      adminStatus = user && user.profile && user.profile.roles && user.profile.roles.includes('admin');
    }

    return {
      currentUser: user,
      isAdmin: adminStatus,
      loading: !Meteor.userId() && Meteor.loggingIn()
    };
  }, []);

  // Handle sidebar mouse enter and leave (same as main sidebar)
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

  // Cluster selector state
  const [clusterSelectorOpen, setClusterSelectorOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('production');

  // Mock clusters data
  const clusters = [
    { id: 'production', name: 'Production', status: 'healthy' },
    { id: 'staging', name: 'Staging', status: 'healthy' },
    { id: 'development', name: 'Development', status: 'warning' },
    { id: 'qa', name: 'QA', status: 'healthy' }
  ];

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clusterSelectorOpen && !event.target.closest('.cluster-selector')) {
        setClusterSelectorOpen(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape' && clusterSelectorOpen) {
        setClusterSelectorOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [clusterSelectorOpen]);

  // Determine active menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Determine if path is part of active section
  const isActiveSection = (basePath) => {
    return location.pathname.startsWith(basePath);
  };

  // Handle submenu toggling (same pattern as main sidebar)
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

  // Handle back to main app
  const handleBackToMain = () => {
    navigate('/dashboard');
  };

  // Handle cluster selection
  const handleClusterSelect = (clusterId) => {
    setSelectedCluster(clusterId);
    setClusterSelectorOpen(false);
  };

  const selectedClusterData = clusters.find(c => c.id === selectedCluster);

  // Show loading state if needed (same as main sidebar)
  if (loading) {
    return (
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link to="/kubernetes/dashboard" className="sidebar-brand">
            <svg className="kubernetes-logo" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2M12 1L10.73 8.5L2 9.27L10.73 10.04L12 17.54L13.27 10.04L22 9.27L13.27 8.5L12 1M12 6.5L11.5 10.5L7.5 11L11.5 11.5L12 15.5L12.5 11.5L16.5 11L12.5 10.5L12 6.5Z"/>
            </svg>
            <span>Kubernetes</span>
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
        <Link to="/kubernetes/dashboard" className="sidebar-brand">
          <svg className="kubernetes-logo" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.5 6.5L20 7L16 11L17 17L12 14.5L7 17L8 11L4 7L9.5 6.5L12 2Z"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <path d="M12 6L13 9.5L16.5 9L14.5 12L15.5 15.5L12 14L8.5 15.5L9.5 12L7.5 9L11 9.5L12 6Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
          <span>Kubernetes</span>
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
        {/* Enhanced Cluster Selector */}
        <div className="cluster-selector mb-3 px-3">
          <div className="cluster-dropdown">
            <button
              className={`cluster-selector-btn ${clusterSelectorOpen ? 'active' : ''}`}
              type="button"
              onClick={() => setClusterSelectorOpen(!clusterSelectorOpen)}
              title={selectedClusterData?.name}
            >
              <div className="cluster-info">
                <div className={`cluster-status-dot ${selectedClusterData?.status}`}></div>
                <span className="cluster-name">{selectedClusterData?.name}</span>
              </div>
              <i data-feather="chevron-down" className="dropdown-arrow"></i>
            </button>
            
            {clusterSelectorOpen && (
              <div className="cluster-dropdown-menu">
                {clusters.map(cluster => (
                  <button
                    key={cluster.id}
                    className={`cluster-dropdown-item ${cluster.id === selectedCluster ? 'active' : ''}`}
                    onClick={() => handleClusterSelect(cluster.id)}
                  >
                    <div className={`cluster-status-dot ${cluster.status}`}></div>
                    <span className="cluster-name">{cluster.name}</span>
                    {cluster.id === selectedCluster && (
                      <i data-feather="check" className="check-icon"></i>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <ul className="nav">
          {/* OVERVIEW category */}
          <li className="nav-item nav-category">OVERVIEW</li>

          {/* Dashboard */}
          <li className={`nav-item ${isActive('/kubernetes/dashboard') ? 'active' : ''}`}>
            <Link to="/kubernetes/dashboard" className="nav-link">
              <i className="link-icon" data-feather="grid"></i>
              <span className="link-title">Overview</span>
            </Link>
          </li>

          {/* WORKLOADS category */}
          <li className="nav-item nav-category">WORKLOADS</li>

          {/* Deployments */}
          <li className={`nav-item ${isActiveSection('/kubernetes/deployments') ? 'open' : ''}`}>
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
              <i className="link-icon" data-feather="package"></i>
              <span className="link-title">Deployments</span>
              <i className="link-arrow" data-feather="chevron-down"></i>
            </a>
            <div className={`collapse ${isActiveSection('/kubernetes/deployments') ? 'show' : ''}`}>
              <ul className="nav sub-menu">
                <li className="nav-item">
                  <Link
                    to="/kubernetes/deployments"
                    className={`nav-link ${isActive('/kubernetes/deployments') ? 'active' : ''}`}
                  >
                    Deployments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/kubernetes/statefulsets"
                    className={`nav-link ${isActive('/kubernetes/statefulsets') ? 'active' : ''}`}
                  >
                    StatefulSets
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/kubernetes/daemonsets"
                    className={`nav-link ${isActive('/kubernetes/daemonsets') ? 'active' : ''}`}
                  >
                    DaemonSets
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/kubernetes/jobs"
                    className={`nav-link ${isActive('/kubernetes/jobs') ? 'active' : ''}`}
                  >
                    Jobs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/kubernetes/cronjobs"
                    className={`nav-link ${isActive('/kubernetes/cronjobs') ? 'active' : ''}`}
                  >
                    CronJobs
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Pods */}
          <li className={`nav-item ${isActive('/kubernetes/pods') ? 'active' : ''}`}>
            <Link to="/kubernetes/pods" className="nav-link">
              <i className="link-icon" data-feather="box"></i>
              <span className="link-title">Pods</span>
            </Link>
          </li>

          {/* ReplicaSets */}
          <li className={`nav-item ${isActive('/kubernetes/replicasets') ? 'active' : ''}`}>
            <Link to="/kubernetes/replicasets" className="nav-link">
              <i className="link-icon" data-feather="layers"></i>
              <span className="link-title">ReplicaSets</span>
            </Link>
          </li>

          {/* Horizontal Pod Autoscalers */}
          <li className={`nav-item ${isActive('/kubernetes/hpa') ? 'active' : ''}`}>
            <Link to="/kubernetes/hpa" className="nav-link">
              <i className="link-icon" data-feather="trending-up"></i>
              <span className="link-title">Horizontal Pod Autoscalers</span>
            </Link>
          </li>

          {/* SERVICES category */}
          <li className="nav-item nav-category">SERVICES</li>

          {/* Services */}
          <li className={`nav-item ${isActive('/kubernetes/services') ? 'active' : ''}`}>
            <Link to="/kubernetes/services" className="nav-link">
              <i className="link-icon" data-feather="link"></i>
              <span className="link-title">Services</span>
            </Link>
          </li>

          {/* Ingresses */}
          <li className={`nav-item ${isActive('/kubernetes/ingresses') ? 'active' : ''}`}>
            <Link to="/kubernetes/ingresses" className="nav-link">
              <i className="link-icon" data-feather="globe"></i>
              <span className="link-title">Ingresses</span>
            </Link>
          </li>

          {/* Network Policies */}
          <li className={`nav-item ${isActive('/kubernetes/network-policies') ? 'active' : ''}`}>
            <Link to="/kubernetes/network-policies" className="nav-link">
              <i className="link-icon" data-feather="shield"></i>
              <span className="link-title">Network Policies</span>
            </Link>
          </li>

          {/* Endpoints */}
          <li className={`nav-item ${isActive('/kubernetes/endpoints') ? 'active' : ''}`}>
            <Link to="/kubernetes/endpoints" className="nav-link">
              <i className="link-icon" data-feather="target"></i>
              <span className="link-title">Endpoints</span>
            </Link>
          </li>

          {/* CONFIG & STORAGE category */}
          <li className="nav-item nav-category">CONFIG & STORAGE</li>

          {/* ConfigMaps */}
          <li className={`nav-item ${isActive('/kubernetes/configmaps') ? 'active' : ''}`}>
            <Link to="/kubernetes/configmaps" className="nav-link">
              <i className="link-icon" data-feather="file-text"></i>
              <span className="link-title">ConfigMaps</span>
            </Link>
          </li>

          {/* Secrets */}
          <li className={`nav-item ${isActive('/kubernetes/secrets') ? 'active' : ''}`}>
            <Link to="/kubernetes/secrets" className="nav-link">
              <i className="link-icon" data-feather="key"></i>
              <span className="link-title">Secrets</span>
            </Link>
          </li>

          {/* Persistent Volumes */}
          <li className={`nav-item ${isActive('/kubernetes/persistent-volumes') ? 'active' : ''}`}>
            <Link to="/kubernetes/persistent-volumes" className="nav-link">
              <i className="link-icon" data-feather="database"></i>
              <span className="link-title">Persistent Volumes</span>
            </Link>
          </li>

          {/* Persistent Volume Claims */}
          <li className={`nav-item ${isActive('/kubernetes/persistent-volume-claims') ? 'active' : ''}`}>
            <Link to="/kubernetes/persistent-volume-claims" className="nav-link">
              <i className="link-icon" data-feather="hard-drive"></i>
              <span className="link-title">Persistent Volume Claims</span>
            </Link>
          </li>

          {/* Storage Classes */}
          <li className={`nav-item ${isActive('/kubernetes/storage-classes') ? 'active' : ''}`}>
            <Link to="/kubernetes/storage-classes" className="nav-link">
              <i className="link-icon" data-feather="archive"></i>
              <span className="link-title">Storage Classes</span>
            </Link>
          </li>

          {/* ADMINISTRATION category */}
          <li className="nav-item nav-category">ADMINISTRATION</li>

          {/* Namespaces */}
          <li className={`nav-item ${isActive('/kubernetes/namespaces') ? 'active' : ''}`}>
            <Link to="/kubernetes/namespaces" className="nav-link">
              <i className="link-icon" data-feather="folder"></i>
              <span className="link-title">Namespaces</span>
            </Link>
          </li>

          {/* Nodes */}
          <li className={`nav-item ${isActive('/kubernetes/nodes') ? 'active' : ''}`}>
            <Link to="/kubernetes/nodes" className="nav-link">
              <i className="link-icon" data-feather="server"></i>
              <span className="link-title">Nodes</span>
            </Link>
          </li>

          {/* Resource Quotas */}
          <li className={`nav-item ${isActive('/kubernetes/resource-quotas') ? 'active' : ''}`}>
            <Link to="/kubernetes/resource-quotas" className="nav-link">
              <i className="link-icon" data-feather="bar-chart-2"></i>
              <span className="link-title">Resource Quotas</span>
            </Link>
          </li>

          {/* Limit Ranges */}
          <li className={`nav-item ${isActive('/kubernetes/limit-ranges') ? 'active' : ''}`}>
            <Link to="/kubernetes/limit-ranges" className="nav-link">
              <i className="link-icon" data-feather="sliders"></i>
              <span className="link-title">Limit Ranges</span>
            </Link>
          </li>

          {/* Custom Resource Definitions */}
          <li className={`nav-item ${isActive('/kubernetes/custom-resource-definitions') ? 'active' : ''}`}>
            <Link to="/kubernetes/custom-resource-definitions" className="nav-link">
              <i className="link-icon" data-feather="settings"></i>
              <span className="link-title">Custom Resource Definitions</span>
            </Link>
          </li>

          {/* MONITORING category */}
          <li className="nav-item nav-category">MONITORING</li>

          {/* Events */}
          <li className={`nav-item ${isActive('/kubernetes/events') ? 'active' : ''}`}>
            <Link to="/kubernetes/events" className="nav-link">
              <i className="link-icon" data-feather="clock"></i>
              <span className="link-title">Events</span>
            </Link>
          </li>

          {/* Logs */}
          <li className={`nav-item ${isActive('/kubernetes/logs') ? 'active' : ''}`}>
            <Link to="/kubernetes/logs" className="nav-link">
              <i className="link-icon" data-feather="file-minus"></i>
              <span className="link-title">Logs</span>
            </Link>
          </li>

          {/* Metrics */}
          <li className={`nav-item ${isActive('/kubernetes/metrics') ? 'active' : ''}`}>
            <Link to="/kubernetes/metrics" className="nav-link">
              <i className="link-icon" data-feather="activity"></i>
              <span className="link-title">Metrics</span>
            </Link>
          </li>

          {/* Alerts */}
          <li className={`nav-item ${isActive('/kubernetes/alerts') ? 'active' : ''}`}>
            <Link to="/kubernetes/alerts" className="nav-link">
              <i className="link-icon" data-feather="alert-triangle"></i>
              <span className="link-title">Alerts</span>
            </Link>
          </li>

          {/* RBAC category */}
          <li className="nav-item nav-category">RBAC</li>

          {/* Roles */}
          <li className={`nav-item ${isActive('/kubernetes/roles') ? 'active' : ''}`}>
            <Link to="/kubernetes/roles" className="nav-link">
              <i className="link-icon" data-feather="user-check"></i>
              <span className="link-title">Roles</span>
            </Link>
          </li>

          {/* Role Bindings */}
          <li className={`nav-item ${isActive('/kubernetes/role-bindings') ? 'active' : ''}`}>
            <Link to="/kubernetes/role-bindings" className="nav-link">
              <i className="link-icon" data-feather="users"></i>
              <span className="link-title">Role Bindings</span>
            </Link>
          </li>

          {/* Cluster Roles */}
          <li className={`nav-item ${isActive('/kubernetes/cluster-roles') ? 'active' : ''}`}>
            <Link to="/kubernetes/cluster-roles" className="nav-link">
              <i className="link-icon" data-feather="user-plus"></i>
              <span className="link-title">Cluster Roles</span>
            </Link>
          </li>

          {/* Cluster Role Bindings */}
          <li className={`nav-item ${isActive('/kubernetes/cluster-role-bindings') ? 'active' : ''}`}>
            <Link to="/kubernetes/cluster-role-bindings" className="nav-link">
              <i className="link-icon" data-feather="user-x"></i>
              <span className="link-title">Cluster Role Bindings</span>
            </Link>
          </li>

          {/* Service Accounts */}
          <li className={`nav-item ${isActive('/kubernetes/service-accounts') ? 'active' : ''}`}>
            <Link to="/kubernetes/service-accounts" className="nav-link">
              <i className="link-icon" data-feather="user"></i>
              <span className="link-title">Service Accounts</span>
            </Link>
          </li>

          {/* SETTINGS category - only visible to admins */}
          {isAdmin && (
            <>
              <li className="nav-item nav-category">SETTINGS</li>

              {/* Cluster Configuration */}
              <li className={`nav-item ${isActive('/admin/kubernetes/config') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/config" className="nav-link">
                  <i className="link-icon" data-feather="settings"></i>
                  <span className="link-title">Cluster Configuration</span>
                </Link>
              </li>

              {/* User Preferences */}
              <li className={`nav-item ${isActive('/kubernetes/preferences') ? 'active' : ''}`}>
                <Link to="/kubernetes/preferences" className="nav-link">
                  <i className="link-icon" data-feather="user-cog"></i>
                  <span className="link-title">User Preferences</span>
                </Link>
              </li>

              {/* Access Control */}
              <li className={`nav-item ${isActive('/admin/kubernetes/security') ? 'active' : ''}`}>
                <Link to="/admin/kubernetes/security" className="nav-link">
                  <i className="link-icon" data-feather="lock"></i>
                  <span className="link-title">Access Control</span>
                </Link>
              </li>
            </>
          )}
          
          {/* BACK TO MAIN section */}
          <li className="nav-item nav-category">MAIN APP</li>
          
          <li className="nav-item">
            <a className="nav-link" href="#" onClick={(e) => {
              e.preventDefault();
              handleBackToMain();
            }}>
              <i className="link-icon" data-feather="arrow-left"></i>
              <span className="link-title">Back to Main App</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default KubernetesSidebar;