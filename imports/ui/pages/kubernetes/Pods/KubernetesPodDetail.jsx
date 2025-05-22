// /imports/ui/pages/kubernetes/Pods/KubernetesPodDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import feather from 'feather-icons';
import './KubernetesPodDetail.scss';

/**
 * Pod Detail View component following requirements section 4.1
 * Provides comprehensive interface for viewing and managing a specific pod
 */
export const KubernetesPodDetail = () => {
  const { namespace, podName } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [logSettings, setLogSettings] = useState({
    container: 'main',
    lines: 100,
    follow: false,
    since: '1h'
  });
  const [yamlEditorContent, setYamlEditorContent] = useState('');
  const [yamlModified, setYamlModified] = useState(false);

  // Mock pod data - replace with real API call
  const podData = {
    metadata: {
      name: podName,
      namespace: namespace,
      node: 'node-04',
      ipAddress: '10.244.1.45',
      qosClass: 'Burstable',
      creationTimestamp: '2023-12-01T10:23:45Z',
      ownerReference: {
        kind: 'Deployment',
        name: 'web-server',
        uid: 'a1b2c3d4-e5f6-7890'
      },
      labels: {
        app: 'web-server',
        version: 'v1.2.3',
        environment: 'production'
      },
      annotations: {
        'deployment.kubernetes.io/revision': '5',
        'kubectl.kubernetes.io/last-applied-configuration': '{...}'
      }
    },
    status: {
      phase: 'Running',
      conditions: [
        { type: 'PodScheduled', status: 'True', lastTransitionTime: '2023-12-01T10:23:45Z', reason: 'PodScheduled' },
        { type: 'Initialized', status: 'True', lastTransitionTime: '2023-12-01T10:23:46Z', reason: 'PodReadyConditionMet' },
        { type: 'ContainersReady', status: 'True', lastTransitionTime: '2023-12-01T10:24:15Z', reason: 'ContainersReady' },
        { type: 'Ready', status: 'True', lastTransitionTime: '2023-12-01T10:24:15Z', reason: 'PodReadyConditionMet' }
      ],
      containerStatuses: [
        {
          name: 'main',
          state: { running: { startedAt: '2023-12-01T10:24:10Z' } },
          ready: true,
          restartCount: 0,
          image: 'nginx:1.21.0',
          imageID: 'sha256:abc123...',
          containerID: 'containerd://def456...'
        },
        {
          name: 'sidecar',
          state: { running: { startedAt: '2023-12-01T10:24:12Z' } },
          ready: true,
          restartCount: 1,
          image: 'busybox:1.35',
          imageID: 'sha256:xyz789...',
          containerID: 'containerd://ghi012...'
        }
      ]
    },
    spec: {
      containers: [
        {
          name: 'main',
          image: 'nginx:1.21.0',
          ports: [{ containerPort: 80, protocol: 'TCP' }],
          env: [
            { name: 'ENV', value: 'production' },
            { name: 'DEBUG', value: 'false' }
          ],
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '512Mi' }
          },
          volumeMounts: [
            { name: 'config-volume', mountPath: '/etc/config', readOnly: true },
            { name: 'data-volume', mountPath: '/var/data' }
          ],
          livenessProbe: {
            httpGet: { path: '/health', port: 80 },
            initialDelaySeconds: 30,
            periodSeconds: 10
          },
          readinessProbe: {
            httpGet: { path: '/ready', port: 80 },
            initialDelaySeconds: 5,
            periodSeconds: 5
          }
        }
      ],
      volumes: [
        {
          name: 'config-volume',
          configMap: { name: 'app-config' }
        },
        {
          name: 'data-volume',
          persistentVolumeClaim: { claimName: 'data-pvc' }
        }
      ],
      restartPolicy: 'Always',
      nodeName: 'node-04'
    },
    utilization: {
      cpu: { current: '125m', percent: 25 },
      memory: { current: '256Mi', percent: 50 }
    }
  };

  // Mock events data
  const eventsData = [
    {
      timestamp: '2023-12-01T10:23:45Z',
      type: 'Normal',
      reason: 'Scheduled',
      message: 'Successfully assigned production/web-server-7d8f9 to node-04',
      count: 1
    },
    {
      timestamp: '2023-12-01T10:23:50Z',
      type: 'Normal',
      reason: 'Pulling',
      message: 'Pulling image "nginx:1.21.0"',
      count: 1
    },
    {
      timestamp: '2023-12-01T10:24:10Z',
      type: 'Normal',
      reason: 'Pulled',
      message: 'Successfully pulled image "nginx:1.21.0"',
      count: 1
    },
    {
      timestamp: '2023-12-01T10:24:15Z',
      type: 'Normal',
      reason: 'Started',
      message: 'Started container main',
      count: 1
    }
  ];

  // Mock logs data
  const logsData = [
    { timestamp: '2023-12-01T10:24:15Z', level: 'INFO', message: 'Starting nginx server...' },
    { timestamp: '2023-12-01T10:24:16Z', level: 'INFO', message: 'Nginx server started successfully on port 80' },
    { timestamp: '2023-12-01T10:25:00Z', level: 'INFO', message: 'Received GET request for /' },
    { timestamp: '2023-12-01T10:25:30Z', level: 'INFO', message: 'Received GET request for /health' },
    { timestamp: '2023-12-01T10:26:00Z', level: 'INFO', message: 'Health check passed' }
  ];

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [activeTab]);

  // Generate YAML content when YAML tab is accessed
  useEffect(() => {
    if (activeTab === 'yaml' && !yamlEditorContent) {
      const yamlContent = generatePodYAML(podData);
      setYamlEditorContent(yamlContent);
    }
  }, [activeTab]);

  const generatePodYAML = (pod) => {
    return `apiVersion: v1
kind: Pod
metadata:
  name: ${pod.metadata.name}
  namespace: ${pod.metadata.namespace}
  labels:
    ${Object.entries(pod.metadata.labels).map(([key, value]) => `${key}: ${value}`).join('\n    ')}
  annotations:
    ${Object.entries(pod.metadata.annotations).map(([key, value]) => `${key}: "${value}"`).join('\n    ')}
spec:
  containers:
  - name: ${pod.spec.containers[0].name}
    image: ${pod.spec.containers[0].image}
    ports:
    ${pod.spec.containers[0].ports.map(port => `- containerPort: ${port.containerPort}\n      protocol: ${port.protocol}`).join('\n    ')}
    env:
    ${pod.spec.containers[0].env.map(env => `- name: ${env.name}\n      value: "${env.value}"`).join('\n    ')}
    resources:
      requests:
        cpu: ${pod.spec.containers[0].resources.requests.cpu}
        memory: ${pod.spec.containers[0].resources.requests.memory}
      limits:
        cpu: ${pod.spec.containers[0].resources.limits.cpu}
        memory: ${pod.spec.containers[0].resources.limits.memory}
    volumeMounts:
    ${pod.spec.containers[0].volumeMounts.map(vm => `- name: ${vm.name}\n      mountPath: ${vm.mountPath}${vm.readOnly ? '\n      readOnly: true' : ''}`).join('\n    ')}
  volumes:
  ${pod.spec.volumes.map(vol => {
    if (vol.configMap) {
      return `- name: ${vol.name}\n    configMap:\n      name: ${vol.configMap.name}`;
    } else if (vol.persistentVolumeClaim) {
      return `- name: ${vol.name}\n    persistentVolumeClaim:\n      claimName: ${vol.persistentVolumeClaim.claimName}`;
    }
    return `- name: ${vol.name}`;
  }).join('\n  ')}
  restartPolicy: ${pod.spec.restartPolicy}
  nodeName: ${pod.spec.nodeName}`;
  };

  const handleYamlChange = (e) => {
    setYamlEditorContent(e.target.value);
    setYamlModified(true);
  };

  const handleYamlApply = () => {
    // Implement YAML apply logic
    console.log('Applying YAML changes:', yamlEditorContent);
    setYamlModified(false);
  };

  const handleYamlRevert = () => {
    const originalYaml = generatePodYAML(podData);
    setYamlEditorContent(originalYaml);
    setYamlModified(false);
  };

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Running': return 'badge bg-success';
      case 'Pending': return 'badge bg-warning';
      case 'Failed': return 'badge bg-danger';
      case 'Succeeded': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  };

  const getConditionIcon = (status) => {
    return status === 'True' ? 'check-circle' : status === 'False' ? 'x-circle' : 'help-circle';
  };

  const getConditionClass = (status) => {
    return status === 'True' ? 'text-success' : status === 'False' ? 'text-danger' : 'text-warning';
  };

  return (
    <div className="pod-detail-view">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/kubernetes/dashboard">Kubernetes</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/kubernetes/pods">Pods</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/kubernetes/namespaces/${namespace}`}>{namespace}</Link>
          </li>
          <li className="breadcrumb-item active">{podName}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">{podName}</h4>
          <div className="d-flex align-items-center gap-3">
            <span className={getStatusBadgeClass(podData.status.phase)}>
              {podData.status.phase}
            </span>
            <span className="text-muted">
              <i data-feather="server" style={{ width: '16px', height: '16px' }} className="me-1"></i>
              {podData.metadata.node}
            </span>
            <span className="text-muted">
              <i data-feather="clock" style={{ width: '16px', height: '16px' }} className="me-1"></i>
              {formatAge(podData.metadata.creationTimestamp)}
            </span>
          </div>
        </div>
        
        {/* Global Actions */}
        <div className="btn-group">
          <button className="btn btn-outline-primary">
            <i data-feather="edit-3" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Edit
          </button>
          <button className="btn btn-outline-secondary">
            <i data-feather="copy" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Clone
          </button>
          <button className="btn btn-outline-danger">
            <i data-feather="trash-2" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Delete
          </button>
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
            className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <i data-feather="file-text" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Logs
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
            className={`nav-link ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <i data-feather="terminal" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Terminal
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
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'volumes' ? 'active' : ''}`}
            onClick={() => setActiveTab('volumes')}
          >
            <i data-feather="database" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Volumes
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'environment' ? 'active' : ''}`}
            onClick={() => setActiveTab('environment')}
          >
            <i data-feather="settings" style={{ width: '16px', height: '16px' }} className="me-1"></i>
            Environment
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="row">
            <div className="col-md-6">
              {/* Pod Metadata */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Pod Metadata</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td className="fw-medium">Name</td>
                        <td>{podData.metadata.name}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Namespace</td>
                        <td>
                          <Link to={`/kubernetes/namespaces/${podData.metadata.namespace}`}>
                            {podData.metadata.namespace}
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Node</td>
                        <td>
                          <Link to={`/kubernetes/nodes/${podData.metadata.node}`}>
                            {podData.metadata.node}
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-medium">IP Address</td>
                        <td>{podData.metadata.ipAddress}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">QoS Class</td>
                        <td>{podData.metadata.qosClass}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Creation Time</td>
                        <td>{new Date(podData.metadata.creationTimestamp).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="fw-medium">Owner Reference</td>
                        <td>
                          <Link to={`/kubernetes/deployments/${podData.metadata.ownerReference.name}`}>
                            {podData.metadata.ownerReference.kind}/{podData.metadata.ownerReference.name}
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Labels */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Labels</h6>
                  <div className="labels-container">
                    {Object.entries(podData.metadata.labels).map(([key, value]) => (
                      <span key={key} className="badge bg-light text-dark me-2 mb-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {/* Status */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Status</h6>
                  <div className="d-flex align-items-center mb-3">
                    <span className={getStatusBadgeClass(podData.status.phase)}>
                      {podData.status.phase}
                    </span>
                  </div>
                  
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
                        {podData.status.conditions.map((condition, index) => (
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
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">Resource Utilization</h6>
                  <div className="row">
                    <div className="col-6">
                      <div className="resource-metric">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted">CPU</span>
                          <span className="fw-medium">{podData.utilization.cpu.current}</span>
                        </div>
                        <div className="progress mb-2">
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${podData.utilization.cpu.percent}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">{podData.utilization.cpu.percent}% of limit</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="resource-metric">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-muted">Memory</span>
                          <span className="fw-medium">{podData.utilization.memory.current}</span>
                        </div>
                        <div className="progress mb-2">
                          <div 
                            className="progress-bar bg-info" 
                            style={{ width: `${podData.utilization.memory.percent}%` }}
                          ></div>
                        </div>
                        <small className="text-muted">{podData.utilization.memory.percent}% of limit</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Containers List */}
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Containers</h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Image</th>
                          <th>Status</th>
                          <th>Restart Count</th>
                          <th>Ports</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {podData.status.containerStatuses.map((container, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{container.name}</td>
                            <td>{container.image}</td>
                            <td>
                              <span className="badge bg-success">Running</span>
                            </td>
                            <td>{container.restartCount}</td>
                            <td>
                              {podData.spec.containers
                                .find(c => c.name === container.name)?.ports
                                ?.map(port => `${port.containerPort}/${port.protocol}`)
                                .join(', ') || '-'}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => setActiveTab('logs')}
                                  title="View Logs"
                                >
                                  <i data-feather="file-text" style={{ width: '14px', height: '14px' }}></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => setActiveTab('terminal')}
                                  title="Terminal"
                                >
                                  <i data-feather="terminal" style={{ width: '14px', height: '14px' }}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="card">
            <div className="card-body">
              {/* Log Controls */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Container</label>
                  <select 
                    className="form-select form-select-sm"
                    value={logSettings.container}
                    onChange={(e) => setLogSettings(prev => ({ ...prev, container: e.target.value }))}
                  >
                    {podData.status.containerStatuses.map(container => (
                      <option key={container.name} value={container.name}>
                        {container.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Lines</label>
                  <select 
                    className="form-select form-select-sm"
                    value={logSettings.lines}
                    onChange={(e) => setLogSettings(prev => ({ ...prev, lines: Number(e.target.value) }))}
                  >
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Since</label>
                  <select 
                    className="form-select form-select-sm"
                    value={logSettings.since}
                    onChange={(e) => setLogSettings(prev => ({ ...prev, since: e.target.value }))}
                  >
                    <option value="1h">1 hour</option>
                    <option value="6h">6 hours</option>
                    <option value="24h">24 hours</option>
                    <option value="7d">7 days</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-2">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="followLogs"
                        checked={logSettings.follow}
                        onChange={(e) => setLogSettings(prev => ({ ...prev, follow: e.target.checked }))}
                      />
                      <label className="form-check-label" htmlFor="followLogs">
                        Follow
                      </label>
                    </div>
                  </div>
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-secondary" title="Download">
                      <i data-feather="download" style={{ width: '14px', height: '14px' }}></i>
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" title="Refresh">
                      <i data-feather="refresh-cw" style={{ width: '14px', height: '14px' }}></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Display */}
              <div className="logs-container">
                <pre className="logs-content">
                  {logsData.map((log, index) => (
                    <div key={index} className={`log-line log-${log.level.toLowerCase()}`}>
                      <span className="log-timestamp">{log.timestamp}</span>
                      <span className="log-level">{log.level}</span>
                      <span className="log-message">{log.message}</span>
                    </div>
                  ))}
                </pre>
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

        {/* Terminal Tab */}
        {activeTab === 'terminal' && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label mb-0">Container:</label>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    {podData.status.containerStatuses.map(container => (
                      <option key={container.name} value={container.name}>
                        {container.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-secondary">
                    <i data-feather="maximize-2" style={{ width: '14px', height: '14px' }}></i>
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i data-feather="download" style={{ width: '14px', height: '14px' }}></i>
                  </button>
                </div>
              </div>
              
              <div className="terminal-container">
                <div className="terminal-content">
                  <div className="terminal-line">
                    <span className="terminal-prompt">root@{podName}:/#</span>
                    <span className="terminal-cursor">_</span>
                  </div>
                </div>
                <div className="mt-3 text-center text-muted">
                  <i data-feather="terminal" style={{ width: '48px', height: '48px' }} className="mb-2"></i>
                  <p>Interactive terminal session will be displayed here</p>
                  <small>This requires WebSocket connection to the Kubernetes API</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YAML Tab */}
        {activeTab === 'yaml' && (
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">YAML Editor</h6>
                <div className="btn-group btn-group-sm">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={handleYamlApply}
                    disabled={!yamlModified}
                  >
                    <i data-feather="save" style={{ width: '14px', height: '14px' }} className="me-1"></i>
                    Apply
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleYamlRevert}
                    disabled={!yamlModified}
                  >
                    <i data-feather="rotate-ccw" style={{ width: '14px', height: '14px' }} className="me-1"></i>
                    Revert
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i data-feather="download" style={{ width: '14px', height: '14px' }} className="me-1"></i>
                    Download
                  </button>
                </div>
              </div>
              
              {yamlModified && (
                <div className="alert alert-warning d-flex align-items-center mb-3">
                  <i data-feather="alert-triangle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                  You have unsaved changes. Click Apply to save or Revert to cancel.
                </div>
              )}

              <div className="yaml-editor">
                <textarea
                  className="form-control"
                  rows={25}
                  value={yamlEditorContent}
                  onChange={handleYamlChange}
                  style={{ fontFamily: 'Monaco, Consolas, "Lucida Console", monospace', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Volumes Tab */}
        {activeTab === 'volumes' && (
          <div className="row">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Volumes</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {podData.spec.volumes.map((volume, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{volume.name}</td>
                            <td>
                              {volume.configMap && 'ConfigMap'}
                              {volume.persistentVolumeClaim && 'PVC'}
                            </td>
                            <td>
                              {volume.configMap && (
                                <Link to={`/kubernetes/configmaps/${volume.configMap.name}`}>
                                  {volume.configMap.name}
                                </Link>
                              )}
                              {volume.persistentVolumeClaim && (
                                <Link to={`/kubernetes/persistent-volume-claims/${volume.persistentVolumeClaim.claimName}`}>
                                  {volume.persistentVolumeClaim.claimName}
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">Volume Mounts</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Container</th>
                          <th>Volume</th>
                          <th>Mount Path</th>
                          <th>Read Only</th>
                        </tr>
                      </thead>
                      <tbody>
                        {podData.spec.containers.map(container => 
                          container.volumeMounts?.map((mount, index) => (
                            <tr key={`${container.name}-${index}`}>
                              <td>{container.name}</td>
                              <td className="fw-medium">{mount.name}</td>
                              <td>{mount.mountPath}</td>
                              <td>
                                {mount.readOnly ? (
                                  <i data-feather="check" className="text-success" style={{ width: '16px', height: '16px' }}></i>
                                ) : (
                                  <i data-feather="x" className="text-muted" style={{ width: '16px', height: '16px' }}></i>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Environment Variables</h6>
              
              {podData.spec.containers.map((container, containerIndex) => (
                <div key={containerIndex} className="mb-4">
                  <h6 className="text-muted mb-3">Container: {container.name}</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Value</th>
                          <th>Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {container.env?.map((envVar, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{envVar.name}</td>
                            <td>
                              {envVar.value || (
                                <span className="text-muted">
                                  {envVar.valueFrom?.fieldRef && `Field: ${envVar.valueFrom.fieldRef.fieldPath}`}
                                  {envVar.valueFrom?.configMapKeyRef && `ConfigMap: ${envVar.valueFrom.configMapKeyRef.name}.${envVar.valueFrom.configMapKeyRef.key}`}
                                  {envVar.valueFrom?.secretKeyRef && `Secret: ${envVar.valueFrom.secretKeyRef.name}.${envVar.valueFrom.secretKeyRef.key}`}
                                </span>
                              )}
                            </td>
                            <td>
                              {envVar.value ? 'literal' : 
                               envVar.valueFrom?.fieldRef ? 'field' :
                               envVar.valueFrom?.configMapKeyRef ? 'ConfigMap' :
                               envVar.valueFrom?.secretKeyRef ? 'Secret' : 'unknown'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KubernetesPodDetail;