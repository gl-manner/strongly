// /imports/ui/pages/Apps/CreateApp/CreateApp.jsx

import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert } from '/imports/ui/components/common/Alert/Alert';
import './CreateApp.scss';

// Simple SVG icon components
const Icons = {
  ArrowLeft: ({ className = "" }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
    </svg>
  ),
  Plus: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
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

export const CreateApp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repository: '',
    branch: 'main',
    buildpack: '',
    instances: 1,
    memory: '512M',
    disk: '1G',
    hardwareTier: 'small',
    space: '',
    environmentVariables: {},
    tags: []
  });

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showAlert('error', 'App name is required');
      return;
    }

    if (!formData.repository.trim()) {
      showAlert('error', 'Repository URL is required');
      return;
    }

    setLoading(true);

    try {
      // Call Meteor method to create app
      await new Promise((resolve, reject) => {
        Meteor.call('apps.create', formData, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      toast.success('App created successfully!');
      navigate('/apps');
    } catch (error) {
      console.error('Error creating app:', error);
      toast.error(`Failed to create app: ${error.message}`);
      showAlert('error', `Failed to create app: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-app">
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
          <h4 className="mb-1">Create New App</h4>
          <p className="text-muted mb-0">Deploy a new application from your repository</p>
        </div>
        <div>
          <Link to="/apps" className="btn btn-outline-secondary">
            <Icons.ArrowLeft className="icon-sm me-2" /> Back to Apps
          </Link>
        </div>
      </div>

      {/* Create App Form */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Application Configuration</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">Basic Information</h6>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">App Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="my-awesome-app"
                      required
                    />
                    <small className="text-muted">Must be unique and URL-friendly</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Space</label>
                    <input
                      type="text"
                      className="form-control"
                      name="space"
                      value={formData.space}
                      onChange={handleInputChange}
                      placeholder="production, staging, etc."
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Brief description of your application"
                    ></textarea>
                  </div>
                </div>

                {/* Source Code */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">Source Code</h6>
                  </div>
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Repository URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      name="repository"
                      value={formData.repository}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username/repo"
                      required
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Branch</label>
                    <input
                      type="text"
                      className="form-control"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      placeholder="main"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Buildpack</label>
                    <select
                      className="form-select"
                      name="buildpack"
                      value={formData.buildpack}
                      onChange={handleInputChange}
                    >
                      <option value="">Auto-detect</option>
                      <option value="nodejs">Node.js</option>
                      <option value="python">Python</option>
                      <option value="ruby">Ruby</option>
                      <option value="php">PHP</option>
                      <option value="java">Java</option>
                      <option value="go">Go</option>
                      <option value="docker">Docker</option>
                    </select>
                  </div>
                </div>

                {/* Resources */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h6 className="text-primary mb-3">Resources</h6>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Hardware Tier</label>
                    <select
                      className="form-select"
                      name="hardwareTier"
                      value={formData.hardwareTier}
                      onChange={handleInputChange}
                    >
                      <option value="small">Small (1 CPU, 512MB)</option>
                      <option value="medium">Medium (2 CPU, 1GB)</option>
                      <option value="large">Large (4 CPU, 2GB)</option>
                      <option value="xlarge">X-Large (8 CPU, 4GB)</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Instances</label>
                    <input
                      type="number"
                      className="form-control"
                      name="instances"
                      value={formData.instances}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Memory</label>
                    <select
                      className="form-select"
                      name="memory"
                      value={formData.memory}
                      onChange={handleInputChange}
                    >
                      <option value="256M">256MB</option>
                      <option value="512M">512MB</option>
                      <option value="1G">1GB</option>
                      <option value="2G">2GB</option>
                      <option value="4G">4GB</option>
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Disk</label>
                    <select
                      className="form-select"
                      name="disk"
                      value={formData.disk}
                      onChange={handleInputChange}
                    >
                      <option value="512M">512MB</option>
                      <option value="1G">1GB</option>
                      <option value="5G">5GB</option>
                      <option value="10G">10GB</option>
                      <option value="20G">20GB</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-2">
                  <Link to="/apps" className="btn btn-outline-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Icons.Loader className="icon-sm me-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Icons.Plus className="icon-sm me-2" />
                        Create App
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar with helpful information */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Deployment Guide</h6>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="text-success">✓ Supported Frameworks</h6>
                <ul className="list-unstyled text-muted small">
                  <li>• Node.js (Express, Next.js, Nuxt.js)</li>
                  <li>• Python (Django, Flask, FastAPI)</li>
                  <li>• Ruby (Rails, Sinatra)</li>
                  <li>• PHP (Laravel, Symfony)</li>
                  <li>• Java (Spring Boot)</li>
                  <li>• Go applications</li>
                  <li>• Docker containers</li>
                </ul>
              </div>

              <div className="mb-4">
                <h6 className="text-info">📋 Requirements</h6>
                <ul className="list-unstyled text-muted small">
                  <li>• Valid package.json/requirements.txt</li>
                  <li>• Procfile (optional)</li>
                  <li>• Environment variables setup</li>
                </ul>
              </div>

              <div>
                <h6 className="text-warning">⚡ Pro Tips</h6>
                <ul className="list-unstyled text-muted small">
                  <li>• Start with small hardware tier</li>
                  <li>• Use environment variables for config</li>
                  <li>• Enable health checks</li>
                  <li>• Monitor resource usage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .create-app {
          padding: 20px;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
