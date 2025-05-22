// /imports/ui/pages/kubernetes/Clusters/KubernetesClusters.jsx
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import feather from 'feather-icons';
import './KubernetesClusters.scss';

export const KubernetesClusters = () => {
  // State for cluster data
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    apiEndpoint: '',
    region: '',
    version: '',
    nodeCount: 3,
    machineType: 'standard',
    kubeconfig: ''
  });
  const [selectedCluster, setSelectedCluster] = useState(null);

  // Sample data for development
  const [clusters, setClusters] = useState([
    {
      id: '1',
      name: 'production-cluster',
      status: 'active',
      region: 'us-east1',
      version: 'v1.24.6',
      nodeCount: 5,
      machineType: 'e2-standard-4',
      createdAt: new Date(2024, 2, 15),
      health: 'healthy'
    },
    {
      id: '2',
      name: 'staging-cluster',
      status: 'active',
      region: 'us-west1',
      version: 'v1.25.3',
      nodeCount: 3,
      machineType: 'e2-standard-2',
      createdAt: new Date(2024, 4, 1),
      health: 'warning'
    },
    {
      id: '3',
      name: 'development-cluster',
      status: 'inactive',
      region: 'europe-west1',
      version: 'v1.26.1',
      nodeCount: 2,
      machineType: 'e2-small',
      createdAt: new Date(2024, 1, 10),
      health: 'degraded'
    }
  ]);

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would call a Meteor method to create the cluster
    // For now, we'll just add it to our local state
    const newCluster = {
      id: Math.random().toString(36).substring(2, 9),
      ...formData,
      status: 'provisioning',
      createdAt: new Date(),
      health: 'pending'
    };
    
    setClusters([...clusters, newCluster]);
    setShowAddModal(false);
    setFormData({
      name: '',
      apiEndpoint: '',
      region: '',
      version: '',
      nodeCount: 3,
      machineType: 'standard',
      kubeconfig: ''
    });
  };

  // Handle cluster selection for details view
  const handleSelectCluster = (cluster) => {
    setSelectedCluster(cluster);
  };

  // Get cluster health class for styling
  const getHealthClass = (health) => {
    switch (health) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'degraded':
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  };

  return (
    <div className="kubernetes-clusters">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Kubernetes Clusters</h4>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i data-feather="plus" className="me-2"></i> Add Cluster
          </button>
        </div>
      </div>

      {/* Clusters Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-4 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-primary mb-3">
                <i data-feather="server" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{clusters.length}</h5>
              <p className="text-muted mb-0">Total Clusters</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-success mb-3">
                <i data-feather="check-circle" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{clusters.filter(c => c.status === 'active').length}</h5>
              <p className="text-muted mb-0">Active Clusters</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 grid-margin">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-warning mb-3">
                <i data-feather="activity" style={{ width: '36px', height: '36px' }}></i>
              </div>
              <h5>{clusters.reduce((sum, cluster) => sum + parseInt(cluster.nodeCount), 0)}</h5>
              <p className="text-muted mb-0">Total Nodes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clusters Table */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Managed Clusters</h6>

              {clusters.length === 0 ? (
                <div className="text-center py-5">
                  <i data-feather="server" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                  <p className="mt-3">No clusters found</p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Kubernetes Cluster
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Health</th>
                        <th>Region</th>
                        <th>Version</th>
                        <th>Nodes</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clusters.map((cluster) => (
                        <tr key={cluster.id} onClick={() => handleSelectCluster(cluster)} className="clickable-row">
                          <td>{cluster.name}</td>
                          <td>
                            <span className={`badge ${cluster.status === 'active' ? 'bg-success' : cluster.status === 'provisioning' ? 'bg-warning' : 'bg-danger'}`}>
                              {cluster.status}
                            </span>
                          </td>
                          <td>
                            <span className={getHealthClass(cluster.health)}>
                              <i data-feather={cluster.health === 'healthy' ? 'check-circle' : cluster.health === 'warning' ? 'alert-circle' : 'x-circle'} className="me-1"></i>
                              {cluster.health}
                            </span>
                          </td>
                          <td>{cluster.region}</td>
                          <td>{cluster.version}</td>
                          <td>{cluster.nodeCount}</td>
                          <td>{cluster.createdAt.toLocaleDateString()}</td>
                          <td>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-outline-primary me-1" title="View Details">
                                <i data-feather="eye" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary me-1" title="Edit Configuration">
                                <i data-feather="edit-2" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" title="Delete">
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

      {/* Cluster Details Section */}
      {selectedCluster && (
        <div className="row">
          <div className="col-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="card-title mb-0">Cluster Details: {selectedCluster.name}</h6>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedCluster(null)}>
                    <i data-feather="x" className="me-1"></i> Close
                  </button>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Basic Information</h6>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`badge ${selectedCluster.status === 'active' ? 'bg-success' : selectedCluster.status === 'provisioning' ? 'bg-warning' : 'bg-danger'}`}>
                          {selectedCluster.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Health:</span>
                        <span className={getHealthClass(selectedCluster.health)}>
                          <i data-feather={selectedCluster.health === 'healthy' ? 'check-circle' : selectedCluster.health === 'warning' ? 'alert-circle' : 'x-circle'} className="me-1"></i>
                          {selectedCluster.health}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Region:</span>
                        <span>{selectedCluster.region}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Kubernetes Version:</span>
                        <span>{selectedCluster.version}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created On:</span>
                        <span>{selectedCluster.createdAt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Resource Configuration</h6>
                      <div className="detail-item">
                        <span className="detail-label">Nodes:</span>
                        <span>{selectedCluster.nodeCount}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Machine Type:</span>
                        <span>{selectedCluster.machineType}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Auto-scaling:</span>
                        <span>Enabled (2-8 nodes)</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total vCPUs:</span>
                        <span>{selectedCluster.nodeCount * 4}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Total Memory:</span>
                        <span>{selectedCluster.nodeCount * 16} GB</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <h6 className="text-muted mb-2">Quick Actions</h6>
                    <div className="action-buttons">
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="refresh-cw" className="me-1"></i> Upgrade Version
                      </button>
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="plus-circle" className="me-1"></i> Scale Nodes
                      </button>
                      <button className="btn btn-outline-primary me-2">
                        <i data-feather="terminal" className="me-1"></i> Launch Terminal
                      </button>
                      <button className="btn btn-outline-primary">
                        <i data-feather="download" className="me-1"></i> Get Kubeconfig
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Cluster Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Kubernetes Cluster</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Cluster Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g., production-cluster"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Region <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Region</option>
                        <option value="us-east1">US East (N. Virginia)</option>
                        <option value="us-west1">US West (Oregon)</option>
                        <option value="europe-west1">Europe (Belgium)</option>
                        <option value="asia-east1">Asia Pacific (Taiwan)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Kubernetes Version <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="version"
                        value={formData.version}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Version</option>
                        <option value="v1.24.6">v1.24.6</option>
                        <option value="v1.25.3">v1.25.3</option>
                        <option value="v1.26.1">v1.26.1</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Node Count <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        name="nodeCount"
                        min="1"
                        max="10"
                        value={formData.nodeCount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Machine Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        name="machineType"
                        value={formData.machineType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Machine Type</option>
                        <option value="e2-small">e2-small (2 vCPU, 2GB memory)</option>
                        <option value="e2-standard-2">e2-standard-2 (2 vCPU, 8GB memory)</option>
                        <option value="e2-standard-4">e2-standard-4 (4 vCPU, 16GB memory)</option>
                        <option value="e2-standard-8">e2-standard-8 (8 vCPU, 32GB memory)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">API Endpoint (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apiEndpoint"
                      placeholder="e.g., https://k8s-api.example.com"
                      value={formData.apiEndpoint}
                      onChange={handleInputChange}
                    />
                    <div className="form-text">Leave blank for auto-provisioned clusters</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Kubeconfig (Optional)</label>
                    <textarea
                      className="form-control"
                      name="kubeconfig"
                      rows="5"
                      placeholder="Paste your kubeconfig YAML here"
                      value={formData.kubeconfig}
                      onChange={handleInputChange}
                    ></textarea>
                    <div className="form-text">Required only for connecting to existing clusters</div>
                  </div>

                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="enableMonitoring" />
                    <label className="form-check-label" htmlFor="enableMonitoring">
                      Enable Monitoring and Logging
                    </label>
                    <div className="form-text">Install monitoring and logging tools on the cluster</div>
                  </div>

                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="enableAutoScaling" />
                    <label className="form-check-label" htmlFor="enableAutoScaling">
                      Enable Auto-scaling
                    </label>
                    <div className="form-text">Automatically scale the number of nodes based on load</div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Cluster</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesClusters;