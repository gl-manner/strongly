// /imports/ui/pages/kubernetes/Dashboard/KubernetesDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import PodsOverviewTable from '/imports/ui/pages/kubernetes/components/PodsOverviewTable/PodsOverviewTable';
import './KubernetesDashboard.scss';

/**
 * Enhanced Kubernetes Dashboard component following requirements sections 1-4
 * This is the main dashboard for Kubernetes management with comprehensive overview
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
    const [selectedCluster, setSelectedCluster] = useState('all');
    const dropdownRef = useRef(null);

    // Initialize feather icons when component mounts
    useEffect(() => {
        feather.replace();
    }, [timeRange, selectedCluster]);

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
        setTimeout(() => feather.replace(), 100);
    };

    const handleTimeRangeChange = (e, range) => {
        e.preventDefault();
        setTimeRange(range);
        setDropdownOpen(false);
        setTimeout(() => feather.replace(), 100);
    };

    // Mock data for clusters and resources (replace with real API calls)
    const clusterStats = [
        { 
            name: 'Production', 
            nodes: 12, 
            pods: 48, 
            status: 'Healthy', 
            cpu: 78, 
            memory: 64,
            health: 'healthy',
            alerts: 1
        },
        { 
            name: 'Staging', 
            nodes: 6, 
            pods: 24, 
            status: 'Healthy', 
            cpu: 45, 
            memory: 38,
            health: 'healthy',
            alerts: 0
        },
        { 
            name: 'Development', 
            nodes: 3, 
            pods: 16, 
            status: 'Warning', 
            cpu: 92, 
            memory: 87,
            health: 'warning',
            alerts: 2
        },
        { 
            name: 'QA', 
            nodes: 4, 
            pods: 18, 
            status: 'Healthy', 
            cpu: 56, 
            memory: 42,
            health: 'healthy',
            alerts: 0
        }
    ];

    const recentEvents = [
        { 
            time: '10:23 AM', 
            cluster: 'Production', 
            type: 'Pod', 
            object: 'web-server-7d8f9',
            message: 'Pod web-server-7d8f9 scheduled on node-04', 
            severity: 'info' 
        },
        { 
            time: '09:45 AM', 
            cluster: 'Development', 
            type: 'Deployment', 
            object: 'api-gateway',
            message: 'Deployment api-gateway scaled to 4 replicas', 
            severity: 'info' 
        },
        { 
            time: '09:12 AM', 
            cluster: 'Staging', 
            type: 'Node', 
            object: 'node-02',
            message: 'Node node-02 is NotReady', 
            severity: 'warning' 
        },
        { 
            time: '08:30 AM', 
            cluster: 'Production', 
            type: 'Service', 
            object: 'database',
            message: 'Service database is unavailable', 
            severity: 'error' 
        },
        { 
            time: 'Yesterday', 
            cluster: 'QA', 
            type: 'Job', 
            object: 'data-migration',
            message: 'Job data-migration completed successfully', 
            severity: 'success' 
        }
    ];

    // Calculate aggregate stats
    const aggregateStats = {
        totalClusters: clusterStats.length,
        totalNodes: clusterStats.reduce((sum, cluster) => sum + cluster.nodes, 0),
        totalPods: clusterStats.reduce((sum, cluster) => sum + cluster.pods, 0),
        totalAlerts: clusterStats.reduce((sum, cluster) => sum + cluster.alerts, 0),
        healthyClusters: clusterStats.filter(c => c.health === 'healthy').length,
        avgCpuUsage: Math.round(clusterStats.reduce((sum, cluster) => sum + cluster.cpu, 0) / clusterStats.length),
        avgMemoryUsage: Math.round(clusterStats.reduce((sum, cluster) => sum + cluster.memory, 0) / clusterStats.length)
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
        <div className="kubernetes-dashboard">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
                <div>
                    <h4 className="mb-3 mb-md-0">Kubernetes Dashboard</h4>
                    <p className="text-muted mb-0">Monitor and manage your Kubernetes infrastructure</p>
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

            {/* Cluster Health Summary */}
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-baseline mb-4">
                                <h6 className="card-title mb-0">Cluster Health Summary</h6>
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

                            {/* Health Status Cards */}
                            <div className="row">
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="health-status-card">
                                        <div className="d-flex align-items-center">
                                            <div className="health-status-icon healthy me-3">
                                                <i data-feather="server" className="text-white"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0">{aggregateStats.totalClusters}</h5>
                                                <p className="text-muted mb-0">Total Clusters</p>
                                                <small className="text-success">{aggregateStats.healthyClusters}/{aggregateStats.totalClusters} Healthy</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="health-status-card">
                                        <div className="d-flex align-items-center">
                                            <div className="health-status-icon info me-3">
                                                <i data-feather="hard-drive" className="text-white"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0">{aggregateStats.totalNodes}</h5>
                                                <p className="text-muted mb-0">Total Nodes</p>
                                                <small className="text-info">Ready: {aggregateStats.totalNodes - 1}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="health-status-card">
                                        <div className="d-flex align-items-center">
                                            <div className="health-status-icon warning me-3">
                                                <i data-feather="box" className="text-white"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0">{aggregateStats.totalPods}</h5>
                                                <p className="text-muted mb-0">Total Pods</p>
                                                <small className="text-warning">Running: {aggregateStats.totalPods - 3}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-4">
                                    <div className="health-status-card">
                                        <div className="d-flex align-items-center">
                                            <div className={`health-status-icon ${aggregateStats.totalAlerts > 0 ? 'danger' : 'success'} me-3`}>
                                                <i data-feather="alert-circle" className="text-white"></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0">{aggregateStats.totalAlerts}</h5>
                                                <p className="text-muted mb-0">Critical Alerts</p>
                                                {aggregateStats.totalAlerts > 0 ? (
                                                    <small className="text-danger">Needs Attention</small>
                                                ) : (
                                                    <small className="text-success">All Clear</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Node Status Grid */}
                            <div className="node-status-grid mt-4">
                                <h6 className="mb-3">Node Status Grid</h6>
                                <div className="row">
                                    {clusterStats.map((cluster, clusterIndex) => (
                                        <div key={cluster.name} className="col-md-3 mb-3">
                                            <div className="cluster-nodes">
                                                <div className="cluster-name mb-2">
                                                    <strong>{cluster.name}</strong>
                                                    <span className={`badge ms-2 ${cluster.health === 'healthy' ? 'bg-success' : cluster.health === 'warning' ? 'bg-warning' : 'bg-danger'}`}>
                                                        {cluster.status}
                                                    </span>
                                                </div>
                                                <div className="nodes-grid">
                                                    {Array.from({ length: cluster.nodes }, (_, nodeIndex) => (
                                                        <div 
                                                            key={nodeIndex}
                                                            className={`node-cell ${cluster.health === 'healthy' ? 'healthy' : cluster.health === 'warning' ? 'warning' : 'error'}`}
                                                            title={`${cluster.name}-node-${nodeIndex + 1}: ${cluster.status}`}
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Utilization */}
            <div className="row">
                <div className="col-md-8 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Resource Utilization</h6>
                            
                            {/* Resource Overview Cards */}
                            <div className="row mb-4">
                                <div className="col-md-4 mb-3">
                                    <div className="resource-overview-card">
                                        <div className="resource-header">
                                            <i data-feather="cpu" className="text-primary"></i>
                                            <span>CPU</span>
                                        </div>
                                        <div className="resource-stats">
                                            <div className="resource-value">{aggregateStats.avgCpuUsage}%</div>
                                            <div className="resource-trend">
                                                <i data-feather="trending-up" className="text-success"></i>
                                                <span>+5% from yesterday</span>
                                            </div>
                                        </div>
                                        <div className="progress">
                                            <div 
                                                className={`progress-bar ${aggregateStats.avgCpuUsage > 80 ? 'bg-danger' : aggregateStats.avgCpuUsage > 60 ? 'bg-warning' : 'bg-success'}`}
                                                style={{ width: `${aggregateStats.avgCpuUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="resource-overview-card">
                                        <div className="resource-header">
                                            <i data-feather="memory" className="text-info"></i>
                                            <span>Memory</span>
                                        </div>
                                        <div className="resource-stats">
                                            <div className="resource-value">{aggregateStats.avgMemoryUsage}%</div>
                                            <div className="resource-trend">
                                                <i data-feather="trending-down" className="text-danger"></i>
                                                <span>-2% from yesterday</span>
                                            </div>
                                        </div>
                                        <div className="progress">
                                            <div 
                                                className={`progress-bar ${aggregateStats.avgMemoryUsage > 80 ? 'bg-danger' : aggregateStats.avgMemoryUsage > 60 ? 'bg-warning' : 'bg-success'}`}
                                                style={{ width: `${aggregateStats.avgMemoryUsage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="resource-overview-card">
                                        <div className="resource-header">
                                            <i data-feather="database" className="text-warning"></i>
                                            <span>Storage</span>
                                        </div>
                                        <div className="resource-stats">
                                            <div className="resource-value">42%</div>
                                            <div className="resource-trend">
                                                <i data-feather="minus" className="text-muted"></i>
                                                <span>No change</span>
                                            </div>
                                        </div>
                                        <div className="progress">
                                            <div className="progress-bar bg-info" style={{ width: '42%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Utilization Time-Series Chart Placeholder */}
                            <div className="chart-container">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">24h Trend</h6>
                                    <div className="btn-group btn-group-sm" role="group">
                                        <input type="radio" className="btn-check" name="chartMetric" id="cpu-metric" autoComplete="off" defaultChecked />
                                        <label className="btn btn-outline-secondary" htmlFor="cpu-metric">CPU</label>
                                        
                                        <input type="radio" className="btn-check" name="chartMetric" id="memory-metric" autoComplete="off" />
                                        <label className="btn btn-outline-secondary" htmlFor="memory-metric">Memory</label>
                                        
                                        <input type="radio" className="btn-check" name="chartMetric" id="network-metric" autoComplete="off" />
                                        <label className="btn btn-outline-secondary" htmlFor="network-metric">Network</label>
                                    </div>
                                </div>
                                
                                {/* Placeholder for chart - replace with actual chart library */}
                                <div className="chart-placeholder">
                                    <div className="text-center py-5">
                                        <i data-feather="trending-up" style={{ width: '48px', height: '48px' }} className="text-muted mb-3"></i>
                                        <p className="text-muted">Resource utilization chart will be displayed here</p>
                                        <small className="text-muted">Integrate with Chart.js or ApexCharts for time-series data</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Events */}
                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="card-title mb-0">Recent Events</h6>
                                <Link to="/kubernetes/events" className="btn btn-sm btn-outline-primary">
                                    View All
                                </Link>
                            </div>
                            
                            <div className="events-timeline">
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
                                                <span className="event-type">{event.type}</span>
                                                <span className="event-time">{event.time}</span>
                                            </div>
                                            <div className="event-object">
                                                <Link to={`/kubernetes/${event.type.toLowerCase()}s/${event.object}`} className="text-decoration-none">
                                                    {event.object}
                                                </Link>
                                            </div>
                                            <p className="event-message">{event.message}</p>
                                            <div className="event-meta">
                                                <span className="event-cluster">Cluster: {event.cluster}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pods Overview Table */}
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <PodsOverviewTable 
                                title="Pods Overview"
                                showFilters={true}
                                showBulkActions={true}
                                maxHeight="400px"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Links */}
            <div className="row">
                <div className="col-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="card-title">Quick Actions</h6>
                            <div className="row">
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/pods/create" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="plus"></i>
                                        </div>
                                        <span>Create Pod</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/deployments/create" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="package"></i>
                                        </div>
                                        <span>Create Deployment</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/services/create" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="link"></i>
                                        </div>
                                        <span>Create Service</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/configmaps/create" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="file-text"></i>
                                        </div>
                                        <span>Create ConfigMap</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/secrets/create" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="key"></i>
                                        </div>
                                        <span>Create Secret</span>
                                    </Link>
                                </div>
                                <div className="col-md-2 col-6 mb-3">
                                    <Link to="/kubernetes/yaml-editor" className="quick-access-item">
                                        <div className="quick-access-icon">
                                            <i data-feather="code"></i>
                                        </div>
                                        <span>YAML Editor</span>
                                    </Link>
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