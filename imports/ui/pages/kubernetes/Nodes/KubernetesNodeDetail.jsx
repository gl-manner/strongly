import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import feather from 'feather-icons';
import './KubernetesNodeDetail.scss';

/**
 * Node Detail View component following requirements section 5.2
 * Provides comprehensive interface for viewing and managing a specific node
 */
export const KubernetesNodeDetail = () => {
  const { nodeName } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [drainOptions, setDrainOptions] = useState({
    gracePeriod: 30,
    deleteLocalData: false,
    ignoreDaemonSets: true,
    respectPodDisruptionBudgets: true,
    force: false
  });

  // Mock node data - replace with real API call
  const nodeData = {
    metadata: {
      name: nodeName,
      uid: '123e4567-e89b-12d3-a456-426614174000',
      creationTimestamp: '2023-10-15T10:23:45Z',
      labels: {
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/hostname': nodeName,
        'kubernetes.io/os': 'linux',
        'node-role.kubernetes.io/control-plane': '',
        'node-role.kubernetes.io/master': '',
        'topology.kubernetes.io/zone': 'us-east-1a'
      },
      annotations: {
        'node.alpha.kubernetes.io/ttl': '0',
        'volumes.kubernetes.io/controller-managed-attach-detach': 'true'
      },
      taints: [
        {
          key: 'node-role.kubernetes.io/master',
          effect: 'NoSchedule'
        }
      ]
    },
    status: {
      phase: 'Ready',
      conditions: [
        { type: 'Ready', status: 'True', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'KubeletReady', message: 'kubelet is posting ready status' },
        { type: 'DiskPressure', status: 'False', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'KubeletHasSufficientDisk' },
        { type: 'MemoryPressure', status: 'False', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'KubeletHasSufficientMemory' },
        { type: 'PIDPressure', status: 'False', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'KubeletHasSufficientPID' },
        { type: 'NetworkUnavailable', status: 'False', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'RouteCreated' }
      ],
      addresses: [
        { type: 'InternalIP', address: '10.0.1.10' },
        { type: 'Hostname', address: nodeName }
      ],
      capacity: {
        'cpu': '4',
        'memory': '16384Mi',
        'ephemeral-storage': '100Gi',
        'pods': '110'
      },
      allocatable: {
        'cpu': '3.8',
        'memory': '15Gi',
        'ephemeral-storage': '90Gi',
        'pods': '110'
      },
      nodeInfo: {
        'machineID': '42383ae8cd224567890abcdef1234567',
        'systemUUID': '423838E8-CD22-4567-890A-BCDEF1234567',
        'bootID': '12345678-90ab-cdef-1234-567890abcdef',
        'kernelVersion': '5.4.0-42-generic',
        'osImage': 'Ubuntu 20.04.3 LTS',
        'containerRuntimeVersion': 'containerd://1.6.8',
        'kubeletVersion': 'v1.24.6',
        'kubeProxyVersion': 'v1.24.6',
        'operatingSystem': 'linux',
        'architecture': 'amd64'
      },
      images: [
        { names: ['k8s.gcr.io/pause:3.7'], sizeBytes: 711184 },
        { names: ['k8s.gcr.io/coredns:v1.8.6'], sizeBytes: 46829283 },
        { names: ['nginx:1.21.0'], sizeBytes: 133278897 }
      ]
    },
    usage: {
      cpu: { current: '1.2', percent: 31.6 },
      memory: { current: '6.5Gi', percent: 43.3 },
      storage: { current: '35Gi', percent: 38.9 },
      pods: { current: 28, percent: 25.5 }
    },
    cordoned: false
  };

  // Mock pods data
  const podsData = [
    {
      name: 'coredns-64897985d-2x4gh',
      namespace: 'kube-system',
      status: 'Running',
      cpuRequest: '100m',
      cpuUsage: '15m',
      memoryRequest: '70Mi',
      memoryUsage: '35Mi',
      restarts: 0,
      age: '43d'
    },
    {
      name: 'etcd-' + nodeName,
      namespace: 'kube-system',
      status: 'Running',
      cpuRequest: '100m',
      cpuUsage: '45m',
      memoryRequest: '100Mi',
      memoryUsage: '125Mi',
      restarts: 0,
      age: '43d'
    },
    {
      name: 'kube-apiserver-' + nodeName,
      namespace: 'kube-system',
      status: 'Running',
      cpuRequest: '250m',
      cpuUsage: '120m',
      memoryRequest: '2Gi',
      memoryUsage: '1.2Gi',
      restarts: 1,
      age: '43d'
    },
    {
      name: 'nginx-deployment-7fb96c846b-kp9tm',
      namespace: 'default',
      status: 'Running',
      cpuRequest: '100m',
      cpuUsage: '50m',
      memoryRequest: '128Mi',
      memoryUsage: '64Mi',
      restarts: 0,
      age: '5d'
    }
  ];

  // Mock events data
  const eventsData = [
    {
      timestamp: '2023-12-01T11:45:00Z',
      type: 'Normal',
      object: 'Node',
      reason: 'NodeReady',
      message: 'Node ' + nodeName + ' status is now: NodeReady',
      count: 1
    },
    {
      timestamp: '2023-12-01T10:30:00Z',
      type: 'Normal',
      object: 'Node',
      reason: 'RegisteredNode',
      message: 'Node ' + nodeName + ' event: Registered Node ' + nodeName + ' in NodeController',
      count: 1
    },
    {
      timestamp: '2023-12-01T09:15:00Z',
      type: 'Warning',
      object: 'Pod/nginx-deployment-7fb96c846b-kp9tm',
      reason: 'FailedScheduling',
      message: '0/5 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn\'t tolerate',
      count: 3
    }
  ];

  useEffect(() => {
    feather.replace();
  }, [activeTab]);

  const formatAge = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    return `${Math.floor(diffMs / (1000 * 60))}m`;
  };

  const getConditionIcon = (status) => {
    return status === 'True' ? 'check-circle' : status === 'False' ? 'x-circle' : 'help-circle';
  };

  const getConditionClass = (status) => {
    return status === 'True' ? 'text-success' : status === 'False' ? 'text-danger' : 'text-warning';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCordon = () => {
    console.log('Cordon node:', nodeData.metadata.name);
  };

  const handleDrain = () => {
    console.log('Drain node with options:', drainOptions);
  };

  const handleReboot = () => {
    console.log('Reboot node:', nodeData.metadata.name);
  };

  const yamlContent = `apiVersion: v1
kind: Node
metadata:
  name: ${nodeData.metadata.name}
  uid: ${nodeData.metadata.uid}
  labels:
    ${Object.entries(nodeData.metadata.labels).map(([key, value]) => `${key}: "${value}"`).join('\n    ')}
  annotations:
    ${Object.entries(nodeData.metadata.annotations).map(([key, value]) => `${key}: "${value}"`).join('\n    ')}
  taints:
  ${nodeData.metadata.taints.map(taint => `- key: ${taint.key}\n    effect: ${taint.effect}`).join('\n  ')}
status:
  phase: ${nodeData.status.phase}
  capacity:
    cpu: "${nodeData.status.capacity.cpu}"
    memory: "${nodeData.status.capacity.memory}"
    pods: "${nodeData.status.capacity.pods}"
  allocatable:
    cpu: "${nodeData.status.allocatable.cpu}"
    memory: "${nodeData.status.allocatable.memory}"
    pods: "${nodeData.status.allocatable.pods}"`;

  return (
    <div className="node-detail-view">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/kubernetes/dashboard">Kubernetes</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/kubernetes/nodes">Nodes</Link>
          </li>
          <li className="breadcrumb-item active">{nodeName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">{nodeName}</h4>
          <div className="d-flex align-items-center gap-3">
            <span className={`badge ${nodeData.status.phase === 'Ready' ? 'bg-success' : 'bg-danger'}`}>
              {nodeData.status.phase}
            </span>
            {nodeData.metadata.labels['node-role.kubernetes.io/master'] !== undefined && (
              <span className="badge bg-primary">control-plane</span>
            )}
            {nodeData.cordoned && (
              <span className="badge bg-warning">Cordoned</span>
            )}
            <span className="text-muted">
              <i data-feather="clock" style={{ width: '16px', height: '16px' }} className="me-1"></i>
              {formatAge(nodeData.metadata.creationTimestamp)}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={handleCordon}
          >
            <i data-feather={nodeData.cordoned ? 'play-circle' : 'pause-circle'} style={{ width: '16px', height: '16px' }} className="me-1"></i>
            {nodeData.cordoned ? 'Uncordon' : 'Cordon'}
          </button>
          <button 
            className="btn btn-outline-warning"
            data-bs-toggle="modal"
            data-bs-target="#drainModal"
          >
            <i data-feather="download" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Drain
          </button>
          <div className="dropdown">
            <button className="btn btn-outline-secondary" type="button" data-bs-toggle="dropdown">
              <i data-feather="more-vertical" style={{ width: '16px', height: '16px' }}></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <a className="dropdown-item" href="#" onClick={handleReboot}>
                  <i data-feather="refresh-cw" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                  Reboot
                </a>
              </li>
              <li>
                <Link className="dropdown-item" to={`/kubernetes/nodes/${nodeName}/terminal`}>
                  <i data-feather="terminal" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                  Terminal Access
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <a className="dropdown-item text-danger" href="#">
                  <i data-feather="trash-2" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                  Remove from Cluster
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i data-feather="grid" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'pods' ? 'active' : ''}`}
            onClick={() => setActiveTab('pods')}
          >
            <i data-feather="box" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Pods ({podsData.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <i data-feather="clock" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Events
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'yaml' ? 'active' : ''}`}
            onClick={() => setActiveTab('yaml')}
          >
            <i data-feather="code" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            YAML
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="row">
            <div className="col-md-6">
              {/* Node Metadata */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Node Metadata</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td className="fw-medium" style={{ width: '40%' }}>Name</td>
                        <td>{nodeData.metadata.name}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Status</td>
                        <td>
                          <span className={`badge ${nodeData.status.phase === 'Ready' ? 'bg-success' : 'bg-danger'}`}>
                            {nodeData.status.phase}
                          </span>
                          {nodeData.cordoned && (
                            <span className="badge bg-warning ms-2">Cordoned</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Roles</td>
                        <td>
                          {nodeData.metadata.labels['node-role.kubernetes.io/master'] !== undefined && (
                            <span className="badge bg-light text-dark me-1">control-plane</span>
                          )}
                          {nodeData.metadata.labels['node-role.kubernetes.io/master'] !== undefined && (
                            <span className="badge bg-light text-dark me-1">master</span>
                          )}
                          {nodeData.metadata.labels['node-role.kubernetes.io/worker'] !== undefined && (
                            <span className="badge bg-light text-dark me-1">worker</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Creation Time</td>
                        <td>{new Date(nodeData.metadata.creationTimestamp).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Kubernetes Version</td>
                        <td>{nodeData.status.nodeInfo.kubeletVersion}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Container Runtime</td>
                        <td>{nodeData.status.nodeInfo.containerRuntimeVersion}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">OS/Kernel</td>
                        <td>{nodeData.status.nodeInfo.osImage} / {nodeData.status.nodeInfo.kernelVersion}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Architecture</td>
                        <td>{nodeData.status.nodeInfo.architecture}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h6 className="mt-4 mb-3">Addresses</h6>
                  <table className="table table-sm">
                    <tbody>
                      {nodeData.status.addresses.map((addr, index) => (
                        <tr key={index}>
                          <td className="fw-medium" style={{ width: '40%' }}>{addr.type}</td>
                          <td>{addr.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h6 className="mt-4 mb-3">Labels</h6>
                  <div className="labels-container">
                    {Object.entries(nodeData.metadata.labels).map(([key, value]) => (
                      <span key={key} className="badge bg-light text-dark me-2 mb-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>

                  {nodeData.metadata.taints.length > 0 && (
                    <>
                      <h6 className="mt-4 mb-3">Taints</h6>
                      <div className="taints-container">
                        {nodeData.metadata.taints.map((taint, index) => (
                          <span key={index} className="badge bg-warning text-dark me-2 mb-2">
                            {taint.key}:{taint.effect}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {/* Status */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Status</h6>
                  
                  <h6 className="mt-3 mb-2">Conditions</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Last Transition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nodeData.status.conditions.map((condition, index) => (
                          <tr key={index}>
                            <td>{condition.type}</td>
                            <td>
                              <i 
                                data-feather={getConditionIcon(condition.status)} 
                                className={`${getConditionClass(condition.status)} me-1`}
                                style={{ width: '16px', height: '16px' }}
                              ></i>
                              {condition.status}
                            </td>
                            <td>{formatAge(condition.lastTransitionTime)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h6 className="mt-4 mb-3">Timeline</h6>
                  <div className="status-timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker bg-success"></div>
                      <div className="timeline-content">
                        <strong>Node Ready</strong>
                        <p className="text-muted mb-0">Node joined the cluster and is ready</p>
                        <small className="text-muted">{formatAge(nodeData.metadata.creationTimestamp)} ago</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Resource Utilization</h6>
                  
                  <div className="row mb-4">
                    <div className="col-6">
                      <h6 className="text-muted mb-2">Capacity</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td>CPU</td>
                            <td className="text-end">{nodeData.status.capacity.cpu} cores</td>
                          </tr>
                          <tr>
                            <td>Memory</td>
                            <td className="text-end">{nodeData.status.capacity.memory}</td>
                          </tr>
                          <tr>
                            <td>Storage</td>
                            <td className="text-end">{nodeData.status.capacity['ephemeral-storage']}</td>
                          </tr>
                          <tr>
                            <td>Pods</td>
                            <td className="text-end">{nodeData.status.capacity.pods}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-6">
                      <h6 className="text-muted mb-2">Allocatable</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td>CPU</td>
                            <td className="text-end">{nodeData.status.allocatable.cpu} cores</td>
                          </tr>
                          <tr>
                            <td>Memory</td>
                            <td className="text-end">{nodeData.status.allocatable.memory}</td>
                          </tr>
                          <tr>
                            <td>Storage</td>
                            <td className="text-end">{nodeData.status.allocatable['ephemeral-storage']}</td>
                          </tr>
                          <tr>
                            <td>Pods</td>
                            <td className="text-end">{nodeData.status.allocatable.pods}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <h6 className="text-muted mb-3">Current Utilization</h6>
                  <div className="resource-metrics">
                    <div className="metric-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>CPU</span>
                        <span className="fw-medium">{nodeData.usage.cpu.current} / {nodeData.status.allocatable.cpu} cores</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${nodeData.usage.cpu.percent > 80 ? 'bg-danger' : nodeData.usage.cpu.percent > 60 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${nodeData.usage.cpu.percent}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{nodeData.usage.cpu.percent}% used</small>
                    </div>

                    <div className="metric-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Memory</span>
                        <span className="fw-medium">{nodeData.usage.memory.current} / {nodeData.status.allocatable.memory}</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${nodeData.usage.memory.percent > 80 ? 'bg-danger' : nodeData.usage.memory.percent > 60 ? 'bg-warning' : 'bg-info'}`}
                          style={{ width: `${nodeData.usage.memory.percent}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{nodeData.usage.memory.percent}% used</small>
                    </div>

                    <div className="metric-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Storage</span>
                        <span className="fw-medium">{nodeData.usage.storage.current} / {nodeData.status.allocatable['ephemeral-storage']}</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${nodeData.usage.storage.percent > 80 ? 'bg-danger' : nodeData.usage.storage.percent > 60 ? 'bg-warning' : 'bg-primary'}`}
                          style={{ width: `${nodeData.usage.storage.percent}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{nodeData.usage.storage.percent}% used</small>
                    </div>

                    <div className="metric-item">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Pods</span>
                        <span className="fw-medium">{nodeData.usage.pods.current} / {nodeData.status.allocatable.pods}</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar ${nodeData.usage.pods.percent > 80 ? 'bg-danger' : nodeData.usage.pods.percent > 60 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${nodeData.usage.pods.percent}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{nodeData.usage.pods.percent}% used</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">System Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td className="fw-medium" style={{ width: '40%' }}>Machine ID</td>
                            <td><code>{nodeData.status.nodeInfo.machineID}</code></td>
                          </tr>
                          <tr>
                            <td className="fw-medium">System UUID</td>
                            <td><code>{nodeData.status.nodeInfo.systemUUID}</code></td>
                          </tr>
                          <tr>
                            <td className="fw-medium">Boot ID</td>
                            <td><code>{nodeData.status.nodeInfo.bootID}</code></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">Container Images ({nodeData.status.images.length})</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th className="text-end">Size</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nodeData.status.images.slice(0, 5).map((image, index) => (
                              <tr key={index}>
                                <td>{image.names[0]}</td>
                                <td className="text-end">{formatBytes(image.sizeBytes)}</td>
                              </tr>
                            ))}
                            {nodeData.status.images.length > 5 && (
                              <tr>
                                <td colSpan="2" className="text-center text-muted">
                                  ... and {nodeData.status.images.length - 5} more images
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pods Tab */}
        {activeTab === 'pods' && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Pods on this Node</h6>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>All Namespaces</option>
                    <option>kube-system</option>
                    <option>default</option>
                  </select>
                  <button className="btn btn-sm btn-outline-secondary">
                    <i data-feather="download" style={{ width: '14px', height: '14px' }}></i>
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Namespace</th>
                      <th>Status</th>
                      <th>CPU Request/Usage</th>
                      <th>Memory Request/Usage</th>
                      <th>Restarts</th>
                      <th>Age</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {podsData.map((pod, index) => (
                      <tr key={index}>
                        <td>
                          <Link to={`/kubernetes/pods/${pod.namespace}/${pod.name}`} className="text-decoration-none">
                            {pod.name}
                          </Link>
                        </td>
                        <td>{pod.namespace}</td>
                        <td>
                          <span className={`badge ${pod.status === 'Running' ? 'bg-success' : 'bg-warning'}`}>
                            {pod.status}
                          </span>
                        </td>
                        <td>{pod.cpuRequest} / {pod.cpuUsage}</td>
                        <td>{pod.memoryRequest} / {pod.memoryUsage}</td>
                        <td>{pod.restarts}</td>
                        <td>{pod.age}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link 
                              to={`/kubernetes/pods/${pod.namespace}/${pod.name}`}
                              className="btn btn-outline-primary"
                              title="View Details"
                            >
                              <i data-feather="eye" style={{ width: '14px', height: '14px' }}></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <h6>Pod Distribution</h6>
                <div className="row">
                  <div className="col-md-6">
                    <canvas id="podsByNamespace" height="200"></canvas>
                  </div>
                  <div className="col-md-6">
                    <canvas id="resourcesByPod" height="200"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Object</th>
                      <th>Reason</th>
                      <th>Message</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventsData.map((event, index) => (
                      <tr key={index}>
                        <td>{new Date(event.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${event.type === 'Normal' ? 'bg-info' : 'bg-warning'}`}>
                            {event.type}
                          </span>
                        </td>
                        <td>{event.object}</td>
                        <td>{event.reason}</td>
                        <td>{event.message}</td>
                        <td>{event.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* YAML Tab */}
        {activeTab === 'yaml' && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">YAML View</h6>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary">
                    <i data-feather="copy" style={{ width: '14px', height: '14px' }} className="me-1"></i>
                    Copy
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i data-feather="download" style={{ width: '14px', height: '14px' }} className="me-1"></i>
                    Download
                  </button>
                </div>
              </div>
              
              <div className="yaml-viewer">
                <pre className="language-yaml">
                  <code>{yamlContent}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drain Modal */}
      <div className="modal fade" id="drainModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Drain Node</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p>Draining a node will safely evict all pods from the node. Configure the drain options below:</p>
              
              <div className="mb-3">
                <label className="form-label">Grace Period (seconds)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={drainOptions.gracePeriod}
                  onChange={(e) => setDrainOptions({...drainOptions, gracePeriod: parseInt(e.target.value)})}
                />
              </div>

              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="deleteLocalData"
                  checked={drainOptions.deleteLocalData}
                  onChange={(e) => setDrainOptions({...drainOptions, deleteLocalData: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="deleteLocalData">
                  Delete local data
                </label>
              </div>

              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="ignoreDaemonSets"
                  checked={drainOptions.ignoreDaemonSets}
                  onChange={(e) => setDrainOptions({...drainOptions, ignoreDaemonSets: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="ignoreDaemonSets">
                  Ignore DaemonSets
                </label>
              </div>

              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="respectPDB"
                  checked={drainOptions.respectPodDisruptionBudgets}
                  onChange={(e) => setDrainOptions({...drainOptions, respectPodDisruptionBudgets: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="respectPDB">
                  Respect PodDisruptionBudgets
                </label>
              </div>

              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="force"
                  checked={drainOptions.force}
                  onChange={(e) => setDrainOptions({...drainOptions, force: e.target.checked})}
                />
                <label className="form-check-label" htmlFor="force">
                  Force drain
                </label>
              </div>

              <div className="alert alert-warning">
                <i data-feather="alert-triangle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                This action will evict all pods from the node. Make sure you have sufficient capacity on other nodes.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-warning" onClick={handleDrain} data-bs-dismiss="modal">
                Drain Node
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KubernetesNodeDetail;