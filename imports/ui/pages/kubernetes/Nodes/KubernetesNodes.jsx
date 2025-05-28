import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import feather from 'feather-icons';
import './KubernetesNodes.scss';

/**
 * Node Overview component following requirements section 5.1
 * List view of all nodes in the cluster with summary metrics
 */
export const KubernetesNodes = () => {
  const { user, loading } = useTracker(() => {
    const subscription = Meteor.subscribe('userData');
    return {
      user: Meteor.user(),
      loading: !subscription.ready()
    };
  });

  const [nodes, setNodes] = useState([]);
  const [filteredNodes, setFilteredNodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // table or grid

  // Mock node data
  const mockNodes = [
    {
      id: 'node-01',
      name: 'node-01',
      status: 'Ready',
      roles: ['control-plane', 'master'],
      version: 'v1.24.6',
      os: 'Ubuntu 20.04',
      architecture: 'amd64',
      internalIP: '10.0.1.10',
      cpu: { used: 2.45, total: 4, percent: 61.25 },
      memory: { used: 7.5, total: 16, percent: 46.87 },
      pods: { running: 32, capacity: 110, percent: 29.09 },
      age: '43d',
      provider: 'AWS',
      instanceType: 't3.large',
      zone: 'us-east-1a',
      conditions: {
        diskPressure: false,
        memoryPressure: false,
        pidPressure: false,
        networkUnavailable: false
      }
    },
    {
      id: 'node-02',
      name: 'node-02',
      status: 'NotReady',
      roles: ['worker'],
      version: 'v1.24.6',
      os: 'Ubuntu 20.04',
      architecture: 'amd64',
      internalIP: '10.0.1.11',
      cpu: { used: 0, total: 4, percent: 0 },
      memory: { used: 0, total: 16, percent: 0 },
      pods: { running: 0, capacity: 110, percent: 0 },
      age: '43d',
      provider: 'AWS',
      instanceType: 't3.large',
      zone: 'us-east-1b',
      conditions: {
        diskPressure: false,
        memoryPressure: false,
        pidPressure: false,
        networkUnavailable: true
      }
    },
    {
      id: 'node-03',
      name: 'node-03',
      status: 'Ready',
      roles: ['worker'],
      version: 'v1.24.6',
      os: 'Ubuntu 20.04',
      architecture: 'amd64',
      internalIP: '10.0.1.12',
      cpu: { used: 3.2, total: 4, percent: 80 },
      memory: { used: 14.2, total: 16, percent: 88.75 },
      pods: { running: 85, capacity: 110, percent: 77.27 },
      age: '15d',
      provider: 'AWS',
      instanceType: 't3.large',
      zone: 'us-east-1c',
      conditions: {
        diskPressure: false,
        memoryPressure: true,
        pidPressure: false,
        networkUnavailable: false
      }
    },
    {
      id: 'node-04',
      name: 'node-04',
      status: 'Ready',
      roles: ['worker'],
      version: 'v1.24.5',
      os: 'Ubuntu 20.04',
      architecture: 'amd64',
      internalIP: '10.0.1.13',
      cpu: { used: 1.8, total: 8, percent: 22.5 },
      memory: { used: 12.5, total: 32, percent: 39.06 },
      pods: { running: 45, capacity: 220, percent: 20.45 },
      age: '15d',
      provider: 'AWS',
      instanceType: 't3.xlarge',
      zone: 'us-east-1a',
      conditions: {
        diskPressure: false,
        memoryPressure: false,
        pidPressure: false,
        networkUnavailable: false
      }
    },
    {
      id: 'node-05',
      name: 'node-05',
      status: 'Unknown',
      roles: ['worker'],
      version: 'v1.24.6',
      os: 'Ubuntu 20.04',
      architecture: 'amd64',
      internalIP: '10.0.1.14',
      cpu: { used: 0, total: 4, percent: 0 },
      memory: { used: 0, total: 16, percent: 0 },
      pods: { running: 0, capacity: 110, percent: 0 },
      age: '5d',
      provider: 'AWS',
      instanceType: 't3.large',
      zone: 'us-east-1b',
      conditions: {
        diskPressure: false,
        memoryPressure: false,
        pidPressure: false,
        networkUnavailable: true
      }
    }
  ];

  useEffect(() => {
    setNodes(mockNodes);
    setFilteredNodes(mockNodes);
  }, []);

  useEffect(() => {
    feather.replace();
  }, [viewMode]);

  useEffect(() => {
    filterAndSortNodes();
  }, [nodes, searchQuery, statusFilter, roleFilter, sortField, sortOrder]);

  const filterAndSortNodes = () => {
    let filtered = [...nodes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(node =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.internalIP.includes(searchQuery) ||
        node.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(node => node.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(node => node.roles.includes(roleFilter));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested properties
      if (sortField === 'cpu') aValue = a.cpu.percent;
      if (sortField === 'memory') bValue = b.memory.percent;
      if (sortField === 'pods') aValue = a.pods.percent;
      if (sortField === 'cpu') bValue = b.cpu.percent;
      if (sortField === 'memory') bValue = b.memory.percent;
      if (sortField === 'pods') bValue = b.pods.percent;

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredNodes(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedNodes(filteredNodes.map(node => node.id));
    } else {
      setSelectedNodes([]);
    }
  };

  const handleSelectNode = (nodeId) => {
    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes(selectedNodes.filter(id => id !== nodeId));
    } else {
      setSelectedNodes([...selectedNodes, nodeId]);
    }
  };

  const handleCordon = (node) => {
    console.log('Cordon node:', node.name);
    // Implement cordon logic
  };

  const handleDrain = (node) => {
    console.log('Drain node:', node.name);
    // Implement drain logic
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Ready': return 'badge bg-success';
      case 'NotReady': return 'badge bg-danger';
      case 'Unknown': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  };

  const getResourceUtilizationClass = (percent) => {
    if (percent >= 80) return 'bg-danger';
    if (percent >= 60) return 'bg-warning';
    return 'bg-success';
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="kubernetes-nodes">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Nodes</h4>
          <p className="text-muted mb-0">Manage and monitor Kubernetes cluster nodes</p>
        </div>
        <div className="d-flex align-items-center flex-wrap text-nowrap">
          <Link to="/kubernetes/nodes/capacity-planning" className="btn btn-outline-primary btn-icon-text me-2 mb-2 mb-md-0">
            <i data-feather="bar-chart-2" style={{ width: '16px', height: '16px' }} className="btn-icon-prepend"></i>
            Capacity Planning
          </Link>
          <button className="btn btn-primary btn-icon-text mb-2 mb-md-0">
            <i data-feather="plus" style={{ width: '16px', height: '16px' }} className="btn-icon-prepend"></i>
            Add Node
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="row">
        <div className="col-md-3 col-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline">
                <h6 className="card-title mb-0">Total Nodes</h6>
                <i data-feather="server" style={{ width: '20px', height: '20px' }} className="text-primary"></i>
              </div>
              <div className="row">
                <div className="col-12">
                  <h3 className="mb-2">{nodes.length}</h3>
                  <div className="d-flex align-items-baseline">
                    <p className="text-success">
                      <span>{nodes.filter(n => n.status === 'Ready').length} Ready</span>
                    </p>
                    <span className="mx-2">·</span>
                    <p className="text-danger">
                      <span>{nodes.filter(n => n.status === 'NotReady').length} Not Ready</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline">
                <h6 className="card-title mb-0">CPU Usage</h6>
                <i data-feather="cpu" style={{ width: '20px', height: '20px' }} className="text-info"></i>
              </div>
              <div className="row">
                <div className="col-12">
                  <h3 className="mb-2">
                    {nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.cpu.used : 0), 0).toFixed(1)} / {nodes.reduce((sum, node) => sum + node.cpu.total, 0)}
                  </h3>
                  <div className="progress progress-sm">
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: `${(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.cpu.used : 0), 0) / nodes.reduce((sum, node) => sum + node.cpu.total, 0) * 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                  <p className="text-muted mt-1 mb-0">
                    {(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.cpu.used : 0), 0) / nodes.reduce((sum, node) => sum + node.cpu.total, 0) * 100).toFixed(1)}% utilized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline">
                <h6 className="card-title mb-0">Memory Usage</h6>
                <i data-feather="database" style={{ width: '20px', height: '20px' }} className="text-warning"></i>
              </div>
              <div className="row">
                <div className="col-12">
                  <h3 className="mb-2">
                    {nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.memory.used : 0), 0).toFixed(1)} / {nodes.reduce((sum, node) => sum + node.memory.total, 0)} Gi
                  </h3>
                  <div className="progress progress-sm">
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.memory.used : 0), 0) / nodes.reduce((sum, node) => sum + node.memory.total, 0) * 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                  <p className="text-muted mt-1 mb-0">
                    {(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.memory.used : 0), 0) / nodes.reduce((sum, node) => sum + node.memory.total, 0) * 100).toFixed(1)}% utilized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-baseline">
                <h6 className="card-title mb-0">Total Pods</h6>
                <i data-feather="box" style={{ width: '20px', height: '20px' }} className="text-success"></i>
              </div>
              <div className="row">
                <div className="col-12">
                  <h3 className="mb-2">
                    {nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.pods.running : 0), 0)} / {nodes.reduce((sum, node) => sum + node.pods.capacity, 0)}
                  </h3>
                  <div className="progress progress-sm">
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: `${(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.pods.running : 0), 0) / nodes.reduce((sum, node) => sum + node.pods.capacity, 0) * 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                  <p className="text-muted mt-1 mb-0">
                    {(nodes.reduce((sum, node) => sum + (node.status === 'Ready' ? node.pods.running : 0), 0) / nodes.reduce((sum, node) => sum + node.pods.capacity, 0) * 100).toFixed(1)}% utilized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, IP, or provider..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Ready">Ready</option>
                    <option value="NotReady">Not Ready</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Role</label>
                  <select 
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="control-plane">Control Plane</option>
                    <option value="master">Master</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-2">
                    {selectedNodes.length > 0 && (
                      <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Bulk Actions ({selectedNodes.length})
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#">Cordon Selected</a></li>
                          <li><a className="dropdown-item" href="#">Drain Selected</a></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><a className="dropdown-item text-danger" href="#">Delete Selected</a></li>
                        </ul>
                      </div>
                    )}
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.reload()}
                    >
                      <i data-feather="refresh-cw" style={{ width: '16px', height: '16px' }}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">View</label>
                  <div className="btn-group w-100" role="group">
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                    >
                      <i data-feather="list" style={{ width: '16px', height: '16px' }}></i>
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i data-feather="grid" style={{ width: '16px', height: '16px' }}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nodes List/Grid */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              {viewMode === 'table' ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>
                          <input 
                            type="checkbox" 
                            className="form-check-input"
                            onChange={handleSelectAll}
                            checked={selectedNodes.length === filteredNodes.length && filteredNodes.length > 0}
                          />
                        </th>
                        <th className="sortable" onClick={() => handleSort('name')}>
                          Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('status')}>
                          Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Roles</th>
                        <th className="sortable" onClick={() => handleSort('version')}>
                          Version {sortField === 'version' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>OS / Arch</th>
                        <th>Internal IP</th>
                        <th className="sortable" onClick={() => handleSort('cpu')}>
                          CPU {sortField === 'cpu' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('memory')}>
                          Memory {sortField === 'memory' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('pods')}>
                          Pods {sortField === 'pods' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('age')}>
                          Age {sortField === 'age' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th>Provider</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNodes.map(node => (
                        <tr key={node.id}>
                          <td>
                            <input 
                              type="checkbox" 
                              className="form-check-input"
                              checked={selectedNodes.includes(node.id)}
                              onChange={() => handleSelectNode(node.id)}
                            />
                          </td>
                          <td>
                            <Link to={`/kubernetes/nodes/${node.name}`} className="text-decoration-none">
                              {node.name}
                            </Link>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(node.status)}>
                              {node.status}
                            </span>
                          </td>
                          <td>
                            {node.roles.map(role => (
                              <span key={role} className="badge bg-light text-dark me-1">
                                {role}
                              </span>
                            ))}
                          </td>
                          <td>{node.version}</td>
                          <td>{node.os} / {node.architecture}</td>
                          <td>{node.internalIP}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{node.cpu.used}/{node.cpu.total} cores</span>
                              <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.cpu.percent)}`}
                                  style={{ width: `${node.cpu.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{node.memory.used}/{node.memory.total} Gi</span>
                              <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.memory.percent)}`}
                                  style={{ width: `${node.memory.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{node.pods.running}/{node.pods.capacity}</span>
                              <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.pods.percent)}`}
                                  style={{ width: `${node.pods.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>{node.age}</td>
                          <td>{node.provider}</td>
                          <td>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i data-feather="more-vertical" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link className="dropdown-item" to={`/kubernetes/nodes/${node.name}`}>
                                    <i data-feather="eye" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                                    View Details
                                  </Link>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleCordon(node)}>
                                    <i data-feather="pause-circle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                                    {node.status === 'Ready' ? 'Cordon' : 'Uncordon'}
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleDrain(node)}>
                                    <i data-feather="download" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                                    Drain Node
                                  </a>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <a className="dropdown-item text-danger" href="#">
                                    <i data-feather="trash-2" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                                    Delete Node
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredNodes.length === 0 && (
                    <div className="text-center py-5">
                      <i data-feather="server" style={{ width: '48px', height: '48px', strokeWidth: 1 }} className="text-muted mb-3"></i>
                      <p className="text-muted">No nodes found matching your filters</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="row">
                  {filteredNodes.map(node => (
                    <div key={node.id} className="col-md-6 col-lg-4 mb-4">
                      <div className={`card node-card ${node.status.toLowerCase()}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="card-title mb-1">
                                <Link to={`/kubernetes/nodes/${node.name}`} className="text-decoration-none">
                                  {node.name}
                                </Link>
                              </h5>
                              <div className="d-flex gap-2">
                                <span className={getStatusBadgeClass(node.status)}>
                                  {node.status}
                                </span>
                                {node.roles.map(role => (
                                  <span key={role} className="badge bg-light text-dark">
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i data-feather="more-vertical" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link className="dropdown-item" to={`/kubernetes/nodes/${node.name}`}>
                                    View Details
                                  </Link>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleCordon(node)}>
                                    {node.status === 'Ready' ? 'Cordon' : 'Uncordon'}
                                  </a>
                                </li>
                                <li>
                                  <a className="dropdown-item" href="#" onClick={() => handleDrain(node)}>
                                    Drain Node
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="node-info mb-3">
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">Version</span>
                              <span>{node.version}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">OS</span>
                              <span>{node.os}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">IP</span>
                              <span>{node.internalIP}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">Provider</span>
                              <span>{node.provider} ({node.instanceType})</span>
                            </div>
                          </div>

                          <div className="node-resources">
                            <div className="resource-item mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">CPU</span>
                                <span>{node.cpu.used}/{node.cpu.total} cores ({node.cpu.percent}%)</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.cpu.percent)}`}
                                  style={{ width: `${node.cpu.percent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="resource-item mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Memory</span>
                                <span>{node.memory.used}/{node.memory.total} Gi ({node.memory.percent}%)</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.memory.percent)}`}
                                  style={{ width: `${node.memory.percent}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="resource-item">
                              <div className="d-flex justify-content-between mb-1">
                                <span className="text-muted">Pods</span>
                                <span>{node.pods.running}/{node.pods.capacity} ({node.pods.percent}%)</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className={`progress-bar ${getResourceUtilizationClass(node.pods.percent)}`}
                                  style={{ width: `${node.pods.percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredNodes.length === 0 && (
                    <div className="col-12 text-center py-5">
                      <i data-feather="server" style={{ width: '48px', height: '48px', strokeWidth: 1 }} className="text-muted mb-3"></i>
                      <p className="text-muted">No nodes found matching your filters</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KubernetesNodes;