// /imports/ui/pages/kubernetes/Deployments/KubernetesDeployments.jsx
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './KubernetesDeployments.scss';

export const KubernetesDeployments = () => {
  // State for deployment data
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [deploymentLogs, setDeploymentLogs] = useState([]);

  // Sample data for development (in a real app, this would come from Meteor methods/publications)
  const [deployments, setDeployments] = useState([
    {
      id: 'd1',
      name: 'llama3-70b-instruct',
      modelName: 'Llama 3 70B',
      status: 'running',
      cluster: 'production-cluster',
      namespace: 'ai-models',
      replicas: 2,
      readyReplicas: 2,
      createdAt: new Date(2025, 4, 10),
      updatedAt: new Date(2025, 4, 12),
      cpu: '16',
      memory: '64Gi',
      gpu: '1',
      image: 'registry.example.com/llama3:v1.2.0',
      endpoints: [
        {
          name: 'api',
          url: 'https://llama3-api.strongly.ai',
          port: 8000,
          protocol: 'https'
        }
      ],
      health: {
        status: 'healthy',
        message: 'All pods are running',
        lastChecked: new Date(2025, 4, 14)
      }
    },
    {
      id: 'd2',
      name: 'mistral-8x7b',
      modelName: 'Mistral 8x7B',
      status: 'running',
      cluster: 'production-cluster',
      namespace: 'ai-models',
      replicas: 3,
      readyReplicas: 3,
      createdAt: new Date(2025, 3, 25),
      updatedAt: new Date(2025, 4, 5),
      cpu: '12',
      memory: '48Gi',
      gpu: '1',
      image: 'registry.example.com/mistral:v1.0.1',
      endpoints: [
        {
          name: 'api',
          url: 'https://mistral-api.strongly.ai',
          port: 8000,
          protocol: 'https'
        }
      ],
      health: {
        status: 'warning',
        message: 'High memory usage',
        lastChecked: new Date(2025, 4, 14)
      }
    },
    {
      id: 'd3',
      name: 'gemma-7b',
      modelName: 'Gemma 7B',
      status: 'pending',
      cluster: 'staging-cluster',
      namespace: 'ai-models',
      replicas: 1,
      readyReplicas: 0,
      createdAt: new Date(2025, 4, 14),
      updatedAt: new Date(2025, 4, 14),
      cpu: '4',
      memory: '16Gi',
      gpu: '0',
      image: 'registry.example.com/gemma:v1.0.0',
      endpoints: [
        {
          name: 'api',
          url: 'https://gemma-api.strongly.ai',
          port: 8000,
          protocol: 'https'
        }
      ],
      health: {
        status: 'pending',
        message: 'Deployment in progress',
        lastChecked: new Date(2025, 4, 14)
      }
    },
    {
      id: 'd4',
      name: 'falcon-40b',
      modelName: 'Falcon 40B',
      status: 'failed',
      cluster: 'development-cluster',
      namespace: 'ai-models',
      replicas: 1,
      readyReplicas: 0,
      createdAt: new Date(2025, 4, 13),
      updatedAt: new Date(2025, 4, 13),
      cpu: '8',
      memory: '32Gi',
      gpu: '1',
      image: 'registry.example.com/falcon:v2.0.1',
      endpoints: [],
      health: {
        status: 'unhealthy',
        message: 'Container crashed due to insufficient memory',
        lastChecked: new Date(2025, 4, 14)
      }
    }
  ]);

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Filter deployments based on filter and search
  const filteredDeployments = deployments.filter(deployment => {
    // Apply status filter
    if (filter !== 'all' && deployment.status !== filter) {
      return false;
    }
    
    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        deployment.name.toLowerCase().includes(query) ||
        deployment.modelName.toLowerCase().includes(query) ||
        deployment.cluster.toLowerCase().includes(query) ||
        deployment.namespace.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle deployment selection for details view
  const handleSelectDeployment = (deployment) => {
    setSelectedDeployment(deployment);
  };

  // Handle showing logs
  const handleShowLogs = (deploymentId) => {
    // In a real app, you would fetch actual logs
    const mockLogs = [
      { timestamp: new Date(2025, 4, 14, 10, 15, 23), level: 'INFO', message: 'Starting container' },
      { timestamp: new Date(2025, 4, 14, 10, 15, 24), level: 'INFO', message: 'Loading model...' },
      { timestamp: new Date(2025, 4, 14, 10, 15, 40), level: 'INFO', message: 'Model loaded successfully' },
      { timestamp: new Date(2025, 4, 14, 10, 15, 45), level: 'INFO', message: 'Starting API server' },
      { timestamp: new Date(2025, 4, 14, 10, 15, 47), level: 'WARNING', message: 'High memory usage detected' },
      { timestamp: new Date(2025, 4, 14, 10, 16, 0), level: 'INFO', message: 'API server started successfully' },
      { timestamp: new Date(2025, 4, 14, 10, 16, 5), level: 'ERROR', message: 'Failed to connect to cache server' },
      { timestamp: new Date(2025, 4, 14, 10, 16, 10), level: 'INFO', message: 'Retrying cache connection...' },
      { timestamp: new Date(2025, 4, 14, 10, 16, 15), level: 'INFO', message: 'Connected to cache server' },
      { timestamp: new Date(2025, 4, 14, 10, 30, 0), level: 'INFO', message: 'Health check passed' }
    ];
    
    setDeploymentLogs(mockLogs);
    setShowLogsModal(true);
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'running':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  // Get health class for styling
  const getHealthClass = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'unhealthy':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  // Get log level class for styling
  const getLogLevelClass = (level) => {
    switch (level) {
      case 'INFO':
        return 'text-info';
      case 'WARNING':
        return 'text-warning';
      case 'ERROR':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="kubernetes-deployments">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Kubernetes Deployments</h4>
        </div>
        <div>
          <Link to="/kubernetes/deployments/new" className="btn btn-primary">
            <i data-feather="plus" className="me-2"></i> Deploy Model
          </Link>
        </div>
      </div>

      {/* Deployment Stats */}
      <div className="row mb-4">
        <div className="col-md-3 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-primary mb-3">
                <i data-feather="box" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{deployments.length}</h5>
              <p className="text-muted mb-0">Total Deployments</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-success mb-3">
                <i data-feather="check-circle" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{deployments.filter(d => d.status === 'running').length}</h5>
              <p className="text-muted mb-0">Running</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-warning mb-3">
                <i data-feather="clock" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{deployments.filter(d => d.status === 'pending').length}</h5>
              <p className="text-muted mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-danger mb-3">
                <i data-feather="alert-circle" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{deployments.filter(d => d.status === 'failed').length}</h5>
              <p className="text-muted mb-0">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h6 className="card-title mb-0">Model Deployments</h6>
                <div className="d-flex">
                  <div className="input-group me-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search deployments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setSearchQuery('')}
                      >
                        <i data-feather="x"></i>
                      </button>
                    )}
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`btn ${filter === 'running' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('running')}
                    >
                      Running
                    </button>
                    <button
                      type="button"
                      className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('pending')}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      className={`btn ${filter === 'failed' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFilter('failed')}
                    >
                      Failed
                    </button>
                  </div>
                </div>
              </div>

              {filteredDeployments.length === 0 ? (
                <div className="text-center py-5">
                  <i data-feather="box" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                  <p className="mt-3">No deployments found</p>
                  <Link to="/kubernetes/deployments/new" className="btn btn-primary mt-2">
                    Deploy Model
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Health</th>
                        <th>Cluster</th>
                        <th>Replicas</th>
                        <th>Resources</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeployments.map((deployment) => (
                        <tr key={deployment.id} onClick={() => handleSelectDeployment(deployment)} className="clickable-row">
                          <td>{deployment.name}</td>
                          <td>{deployment.modelName}</td>
                          <td>
                            <span className={`badge ${getStatusClass(deployment.status)}`}>
                              {deployment.status}
                            </span>
                          </td>
                          <td>
                            <span className={getHealthClass(deployment.health.status)}>
                              <i data-feather={deployment.health.status === 'healthy' ? 'check-circle' : deployment.health.status === 'warning' ? 'alert-circle' : 'x-circle'} className="me-1"></i>
                              {deployment.health.status}
                            </span>
                          </td>
                          <td>{deployment.cluster}</td>
                          <td>{deployment.readyReplicas}/{deployment.replicas}</td>
                          <td>
                            <span className="resource-badge">
                              <i data-feather="cpu" className="me-1"></i> {deployment.cpu}
                            </span>
                            <span className="resource-badge">
                              <i data-feather="database" className="me-1"></i> {deployment.memory}
                            </span>
                            {deployment.gpu > 0 && (
                              <span className="resource-badge">
                                <i data-feather="sliders" className="me-1"></i> {deployment.gpu} GPU
                              </span>
                            )}
                          </td>
                          <td>{deployment.createdAt.toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex">
                              <button 
                                className="btn btn-sm btn-outline-primary me-1" 
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectDeployment(deployment);
                                }}
                              >
                                <i data-feather="eye" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary me-1" 
                                title="View Logs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShowLogs(deployment.id);
                                }}
                              >
                                <i data-feather="file-text" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // In a real app, you would call a method to delete the deployment
                                  if (confirm('Are you sure you want to delete this deployment?')) {
                                    setDeployments(deployments.filter(d => d.id !== deployment.id));
                                  }
                                }}
                              >
                                <i data-feather="trash-2" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Details Section */}
      {selectedDeployment && (
        <div className="row">
          <div className="col-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="card-title mb-0">Deployment Details: {selectedDeployment.name}</h6>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedDeployment(null)}>
                    <i data-feather="x" className="me-1"></i> Close
                  </button>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Basic Information</h6>
                      <div className="detail-item">
                        <span className="detail-label">Model:</span>
                        <span>{selectedDeployment.modelName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`badge ${getStatusClass(selectedDeployment.status)}`}>
                          {selectedDeployment.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Health:</span>
                        <span className={getHealthClass(selectedDeployment.health.status)}>
                          <i data-feather={selectedDeployment.health.status === 'healthy' ? 'check-circle' : 
                            selectedDeployment.health.status === 'warning' ? 'alert-circle' : 'x-circle'} className="me-1"></i>
                          {selectedDeployment.health.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Message:</span>
                        <span>{selectedDeployment.health.message}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created:</span>
                        <span>{selectedDeployment.createdAt.toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Last Updated:</span>
                        <span>{selectedDeployment.updatedAt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Deployment Configuration</h6>
                      <div className="detail-item">
                        <span className="detail-label">Cluster:</span>
                        <span>{selectedDeployment.cluster}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Namespace:</span>
                        <span>{selectedDeployment.namespace}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Replicas:</span>
                        <span>{selectedDeployment.readyReplicas}/{selectedDeployment.replicas}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">CPU Request:</span>
                        <span>{selectedDeployment.cpu}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Memory Request:</span>
                        <span>{selectedDeployment.memory}</span>
                      </div>
                      {selectedDeployment.gpu > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">GPU:</span>
                          <span>{selectedDeployment.gpu}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="detail-label">Image:</span>
                        <span>{selectedDeployment.image}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedDeployment.endpoints.length > 0 && (
                  <div className="row mb-4">
                    <div className="col-md-12">
                      <h6 className="text-muted mb-2">Endpoints</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>URL</th>
                              <th>Port</th>
                              <th>Protocol</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDeployment.endpoints.map((endpoint, index) => (
                              <tr key={index}>
                                <td>{endpoint.name}</td>
                                <td>{endpoint.url}</td>
                                <td>{endpoint.port}</td>
                                <td>{endpoint.protocol}</td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <i data-feather="external-link" className="me-1"></i> Open
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    <i data-feather="copy" className="me-1"></i> Copy URL
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-12">
                    <h6 className="text-muted mb-2">Actions</h6>
                    <div className="action-buttons">
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="refresh-cw" className="me-1"></i> Restart
                      </button>
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="plus-circle" className="me-1"></i> Scale
                      </button>
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="edit-2" className="me-1"></i> Edit
                      </button>
                      <button 
                        className="btn btn-outline-secondary me-2"
                        onClick={() => handleShowLogs(selectedDeployment.id)}
                      >
                        <i data-feather="file-text" className="me-1"></i> View Logs
                      </button>
                      <button className="btn btn-outline-danger">
                        <i data-feather="trash-2" className="me-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deployment Logs</h5>
                <button type="button" className="btn-close" onClick={() => setShowLogsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="logs-container">
                  {deploymentLogs.map((log, index) => (
                    <div key={index} className={`log-entry ${getLogLevelClass(log.level)}`}>
                      <span className="log-timestamp">{log.timestamp.toLocaleTimeString()}</span>
                      <span className="log-level">[{log.level}]</span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary me-2">
                  <i data-feather="download" className="me-1"></i> Download Logs
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setShowLogsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesDeployments;