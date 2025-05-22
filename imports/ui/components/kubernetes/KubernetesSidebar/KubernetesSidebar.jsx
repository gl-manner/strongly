import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useApp } from '/imports/hooks/useApp';
import feather from 'feather-icons';
import './KubernetesSidebar.scss';

/**
 * Kubernetes specific sidebar that appears when Kubernetes section is active
 * Follows the requirements specification for sections 1-4
 */
const KubernetesSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useTracker(() => {
    const user = Meteor.user();
    return {
      user,
      isAdmin: user && Roles.userIsInRole(user._id, 'admin')
    };
  }, []);

  const { sidebarCollapsed, toggleSidebar } = useApp();
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

  // Handle back to main app
  const handleBackToMain = () => {
    navigate('/dashboard');
  };

  // Handle cluster selection
  const handleClusterSelect = (clusterId) => {
    setSelectedCluster(clusterId);
    setClusterSelectorOpen(false);
    // Re-initialize feather icons
    setTimeout(() => feather.replace(), 100);
  };

  const selectedClusterData = clusters.find(c => c.id === selectedCluster);

  return (
    <nav className="sidebar kubernetes-sidebar">
      <div className="sidebar-header">
        <Link to="/kubernetes/dashboard" className="sidebar-brand">
          <i data-feather="server" className="me-2"></i>
          Kubernetes
        </Link>
        <div className="back-button" onClick={handleBackToMain}>
          <i data-feather="arrow-left"></i>
        </div>
      </div>

      <div className="sidebar-body">
        {/* Cluster Selector */}
        <div className="cluster-selector mb-3 px-3">
          <div className="dropdown">
            <button
              className={`btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-between ${clusterSelectorOpen ? 'show' : ''}`}
              type="button"
              onClick={() => setClusterSelectorOpen(!clusterSelectorOpen)}
            >
              <div className="d-flex align-items-center">
                <div className={`cluster-status-dot me-2 ${selectedClusterData?.status}`}></div>
                <span>{selectedClusterData?.name}</span>
              </div>
              <i data-feather="chevron-down" style={{ width: '16px', height: '16px' }}></i>
            </button>
            {clusterSelectorOpen && (
              <ul className="dropdown-menu show w-100">
                {clusters.map(cluster => (
                  <li key={cluster.id}>
                    <a 
                      className="dropdown-item d-flex align-items-center" 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClusterSelect(cluster.id);
                      }}
                    >
                      <div className={`cluster-status-dot me-2 ${cluster.status}`}></div>
                      {cluster.name}
                    </a>
                  </li>
                ))}
              </ul>
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
              <i className="link-icon" data-feather="puzzle"></i>
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