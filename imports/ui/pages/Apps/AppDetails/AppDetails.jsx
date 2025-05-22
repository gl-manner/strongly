// /imports/ui/pages/Apps/AppDetails/AppDetails.jsx

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppsCollection } from '/imports/api/apps/AppsCollection';
import { Alert } from '/imports/ui/components/common/Alert/Alert';
import Spinner from '/imports/ui/components/common/Spinner/Spinner';
import ErrorAlert from '/imports/ui/components/common/ErrorAlert/ErrorAlert';
import './AppDetails.scss';

// Simple SVG icon components
const Icons = {
  ArrowLeft: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
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
  RotateCcw: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,4 1,10 7,10"></polyline>
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36l-3.64 3.64"></path>
    </svg>
  ),
  ExternalLink: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15,3 21,3 21,9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  ),
  Settings: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Activity: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
    </svg>
  ),
  FileText: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14,2 14,8 20,8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10,9 9,9 8,9"></polyline>
    </svg>
  ),
  Plus: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Edit: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Trash: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Copy: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  Loader: ({ className = "" }) => (
    <svg className={`${className} animate-spin`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  )
};

// Environment Variable Modal
const EnvVarModal = ({ isOpen, onClose, onSubmit, editingVar = null }) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (editingVar) {
      setKey(editingVar.key);
      setValue(editingVar.value);
    } else {
      setKey('');
      setValue('');
    }
  }, [editingVar, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (key.trim() && value.trim()) {
      onSubmit(key.trim(), value.trim());
      setKey('');
      setValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingVar ? 'Edit Environment Variable' : 'Add Environment Variable'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Key</label>
                <input
                  type="text"
                  className="form-control"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g., DATABASE_URL"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Value</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Environment variable value"
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVar ? 'Update' : 'Add'} Variable
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const AppDetails = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingEnvVar, setEditingEnvVar] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [actionInProgress, setActionInProgress] = useState(null);

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

  // Get app data
  const { app, loading, error } = useTracker(() => {
    try {
      const handle = Meteor.subscribe('app', appId);

      return {
        loading: !handle.ready(),
        app: AppsCollection.findOne(appId),
        error: null
      };
    } catch (error) {
      console.error("Error in app tracker:", error);
      return {
        loading: false,
        app: null,
        error: error.message
      };
    }
  }, [appId]);

  // App actions
  const handleAppAction = (action) => {
    if (!app) return;

    setActionInProgress(action);
    toast.info(`${action === 'start' ? 'Starting' : action === 'stop' ? 'Stopping' : 'Restarting'} ${app.name}...`, {
      autoClose: false,
      toastId: `${action}-${appId}`
    });

    Meteor.call(`apps.${action}`, appId, (error) => {
      toast.dismiss(`${action}-${appId}`);
      setActionInProgress(null);

      if (error) {
        console.error(`Error ${action}ing app:`, error);
        toast.error(`Failed to ${action} app: ${error.message}`);
        showAlert('error', `Failed to ${action} ${app.name}: ${error.message}`);
      } else {
        const actionPast = action === 'start' ? 'started' : action === 'stop' ? 'stopped' : 'restarted';
        toast.success(`${app.name} ${actionPast} successfully!`);
        showAlert('success', `${app.name} ${actionPast} successfully!`);
      }
    });
  };

  // Environment variable actions
  const handleAddEnvVar = (key, value) => {
    Meteor.call('apps.addEnvVar', appId, key, value, (error) => {
      if (error) {
        toast.error(`Failed to add environment variable: ${error.message}`);
        showAlert('error', `Failed to add environment variable: ${error.message}`);
      } else {
        toast.success('Environment variable added successfully!');
        showAlert('success', 'Environment variable added successfully!');
        setShowEnvModal(false);
        setEditingEnvVar(null);
      }
    });
  };

  const handleRemoveEnvVar = (key) => {
    if (confirm(`Are you sure you want to remove the environment variable "${key}"?`)) {
      Meteor.call('apps.removeEnvVar', appId, key, (error) => {
        if (error) {
          toast.error(`Failed to remove environment variable: ${error.message}`);
          showAlert('error', `Failed to remove environment variable: ${error.message}`);
        } else {
          toast.success('Environment variable removed successfully!');
          showAlert('success', 'Environment variable removed successfully!');
        }
      });
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      running: 'bg-success',
      stopped: 'bg-secondary',
      error: 'bg-danger',
      deploying: 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Icons.Play className="icon-sm" />;
      case 'stopped':
        return <Icons.Square className="icon-sm" />;
      case 'deploying':
        return <Icons.Loader className="icon-sm" />;
      default:
        return <Icons.Square className="icon-sm" />;
    }
  };

  if (loading) {
    return <Spinner message="Loading app details..." />;
  }

  if (error) {
    return <ErrorAlert title="Error Loading App" message={error} />;
  }

  if (!app) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-warning">
          <h5>App Not Found</h5>
          <p>The app you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/apps" className="btn btn-primary">
            <Icons.ArrowLeft className="icon-sm me-2" /> Back to Apps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-details">
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
        <div className="d-flex align-items-center">
          <Link to="/apps" className="btn btn-outline-secondary me-3">
            <Icons.ArrowLeft className="icon-sm me-2" /> Back to Apps
          </Link>
          <div>
            <h2 className="mb-1 d-flex align-items-center">
              {app.name}
              <span className={`badge ${getStatusBadge(app.status)} ms-3 d-flex align-items-center`}>
                {getStatusIcon(app.status)}
                <span className="ms-1">{app.status}</span>
              </span>
            </h2>
            {app.description && <p className="text-muted mb-0">{app.description}</p>}
          </div>
        </div>

        <div className="d-flex gap-2">
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              <Icons.ExternalLink className="icon-sm me-2" /> Open App
            </a>
          )}

          {app.status === 'stopped' && (
            <button
              className="btn btn-success"
              onClick={() => handleAppAction('start')}
              disabled={actionInProgress === 'start'}
            >
              {actionInProgress === 'start' ? (
                <Icons.Loader className="icon-sm me-2" />
              ) : (
                <Icons.Play className="icon-sm me-2" />
              )}
              Start
            </button>
          )}

          {app.status === 'running' && (
            <>
              <button
                className="btn btn-warning"
                onClick={() => handleAppAction('restart')}
                disabled={actionInProgress === 'restart'}
              >
                {actionInProgress === 'restart' ? (
                  <Icons.Loader className="icon-sm me-2" />
                ) : (
                  <Icons.RotateCcw className="icon-sm me-2" />
                )}
                Restart
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleAppAction('stop')}
                disabled={actionInProgress === 'stop'}
              >
                {actionInProgress === 'stop' ? (
                  <Icons.Loader className="icon-sm me-2" />
                ) : (
                  <Icons.Square className="icon-sm me-2" />
                )}
                Stop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Icons.Activity className="icon-sm me-2" /> Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'environment' ? 'active' : ''}`}
            onClick={() => setActiveTab('environment')}
          >
            <Icons.Settings className="icon-sm me-2" /> Environment
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Icons.FileText className="icon-sm me-2" /> Logs
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row">
          {/* App Info */}
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="card-title mb-0">Application Information</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <span className={`badge ${getStatusBadge(app.status)} ms-2`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <strong>Instances:</strong> {app.instances}
                    </div>
                    <div className="mb-3">
                      <strong>Memory:</strong> {app.memory}
                    </div>
                    <div className="mb-3">
                      <strong>Disk:</strong> {app.disk}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong>Hardware Tier:</strong> {app.hardwareTier}
                    </div>
                    <div className="mb-3">
                      <strong>Buildpack:</strong> {app.buildpack || 'Not specified'}
                    </div>
                    <div className="mb-3">
                      <strong>Space:</strong> {app.space || 'Default'}
                    </div>
                    <div className="mb-3">
                      <strong>Last Updated:</strong> {new Date(app.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {app.url && (
                  <div className="mt-3">
                    <strong>URL:</strong>
                    <div className="d-flex align-items-center mt-1">
                      <code className="me-2">{app.url}</code>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => copyToClipboard(app.url)}
                      >
                        <Icons.Copy className="icon-sm" />
                      </button>
                    </div>
                  </div>
                )}

                {app.repository && (
                  <div className="mt-3">
                    <strong>Repository:</strong>
                    <div className="d-flex align-items-center mt-1">
                      <code className="me-2">{app.repository}</code>
                      <span className="badge bg-info">{app.branch || 'main'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="card-title mb-0">Quick Stats</h6>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>CPU Usage</span>
                  <span className="text-primary">{app.metrics?.cpu || 0}%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${app.metrics?.cpu || 0}%` }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Memory Usage</span>
                  <span className="text-warning">{app.metrics?.memory || 0}%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: `${app.metrics?.memory || 0}%` }}
                  ></div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <span>Requests/min</span>
                  <span className="text-success">{app.metrics?.requests || 0}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {app.tags && app.tags.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">Tags</h6>
                </div>
                <div className="card-body">
                  {app.tags.map((tag, index) => (
                    <span key={index} className="badge bg-secondary me-1 mb-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'environment' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0">Environment Variables</h6>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowEnvModal(true)}
                >
                  <Icons.Plus className="icon-sm me-2" /> Add Variable
                </button>
              </div>
              <div className="card-body">
                {app.environmentVariables && Object.keys(app.environmentVariables).length > 0 ? (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                          <th width="120">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(app.environmentVariables).map(([key, value]) => (
                          <tr key={key}>
                            <td><code>{key}</code></td>
                            <td>
                              <code className="text-muted">
                                {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                              </code>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => {
                                    setEditingEnvVar({ key, value });
                                    setShowEnvModal(true);
                                  }}
                                  title="Edit"
                                >
                                  <Icons.Edit className="icon-sm" />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveEnvVar(key)}
                                  title="Delete"
                                >
                                  <Icons.Trash className="icon-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">No environment variables configured</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowEnvModal(true)}
                    >
                      <Icons.Plus className="icon-sm me-2" /> Add Your First Variable
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Application Logs</h6>
              </div>
              <div className="card-body">
                <div
                  className="bg-dark text-light p-3 rounded"
                  style={{ height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.9rem' }}
                >
                  {app.logs && app.logs.length > 0 ? (
                    app.logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-muted">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`ms-2 ${log.level === 'error' ? 'text-danger' : log.level === 'warn' ? 'text-warning' : 'text-light'}`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      <Icons.FileText style={{ width: '48px', height: '48px', opacity: 0.5 }} />
                      <p className="mt-3 mb-0">No logs available</p>
                      <small>{app.status === 'stopped' ? 'Start the app to see logs' : 'Logs will appear here when the app generates them'}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment Variable Modal */}
      <EnvVarModal
        isOpen={showEnvModal}
        onClose={() => {
          setShowEnvModal(false);
          setEditingEnvVar(null);
        }}
        onSubmit={handleAddEnvVar}
        editingVar={editingEnvVar}
      />
    </div>
  );
};
