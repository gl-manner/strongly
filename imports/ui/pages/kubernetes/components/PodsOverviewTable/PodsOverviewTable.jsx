// /imports/ui/components/kubernetes/PodsOverviewTable/PodsOverviewTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './PodsOverviewTable.scss';

const PodsOverviewTable = ({ 
  title = "Pods Overview",
  showFilters = true,
  showBulkActions = true,
  maxHeight = null,
  className = ""
}) => {
  const [selectedPods, setSelectedPods] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [filters, setFilters] = useState({
    namespace: '',
    node: '',
    status: '',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [density, setDensity] = useState('standard'); // compact, standard, comfortable
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);

  // Mock pods data - replace with real API call
  const mockPods = [
    {
      id: 'web-server-7d8f9',
      name: 'web-server-7d8f9',
      namespace: 'production',
      node: 'node-04',
      status: 'Running',
      readiness: '1/1',
      restarts: 0,
      cpuUsage: '125m',
      cpuUsagePercent: 45,
      memoryUsage: '256Mi',
      memoryUsagePercent: 32,
      age: '2d',
      ipAddress: '10.244.1.45',
      labels: { app: 'web-server', version: 'v1.2.3' }
    },
    {
      id: 'api-gateway-5k2m1',
      name: 'api-gateway-5k2m1',
      namespace: 'production',
      node: 'node-02',
      status: 'Running',
      readiness: '2/2',
      restarts: 1,
      cpuUsage: '89m',
      cpuUsagePercent: 31,
      memoryUsage: '512Mi',
      memoryUsagePercent: 64,
      age: '1d',
      ipAddress: '10.244.2.12',
      labels: { app: 'api-gateway', version: 'v2.1.0' }
    },
    {
      id: 'database-8x9w2',
      name: 'database-8x9w2',
      namespace: 'production',
      node: 'node-01',
      status: 'Running',
      readiness: '1/1',
      restarts: 0,
      cpuUsage: '234m',
      cpuUsagePercent: 78,
      memoryUsage: '1Gi',
      memoryUsagePercent: 85,
      age: '5d',
      ipAddress: '10.244.3.78',
      labels: { app: 'database', type: 'postgres' }
    },
    {
      id: 'worker-q3r4t',
      name: 'worker-q3r4t',
      namespace: 'staging',
      node: 'node-03',
      status: 'Pending',
      readiness: '0/1',
      restarts: 2,
      cpuUsage: '0m',
      cpuUsagePercent: 0,
      memoryUsage: '0Mi',
      memoryUsagePercent: 0,
      age: '10m',
      ipAddress: '-',
      labels: { app: 'worker', queue: 'high-priority' }
    },
    {
      id: 'frontend-7h8k9',
      name: 'frontend-7h8k9',
      namespace: 'development',
      node: 'node-05',
      status: 'Failed',
      readiness: '0/1',
      restarts: 5,
      cpuUsage: '0m',
      cpuUsagePercent: 0,
      memoryUsage: '128Mi',
      memoryUsagePercent: 16,
      age: '30m',
      ipAddress: '10.244.1.90',
      labels: { app: 'frontend', env: 'dev' }
    }
  ];

  // Filter and sort pods
  const filteredPods = mockPods.filter(pod => {
    if (filters.namespace && pod.namespace !== filters.namespace) return false;
    if (filters.node && pod.node !== filters.node) return false;
    if (filters.status && pod.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return pod.name.toLowerCase().includes(searchLower) ||
             pod.namespace.toLowerCase().includes(searchLower) ||
             pod.node.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const sortedPods = [...filteredPods].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPods.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPods = sortedPods.slice(startIndex, startIndex + pageSize);

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [paginatedPods, selectedPods, dropdownOpen]);

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle pod selection
  const handlePodSelect = (podId) => {
    setSelectedPods(prev => {
      if (prev.includes(podId)) {
        return prev.filter(id => id !== podId);
      } else {
        return [...prev, podId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedPods([]);
      setAllSelected(false);
    } else {
      setSelectedPods(paginatedPods.map(pod => pod.id));
      setAllSelected(true);
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Running': return 'badge bg-success';
      case 'Pending': return 'badge bg-warning';
      case 'Failed': return 'badge bg-danger';
      case 'Succeeded': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  };

  // Get CPU/Memory usage bar class
  const getUsageBarClass = (percent) => {
    if (percent > 85) return 'bg-danger';
    if (percent > 70) return 'bg-warning';
    return 'bg-success';
  };

  // Unique values for filters
  const namespaces = [...new Set(mockPods.map(pod => pod.namespace))];
  const nodes = [...new Set(mockPods.map(pod => pod.node))];
  const statuses = [...new Set(mockPods.map(pod => pod.status))];

  return (
    <div className={`pods-overview-table ${className}`}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">{title}</h6>
        <div className="d-flex align-items-center gap-2">
          {/* Density Toggle */}
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => setDropdownOpen(dropdownOpen === 'density' ? null : 'density')}
            >
              <i data-feather="layout" style={{ width: '16px', height: '16px' }}></i>
            </button>
            {dropdownOpen === 'density' && (
              <ul className="dropdown-menu show">
                <li><button className={`dropdown-item ${density === 'compact' ? 'active' : ''}`} onClick={() => setDensity('compact')}>Compact</button></li>
                <li><button className={`dropdown-item ${density === 'standard' ? 'active' : ''}`} onClick={() => setDensity('standard')}>Standard</button></li>
                <li><button className={`dropdown-item ${density === 'comfortable' ? 'active' : ''}`} onClick={() => setDensity('comfortable')}>Comfortable</button></li>
              </ul>
            )}
          </div>

          {/* Refresh */}
          <button className="btn btn-sm btn-outline-secondary">
            <i data-feather="refresh-cw" style={{ width: '16px', height: '16px' }}></i>
          </button>

          {/* Export */}
          <button className="btn btn-sm btn-outline-secondary">
            <i data-feather="download" style={{ width: '16px', height: '16px' }}></i>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-row mb-3">
          <div className="row">
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filters.namespace}
                onChange={(e) => setFilters(prev => ({ ...prev, namespace: e.target.value }))}
              >
                <option value="">All Namespaces</option>
                {namespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filters.node}
                onChange={(e) => setFilters(prev => ({ ...prev, node: e.target.value }))}
              >
                <option value="">All Nodes</option>
                {nodes.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search pods..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedPods.length > 0 && (
        <div className="bulk-actions mb-3">
          <div className="alert alert-info d-flex align-items-center justify-content-between">
            <span>{selectedPods.length} pod(s) selected</span>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary">Delete</button>
              <button className="btn btn-sm btn-outline-secondary">Apply Labels</button>
              <button className="btn btn-sm btn-outline-secondary">Restart</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-responsive" style={{ maxHeight }}>
        <table className={`table table-hover pods-table density-${density}`}>
          <thead className="table-light">
            <tr>
              {showBulkActions && (
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th style={{ width: '20%', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Name
                {sortConfig.key === 'name' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '15%', cursor: 'pointer' }} onClick={() => handleSort('namespace')}>
                Namespace
                {sortConfig.key === 'namespace' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '15%', cursor: 'pointer' }} onClick={() => handleSort('node')}>
                Node
                {sortConfig.key === 'node' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '100px', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                Status
                {sortConfig.key === 'status' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '80px' }}>Readiness</th>
              <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => handleSort('restarts')}>
                Restarts
                {sortConfig.key === 'restarts' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '120px' }}>CPU Usage</th>
              <th style={{ width: '120px' }}>Memory Usage</th>
              <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => handleSort('age')}>
                Age
                {sortConfig.key === 'age' && (
                  <i data-feather={sortConfig.direction === 'asc' ? 'chevron-up' : 'chevron-down'} 
                     style={{ width: '16px', height: '16px' }} className="ms-1"></i>
                )}
              </th>
              <th style={{ width: '130px' }}>IP Address</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPods.map((pod) => (
              <tr key={pod.id} className={selectedPods.includes(pod.id) ? 'table-active' : ''}>
                {showBulkActions && (
                  <td>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedPods.includes(pod.id)}
                      onChange={() => handlePodSelect(pod.id)}
                    />
                  </td>
                )}
                <td>
                  <Link 
                    to={`/kubernetes/pods/${pod.namespace}/${pod.name}`} 
                    className="text-decoration-none fw-medium"
                  >
                    {pod.name}
                  </Link>
                </td>
                <td>
                  <Link 
                    to={`/kubernetes/namespaces/${pod.namespace}`} 
                    className="text-decoration-none"
                  >
                    {pod.namespace}
                  </Link>
                </td>
                <td>
                  <Link 
                    to={`/kubernetes/nodes/${pod.node}`} 
                    className="text-decoration-none"
                  >
                    {pod.node}
                  </Link>
                </td>
                <td>
                  <span className={getStatusBadgeClass(pod.status)}>
                    {pod.status}
                  </span>
                </td>
                <td className="text-center">{pod.readiness}</td>
                <td className="text-center">
                  {pod.restarts > 0 ? (
                    <span className="text-warning fw-medium">{pod.restarts}</span>
                  ) : (
                    <span>{pod.restarts}</span>
                  )}
                </td>
                <td>
                  <div className="resource-usage">
                    <div className="d-flex align-items-center">
                      <small className="me-2">{pod.cpuUsage}</small>
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar ${getUsageBarClass(pod.cpuUsagePercent)}`}
                          style={{ width: `${pod.cpuUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="resource-usage">
                    <div className="d-flex align-items-center">
                      <small className="me-2">{pod.memoryUsage}</small>
                      <div className="progress flex-grow-1" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar ${getUsageBarClass(pod.memoryUsagePercent)}`}
                          style={{ width: `${pod.memoryUsagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>{pod.age}</td>
                <td><small className="text-muted">{pod.ipAddress}</small></td>
                <td>
                  <div className="btn-group" role="group">
                    <Link 
                      to={`/kubernetes/pods/${pod.namespace}/${pod.name}/logs`}
                      className="btn btn-sm btn-outline-primary"
                      title="View Logs"
                    >
                      <i data-feather="file-text" style={{ width: '14px', height: '14px' }}></i>
                    </Link>
                    <Link 
                      to={`/kubernetes/pods/${pod.namespace}/${pod.name}/terminal`}
                      className="btn btn-sm btn-outline-secondary"
                      title="Terminal"
                    >
                      <i data-feather="terminal" style={{ width: '14px', height: '14px' }}></i>
                    </Link>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      title="Delete"
                    >
                      <i data-feather="trash-2" style={{ width: '14px', height: '14px' }}></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center">
          <span className="me-2">Show:</span>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ms-2 text-muted">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedPods.length)} of {sortedPods.length}
          </span>
        </div>

        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
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
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default PodsOverviewTable;