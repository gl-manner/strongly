// /imports/ui/pages/kubernetes/Dashboard/KubernetesDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './KubernetesDashboard.scss';

/**
 * Kubernetes Dashboard component
 * This is the main dashboard for Kubernetes management
 */
export const KubernetesDashboard = () => {
    const { user, loading } = useTracker(() => {
        const subscription = Meteor.subscribe('userData');
        return {
            user: Meteor.user(),
            loading: !subscription.ready()
        };
    });

    const [timeRange, setTimeRange] = useState('Last 7 Days');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initialize feather icons when component mounts
    useEffect(() => {
        feather.replace();
    }, [timeRange]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
        // Re-initialize feather icons after state change
        setTimeout(() => feather.replace(), 100);
    };

    const handleTimeRangeChange = (e, range) => {
        e.preventDefault();
        setTimeRange(range);
        setDropdownOpen(false);

        // Re-initialize feather icons
        setTimeout(() => feather.replace(), 100);
    };

    // Mock data for clusters and resources
    const clusterStats = [
        { name: 'Production', nodes: 12, pods: 48, status: 'Healthy', cpu: 78, memory: 64 },
        { name: 'Staging', nodes: 6, pods: 24, status: 'Healthy', cpu: 45, memory: 38 },
        { name: 'Development', nodes: 3, pods: 16, status: 'Warning', cpu: 92, memory: 87 },
        { name: 'QA', nodes: 4, pods: 18, status: 'Healthy', cpu: 56, memory: 42 }
    ];

    const recentEvents = [
        { time: '10:23 AM', cluster: 'Production', type: 'Pod', message: 'Pod web-server-7d8f9 scheduled on node-04', severity: 'info' },
        { time: '09:45 AM', cluster: 'Development', type: 'Deployment', message: 'Deployment api-gateway scaled to 4 replicas', severity: 'info' },
        { time: '09:12 AM', cluster: 'Staging', type: 'Node', message: 'Node node-02 is NotReady', severity: 'warning' },
        { time: '08:30 AM', cluster: 'Production', type: 'Service', message: 'Service database is unavailable', severity: 'error' },
        { time: 'Yesterday', cluster: 'QA', type: 'Job', message: 'Job data-migration completed successfully', severity: 'success' }
    ];

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
        <div className="kubernetes-dashboard">
            <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                <div>
                    <h4 className="mb-3 mb-md-0">Kubernetes Dashboard</h4>
                </div>
                <div className="d-flex align-items-center flex-wrap text-nowrap">
                    <Link to="/kubernetes/clusters" className="btn btn-primary btn-icon-text me-2 mb-2 mb-md-0">
                        <i data-feather="server" className="btn-icon-prepend"></i>
                        Manage Clusters
                    </Link>
                    <button className="btn btn-outline-primary btn-icon-text mb-2 mb-md-0">
                        <i data-feather="download" className="btn-icon-prepend"></i>
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="row">
                <div className="col-12 col-xl-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-baseline mb-4">
                                <h6 className="card-title mb-0">Cluster Overview</h6>
                                <div className="dropdown" ref={dropdownRef}>
                                    <button
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                        type="button"
                                        onClick={toggleDropdown}
                                    >
                                        <span>{timeRange}</span>
                                        <i data-feather="chevron-down" className="ms-1" style={{ width: '16px', height: '16px' }}></i>
                                    </button>
                                    {dropdownOpen && (
                                        <ul className="dropdown-menu show" style={{ position: 'absolute', right: 0 }}>
                                            <li><a className="dropdown-item" href="#" onClick={(e) => handleTimeRangeChange(e, 'Last 24 Hours')}>Last 24 Hours</a></li>
                                            <li><a className="dropdown-item" href="#" onClick={(e) => handleTimeRangeChange(e, 'Last 7 Days')}>Last 7 Days</a></li>
                                            <li><a className="dropdown-item" href="#" onClick={(e) => handleTimeRangeChange(e, 'Last 30 Days')}>Last 30 Days</a></li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="d-flex align-items-center">
                                        <i data-feather="server" className="text-primary icon-lg me-2"></i>
                                        <div>
                                            <h5 className="mb-0">4</h5>
                                            <p className="text-muted mb-0">Clusters</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="d-flex align-items-center">
                                        <i data-feather="hard-drive" className="text-success icon-lg me-2"></i>
                                        <div>
                                            <h5 className="mb-0">25</h5>
                                            <p className="text-muted mb-0">Nodes</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="d-flex align-items-center">
                                        <i data-feather="box" className="text-warning icon-lg me-2"></i>
                                        <div>
                                            <h5 className="mb-0">106</h5>
                                            <p className="text-muted mb-0">Pods</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="d-flex align-items-center">
                                        <i data-feather="alert-circle" className="text-danger icon-lg me-2"></i>
                                        <div>
                                            <h5 className="mb-0">3</h5>
                                            <p className="text-muted mb-0">Alerts</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Links */}
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Quick Access</h6>
                            <div className="row">
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/clusters" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="server"></i>
                                        </div>
                                        <span>Clusters</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/deployments" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="package"></i>
                                        </div>
                                        <span>Deployments</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/pods" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="box"></i>
                                        </div>
                                        <span>Pods</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/services" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="link"></i>
                                        </div>
                                        <span>Services</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/storage" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="database"></i>
                                        </div>
                                        <span>Storage</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/monitoring" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="activity"></i>
                                        </div>
                                        <span>Monitoring</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cluster Stats */}
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Cluster Status</h6>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Cluster Name</th>
                                            <th>Nodes</th>
                                            <th>Pods</th>
                                            <th>Status</th>
                                            <th>CPU Usage</th>
                                            <th>Memory Usage</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clusterStats.map((cluster, index) => (
                                            <tr key={index}>
                                                <td>{cluster.name}</td>
                                                <td>{cluster.nodes}</td>
                                                <td>{cluster.pods}</td>
                                                <td>
                                                    <span className={`badge ${cluster.status === 'Healthy' ? 'bg-success' : 'bg-warning'}`}>
                                                        {cluster.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress progress-md flex-grow-1 me-2">
                                                            <div
                                                                className={`progress-bar ${cluster.cpu > 80 ? 'bg-danger' : cluster.cpu > 60 ? 'bg-warning' : 'bg-success'}`}
                                                                role="progressbar"
                                                                style={{ width: `${cluster.cpu}%` }}
                                                                aria-valuenow={cluster.cpu}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                        <span>{cluster.cpu}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress progress-md flex-grow-1 me-2">
                                                            <div
                                                                className={`progress-bar ${cluster.memory > 80 ? 'bg-danger' : cluster.memory > 60 ? 'bg-warning' : 'bg-success'}`}
                                                                role="progressbar"
                                                                style={{ width: `${cluster.memory}%` }}
                                                                aria-valuenow={cluster.memory}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                        <span>{cluster.memory}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex">
                                                        <button className="btn btn-sm btn-outline-primary me-1" title="View Details">
                                                            <i data-feather="eye" style={{ width: '16px', height: '16px' }}></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-secondary me-1" title="Settings">
                                                            <i data-feather="settings" style={{ width: '16px', height: '16px' }}></i>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Events and Deployments */}
            <div className="row">
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Recent Events</h6>
                            <div className="events-list">
                                {recentEvents.map((event, index) => (
                                    <div key={index} className="event-item">
                                        <div className={`event-icon ${event.severity}`}>
                                            <i data-feather={
                                                event.severity === 'error' ? 'alert-octagon' :
                                                    event.severity === 'warning' ? 'alert-triangle' :
                                                        event.severity === 'success' ? 'check-circle' :
                                                            'info'
                                            }></i>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-header">
                                                <h6 className="event-type mb-0">{event.type}</h6>
                                                <span className="event-time">{event.time}</span>
                                            </div>
                                            <p className="event-message mb-0">{event.message}</p>
                                            <div className="event-meta">
                                                <span className="event-cluster">Cluster: {event.cluster}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-3">
                                <button className="btn btn-outline-primary btn-sm">View All Events</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Resource Utilization</h6>
                            <div className="chart-container">
                                <div className="mb-4 text-center">
                                    <div className="d-flex justify-content-center mb-3">
                                        <select className="form-select form-select-sm" style={{ width: '200px' }}>
                                            <option>All Clusters</option>
                                            <option>Production</option>
                                            <option>Staging</option>
                                            <option>Development</option>
                                            <option>QA</option>
                                        </select>
                                    </div>
                                    <div className="resource-stats">
                                        <div className="resource-stat">
                                            <div className="resource-chart">
                                                <svg viewBox="0 0 36 36" className="circular-chart">
                                                    <path className="circle-bg"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path className="circle cpu"
                                                        strokeDasharray="65, 100"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <text x="18" y="20.35" className="percentage">65%</text>
                                                </svg>
                                            </div>
                                            <div className="resource-name">CPU</div>
                                        </div>
                                        <div className="resource-stat">
                                            <div className="resource-chart">
                                                <svg viewBox="0 0 36 36" className="circular-chart">
                                                    <path className="circle-bg"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path className="circle memory"
                                                        strokeDasharray="58, 100"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <text x="18" y="20.35" className="percentage">58%</text>
                                                </svg>
                                            </div>
                                            <div className="resource-name">Memory</div>
                                        </div>
                                        <div className="resource-stat">
                                            <div className="resource-chart">
                                                <svg viewBox="0 0 36 36" className="circular-chart">
                                                    <path className="circle-bg"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path className="circle storage"
                                                        strokeDasharray="42, 100"
                                                        d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <text x="18" y="20.35" className="percentage">42%</text>
                                                </svg>
                                            </div>
                                            <div className="resource-name">Storage</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="alert alert-info d-flex align-items-center" role="alert">
                                    <i data-feather="info" className="alert-icon me-2"></i>
                                    <div>
                                        Development cluster is nearing CPU capacity. Consider scaling up or optimizing workloads.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Actions (visible only for admins) */}
            {user && user.roles && user.roles.includes('admin') && (
                <div className="row">
                    <div className="col-12 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">Admin Actions</h6>
                                <div className="row">
                                    <div className="col-md-3 col-6 mb-3">
                                        <Link to="/admin/kubernetes/config" className="admin-action-link">
                                            <i data-feather="settings"></i>
                                            <span>Configure Kubernetes</span>
                                        </Link>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <Link to="/admin/kubernetes/resources" className="admin-action-link">
                                            <i data-feather="cpu"></i>
                                            <span>Manage Resources</span>
                                        </Link>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <Link to="/admin/kubernetes/templates" className="admin-action-link">
                                            <i data-feather="file-text"></i>
                                            <span>Manage Templates</span>
                                        </Link>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <Link to="/admin/kubernetes/security" className="admin-action-link">
                                            <i data-feather="shield"></i>
                                            <span>Security Settings</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KubernetesDashboard;