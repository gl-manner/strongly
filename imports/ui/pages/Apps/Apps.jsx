// /imports/ui/pages/Apps/Apps.jsx

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppsCollection } from '/imports/api/apps/AppsCollection';
import { Alert } from '/imports/ui/components/common/Alert/Alert';
import './Apps.scss';

// Simple SVG icon components
const Icons = {
  Plus: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Search: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  ),
  Play: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,3 19,12 5,21 5,3"></polygon>
    </svg>
  ),
  Square: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  ),
  ExternalLink: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  Loader: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  ),
  ChevronLeft: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  ),
  ChevronRight: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  ),
  Filter: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
    </svg>
  ),
  RefreshCw: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,10 17,10"></polyline>
      <polyline points="1,20 1,14 7,14"></polyline>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64l1.27 1.27"></path>
      <path d="M3.51 15a9 9 0 0 0 14.85 4.36l-1.27-1.27"></path>
    </svg>
  )
};

export const Apps = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const appsPerPage = 12;

  // Alert management
  const showAlert = (type, message) => {
    const alertId = Date.now();
    const newAlert = { id: alertId, type, message };
    setAlerts(prev => [...prev, newAlert]);
    return alertId;
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Force loading to false after a timeout
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Forcing ready state after timeout');
      setForceReady(true);
    }, 3000); // Force ready after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // Get apps and summary data
  const { loading, apps, summary, totalPages } = useTracker(() => {
    let appsHandle;
    let isReady = forceReady; // Start with forceReady state

    try {
      // Try to subscribe to apps
      appsHandle = Meteor.subscribe('apps');
      isReady = appsHandle.ready() || forceReady;
      console.log('Subscription ready:', appsHandle.ready(), 'Force ready:', forceReady);
    } catch (error) {
      console.log('Subscription error:', error);
      isReady = true; // If subscription fails, just show the data
    }

    // Get all apps from the collection - always try to fetch
    const allApps = AppsCollection.find({}, { sort: { updatedAt: -1 } }).fetch();
    console.log('Found apps:', allApps.length);

    // Apply client-side filtering
    const filteredApps = allApps.filter(app => {
      const matchesSearch = !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return {
      loading: !isReady,
      apps: filteredApps,
      summary: {
        totalApps: allApps.length,
        runningApps: allApps.filter(app => app.status === 'running').length,
        stoppedApps: allApps.filter(app => app.status === 'stopped').length,
        errorApps: allApps.filter(app => app.status === 'error').length,
        deployingApps: allApps.filter(app => app.status === 'deploying').length,
        spaces: [...new Set(allApps.map(app => app.space).filter(Boolean))].length
      },
      totalPages: Math.ceil(filteredApps.length / appsPerPage)
    };
  }, [searchQuery, statusFilter, currentPage, forceReady]);

  // Handle app actions
  const handleAppAction = (action, appId, appName) => {
    const actionMap = {
      start: 'apps.start',
      stop: 'apps.stop',
      restart: 'apps.restart'
    };

    if (!actionMap[action]) return;

    toast.info(`${action}ing ${appName}...`, { autoClose: false, toastId: `${action}-${appId}` });

    Meteor.call(actionMap[action], appId, (error) => {
      toast.dismiss(`${action}-${appId}`);

      if (error) {
        toast.error(`Failed to ${action} ${appName}: ${error.message}`);
        showAlert('error', `Failed to ${action} ${appName}: ${error.message}`);
      } else {
        toast.success(`${appName} ${action}ed successfully!`);
        showAlert('success', `${appName} ${action}ed successfully!`);
      }
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      'running': 'success',
      'stopped': 'secondary',
      'error': 'danger',
      'deploying': 'warning'
    };
    return colors[status] || 'secondary';
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  // Paginate apps
  const startIndex = (currentPage - 1) * appsPerPage;
  const paginatedApps = apps.slice(startIndex, startIndex + appsPerPage);

  return (
    <div className="apps-page">
      {/* Alert notifications */}
      <div className="alerts-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1050 }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            timeout={alert.type === 'error' ? 8000 : 5000}
          />
        ))}
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-1">Applications</h4>
          <p className="text-muted mb-0">Manage your deployed applications</p>
        </div>
        <div>
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => window.location.reload()}
            title="Refresh"
          >
            <Icons.RefreshCw className="icon-sm" />
          </button>
          <Link to="/apps/create" className="btn btn-primary">
            <Icons.Plus className="icon-sm me-2" /> Create App
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <Icons.Search className="icon-sm" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search apps by name or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="deploying">Deploying</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="col-md-3">
          <div className="text-muted">
            Showing {startIndex + 1}-{Math.min(startIndex + appsPerPage, apps.length)} of {apps.length} apps
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="row">
        {/* Combined Summary Card */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div className="card h-100" style={{ minHeight: '200px' }}>
            <div className="card-body">
              <h5 className="card-title mb-3">App Summary</h5>
              <div className="row">
                <div className="col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-1 text-primary">{summary.totalApps}</h4>
                    <small className="text-muted">Total Apps</small>
                  </div>
                </div>
                <div className="col-6 mb-3">
                  <div className="text-center">
                    <h4 className="mb-1 text-success">{summary.runningApps}</h4>
                    <small className="text-muted">Running</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="mb-1 text-secondary">{summary.stoppedApps}</h4>
                    <small className="text-muted">Stopped</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <h4 className="mb-1 text-danger">{summary.errorApps}</h4>
                    <small className="text-muted">Error</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add App Tile */}
        <div className="col-lg-4 col-md-6 mb-4">
          <div
            className="card h-100 add-app-card"
            onClick={() => navigate('/apps/create')}
            style={{ cursor: 'pointer', minHeight: '200px' }}
          >
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              <Icons.Plus style={{ width: '48px', height: '48px', strokeWidth: 1, opacity: 0.5 }} className="mb-3" />
              <h5 className="text-muted">Add an App</h5>
              <p className="text-muted mb-0">Deploy a new application</p>
            </div>
          </div>
        </div>

        {/* App Cards */}
        {loading ? (
          <div className="col-12 text-center py-5">
            <Icons.Loader className="spinner-icon" />
            <p className="mt-2">Loading applications...</p>
          </div>
        ) : paginatedApps.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h5 className="text-muted">No applications found</h5>
            <p className="text-muted">
              {searchQuery || statusFilter ?
                'Try adjusting your search or filter criteria.' :
                'Create your first application to get started.'
              }
            </p>
          </div>
        ) : (
          paginatedApps.map(app => (
            <div key={app._id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 app-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">
                        <Link to={`/apps/${app._id}`} className="text-decoration-none">
                          {app.name}
                        </Link>
                      </h5>
                      <span className={`badge bg-${getStatusBadgeColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    {app.status === 'deploying' && (
                      <Icons.Loader className="spinner-icon text-warning" />
                    )}
                  </div>

                  <p className="card-text text-muted small mb-3">
                    {app.description || 'No description provided'}
                  </p>

                  <div className="app-details mb-3">
                    <div className="row">
                      <div className="col-6">
                        <small className="text-muted">Instances</small>
                        <div>{app.instances || 1}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Memory</small>
                        <div>{app.memory || '512M'}</div>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-6">
                        <small className="text-muted">Hardware</small>
                        <div className="text-capitalize">{app.hardwareTier || 'small'}</div>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">Updated</small>
                        <div>{formatDate(app.updatedAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="app-actions d-flex gap-2">
                    {app.status === 'stopped' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAppAction('start', app._id, app.name)}
                        title="Start App"
                      >
                        <Icons.Play className="icon-sm" />
                      </button>
                    )}
                    {app.status === 'running' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAppAction('stop', app._id, app.name)}
                        title="Stop App"
                      >
                        <Icons.Square className="icon-sm" />
                      </button>
                    )}
                    {(app.status === 'running' || app.status === 'stopped') && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAppAction('restart', app._id, app.name)}
                        title="Restart App"
                      >
                        <Icons.RefreshCw className="icon-sm" />
                      </button>
                    )}
                    {app.url && app.status === 'running' && (
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-secondary"
                        title="Open App"
                      >
                        <Icons.ExternalLink className="icon-sm" />
                      </a>
                    )}
                    <Link
                      to={`/apps/${app._id}`}
                      className="btn btn-sm btn-outline-primary ms-auto"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icons.ChevronLeft className="icon-sm" />
                </button>
              </li>

              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }

                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Icons.ChevronRight className="icon-sm" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

    </div>
  );
};
