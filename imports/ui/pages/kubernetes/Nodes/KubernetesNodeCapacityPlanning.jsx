import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './KubernetesNodeCapacityPlanning.scss';

/**
 * Node Capacity Planning component following requirements section 5.3
 * Tools for analyzing and planning node capacity
 */
export const KubernetesNodeCapacityPlanning = () => {
  const [simulationSettings, setSimulationSettings] = useState({
    podsToAdd: 0,
    podsToRemove: 0,
    nodesToAdd: 0,
    nodesToRemove: 0,
    nodeType: 't3.large',
    resourceMultiplier: 1.0
  });

  const [recommendations, setRecommendations] = useState([]);

  // Mock data for current capacity
  const currentCapacity = {
    nodes: 5,
    totalCpu: 20,
    usedCpu: 11.95,
    totalMemory: 80,
    usedMemory: 46.4,
    totalPods: 550,
    usedPods: 176,
    nodeTypes: [
      { type: 't3.large', count: 4, cpu: 4, memory: 16, pods: 110 },
      { type: 't3.xlarge', count: 1, cpu: 8, memory: 32, pods: 220 }
    ],
    utilizationHistory: [
      { time: '00:00', cpu: 45, memory: 52, pods: 28 },
      { time: '04:00', cpu: 38, memory: 48, pods: 25 },
      { time: '08:00', cpu: 72, memory: 68, pods: 42 },
      { time: '12:00', cpu: 85, memory: 75, pods: 48 },
      { time: '16:00', cpu: 78, memory: 70, pods: 45 },
      { time: '20:00', cpu: 60, memory: 58, pods: 32 }
    ],
    workloadDistribution: {
      namespaces: [
        { name: 'default', pods: 45, cpu: 3.2, memory: 12.5 },
        { name: 'kube-system', pods: 28, cpu: 2.8, memory: 8.2 },
        { name: 'production', pods: 62, cpu: 4.5, memory: 18.3 },
        { name: 'monitoring', pods: 18, cpu: 1.2, memory: 5.5 },
        { name: 'ingress', pods: 23, cpu: 0.25, memory: 1.9 }
      ]
    }
  };

  useEffect(() => {
    feather.replace();
    generateRecommendations();
  }, []);

  const generateRecommendations = () => {
    const recs = [];

    // CPU recommendation
    const cpuUtilization = (currentCapacity.usedCpu / currentCapacity.totalCpu) * 100;
    if (cpuUtilization > 80) {
      recs.push({
        type: 'warning',
        category: 'CPU',
        title: 'High CPU Utilization',
        description: `Current CPU utilization is ${cpuUtilization.toFixed(1)}%. Consider adding more nodes or upgrading to larger instances.`,
        action: 'Add 1-2 t3.large nodes'
      });
    } else if (cpuUtilization < 30) {
      recs.push({
        type: 'info',
        category: 'CPU',
        title: 'Low CPU Utilization',
        description: `Current CPU utilization is only ${cpuUtilization.toFixed(1)}%. You might be able to consolidate workloads.`,
        action: 'Consider removing 1-2 nodes'
      });
    }

    // Memory recommendation
    const memoryUtilization = (currentCapacity.usedMemory / currentCapacity.totalMemory) * 100;
    if (memoryUtilization > 80) {
      recs.push({
        type: 'warning',
        category: 'Memory',
        title: 'High Memory Utilization',
        description: `Current memory utilization is ${memoryUtilization.toFixed(1)}%. Memory pressure may affect performance.`,
        action: 'Add memory-optimized nodes or increase limits'
      });
    }

    // Node diversity
    if (currentCapacity.nodeTypes.length === 1) {
      recs.push({
        type: 'info',
        category: 'Reliability',
        title: 'Limited Node Diversity',
        description: 'All nodes are the same type. Consider diversifying for better availability.',
        action: 'Mix node types across availability zones'
      });
    }

    // Cost optimization
    const avgUtilization = (cpuUtilization + memoryUtilization) / 2;
    if (avgUtilization < 40) {
      const potentialSavings = Math.round(currentCapacity.nodes * 0.3 * 150); // Rough estimate
      recs.push({
        type: 'success',
        category: 'Cost',
        title: 'Cost Optimization Opportunity',
        description: `Low resource utilization detected. You could save approximately $${potentialSavings}/month.`,
        action: 'Right-size nodes or use spot instances'
      });
    }

    setRecommendations(recs);
  };

  const calculateSimulatedCapacity = () => {
    const nodeChanges = simulationSettings.nodesToAdd - simulationSettings.nodesToRemove;
    const newNodes = Math.max(1, currentCapacity.nodes + nodeChanges);
    
    // Calculate new capacity based on node type
    const nodeSpecs = {
      't3.small': { cpu: 2, memory: 8, pods: 55 },
      't3.medium': { cpu: 2, memory: 16, pods: 55 },
      't3.large': { cpu: 4, memory: 16, pods: 110 },
      't3.xlarge': { cpu: 8, memory: 32, pods: 220 }
    };

    const addedNodeSpec = nodeSpecs[simulationSettings.nodeType];
    const newCpuCapacity = currentCapacity.totalCpu + (simulationSettings.nodesToAdd * addedNodeSpec.cpu) - (simulationSettings.nodesToRemove * 4); // Assume removing t3.large
    const newMemoryCapacity = currentCapacity.totalMemory + (simulationSettings.nodesToAdd * addedNodeSpec.memory) - (simulationSettings.nodesToRemove * 16);
    const newPodCapacity = currentCapacity.totalPods + (simulationSettings.nodesToAdd * addedNodeSpec.pods) - (simulationSettings.nodesToRemove * 110);

    const podChanges = simulationSettings.podsToAdd - simulationSettings.podsToRemove;
    const newPodCount = Math.max(0, currentCapacity.usedPods + podChanges);
    
    // Estimate resource usage changes
    const avgCpuPerPod = currentCapacity.usedCpu / currentCapacity.usedPods;
    const avgMemoryPerPod = currentCapacity.usedMemory / currentCapacity.usedPods;
    
    const newCpuUsage = currentCapacity.usedCpu + (podChanges * avgCpuPerPod * simulationSettings.resourceMultiplier);
    const newMemoryUsage = currentCapacity.usedMemory + (podChanges * avgMemoryPerPod * simulationSettings.resourceMultiplier);

    return {
      nodes: newNodes,
      cpu: {
        total: newCpuCapacity,
        used: newCpuUsage,
        utilization: (newCpuUsage / newCpuCapacity) * 100
      },
      memory: {
        total: newMemoryCapacity,
        used: newMemoryUsage,
        utilization: (newMemoryUsage / newMemoryCapacity) * 100
      },
      pods: {
        total: newPodCapacity,
        used: newPodCount,
        utilization: (newPodCount / newPodCapacity) * 100
      }
    };
  };

  const simulated = calculateSimulatedCapacity();

  const getUtilizationClass = (percent) => {
    if (percent >= 80) return 'text-danger';
    if (percent >= 60) return 'text-warning';
    return 'text-success';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning': return 'alert-triangle';
      case 'success': return 'check-circle';
      case 'info': return 'info';
      default: return 'help-circle';
    }
  };

  const getRecommendationClass = (type) => {
    switch (type) {
      case 'warning': return 'alert-warning';
      case 'success': return 'alert-success';
      case 'info': return 'alert-info';
      default: return 'alert-secondary';
    }
  };

  return (
    <div className="node-capacity-planning">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link to="/kubernetes/dashboard">Kubernetes</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/kubernetes/nodes">Nodes</Link>
              </li>
              <li className="breadcrumb-item active">Capacity Planning</li>
            </ol>
          </nav>
          <h4 className="mb-1">Node Capacity Planning</h4>
          <p className="text-muted mb-0">Analyze and optimize your cluster capacity</p>
        </div>
        <div className="d-flex align-items-center flex-wrap text-nowrap">
          <button className="btn btn-outline-primary btn-icon-text me-2 mb-2 mb-md-0">
            <i data-feather="download" style={{ width: '16px', height: '16px' }} className="btn-icon-prepend"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Current Capacity Analysis */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Current Capacity Analysis</h5>
              
              {/* Resource Heatmaps */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="resource-heatmap">
                    <h6 className="mb-3">CPU Utilization by Node</h6>
                    <div className="heatmap-grid">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`heatmap-cell ${i === 2 ? 'high' : i === 3 ? 'medium' : 'low'}`}
                          title={`Node-${i + 1}: ${i === 2 ? '85%' : i === 3 ? '65%' : '45%'}`}
                        >
                          <span className="node-label">N{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="heatmap-legend mt-2">
                      <span className="legend-item">
                        <span className="legend-color low"></span> &lt;60%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color medium"></span> 60-80%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color high"></span> &gt;80%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="resource-heatmap">
                    <h6 className="mb-3">Memory Utilization by Node</h6>
                    <div className="heatmap-grid">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`heatmap-cell ${i === 1 ? 'high' : i === 4 ? 'medium' : 'low'}`}
                          title={`Node-${i + 1}: ${i === 1 ? '82%' : i === 4 ? '68%' : '42%'}`}
                        >
                          <span className="node-label">N{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="heatmap-legend mt-2">
                      <span className="legend-item">
                        <span className="legend-color low"></span> &lt;60%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color medium"></span> 60-80%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color high"></span> &gt;80%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="resource-heatmap">
                    <h6 className="mb-3">Pod Density by Node</h6>
                    <div className="heatmap-grid">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`heatmap-cell ${i === 0 ? 'medium' : 'low'}`}
                          title={`Node-${i + 1}: ${i === 0 ? '65%' : '35%'}`}
                        >
                          <span className="node-label">N{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <div className="heatmap-legend mt-2">
                      <span className="legend-item">
                        <span className="legend-color low"></span> &lt;60%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color medium"></span> 60-80%
                      </span>
                      <span className="legend-item">
                        <span className="legend-color high"></span> &gt;80%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time-series Analysis */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="mb-3">24-Hour Utilization Trend</h6>
                  <div className="chart-placeholder" style={{ height: '200px', backgroundColor: '#f8f9fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="text-center text-muted">
                      <i data-feather="trending-up" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                      <p className="mt-2">Utilization trend chart would be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request vs Usage Comparison */}
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-3">Resource Efficiency</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Resource</th>
                          <th className="text-end">Requested</th>
                          <th className="text-end">Used</th>
                          <th className="text-end">Efficiency</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>CPU</td>
                          <td className="text-end">15.2 cores</td>
                          <td className="text-end">11.95 cores</td>
                          <td className="text-end">
                            <span className="text-success">78.6%</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Memory</td>
                          <td className="text-end">58.5 Gi</td>
                          <td className="text-end">46.4 Gi</td>
                          <td className="text-end">
                            <span className="text-success">79.3%</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="mb-3">Workload Distribution</h6>
                  <div className="workload-bars">
                    {currentCapacity.workloadDistribution.namespaces.map((ns, index) => (
                      <div key={index} className="workload-item mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span>{ns.name}</span>
                          <span className="text-muted">{ns.pods} pods</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${(ns.pods / currentCapacity.usedPods) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-if Scenario Modeling */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">What-if Scenario Modeling</h5>
              
              <div className="row">
                <div className="col-md-6">
                  <h6 className="mb-3">Simulation Controls</h6>
                  
                  <div className="simulation-controls">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Pods to Add</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={simulationSettings.podsToAdd}
                          onChange={(e) => setSimulationSettings({...simulationSettings, podsToAdd: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Pods to Remove</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={simulationSettings.podsToRemove}
                          onChange={(e) => setSimulationSettings({...simulationSettings, podsToRemove: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Nodes to Add</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={simulationSettings.nodesToAdd}
                          onChange={(e) => setSimulationSettings({...simulationSettings, nodesToAdd: parseInt(e.target.value) || 0})}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Nodes to Remove</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={simulationSettings.nodesToRemove}
                          onChange={(e) => setSimulationSettings({...simulationSettings, nodesToRemove: parseInt(e.target.value) || 0})}
                          min="0"
                          max={currentCapacity.nodes - 1}
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Node Type (for additions)</label>
                        <select 
                          className="form-select"
                          value={simulationSettings.nodeType}
                          onChange={(e) => setSimulationSettings({...simulationSettings, nodeType: e.target.value})}
                        >
                          <option value="t3.small">t3.small (2 CPU, 8 Gi)</option>
                          <option value="t3.medium">t3.medium (2 CPU, 16 Gi)</option>
                          <option value="t3.large">t3.large (4 CPU, 16 Gi)</option>
                          <option value="t3.xlarge">t3.xlarge (8 CPU, 32 Gi)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Resource Multiplier</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={simulationSettings.resourceMultiplier}
                          onChange={(e) => setSimulationSettings({...simulationSettings, resourceMultiplier: parseFloat(e.target.value) || 1})}
                          min="0.1"
                          max="3"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <button className="btn btn-primary w-100">
                      <i data-feather="play" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                      Run Simulation
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="mb-3">Impact Analysis</h6>
                  
                  <div className="impact-analysis">
                    <div className="impact-metric mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Total Nodes</span>
                        <span>
                          {currentCapacity.nodes} → <strong>{simulated.nodes}</strong>
                          <span className={`ms-2 ${simulated.nodes > currentCapacity.nodes ? 'text-success' : simulated.nodes < currentCapacity.nodes ? 'text-danger' : 'text-muted'}`}>
                            ({simulated.nodes > currentCapacity.nodes ? '+' : ''}{simulated.nodes - currentCapacity.nodes})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="impact-metric mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>CPU Utilization</span>
                        <span className={getUtilizationClass(simulated.cpu.utilization)}>
                          {simulated.cpu.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${simulated.cpu.utilization > 80 ? 'bg-danger' : simulated.cpu.utilization > 60 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${simulated.cpu.utilization}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {simulated.cpu.used.toFixed(1)} / {simulated.cpu.total} cores
                      </small>
                    </div>

                    <div className="impact-metric mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Memory Utilization</span>
                        <span className={getUtilizationClass(simulated.memory.utilization)}>
                          {simulated.memory.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${simulated.memory.utilization > 80 ? 'bg-danger' : simulated.memory.utilization > 60 ? 'bg-warning' : 'bg-info'}`}
                          style={{ width: `${simulated.memory.utilization}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {simulated.memory.used.toFixed(1)} / {simulated.memory.total} Gi
                      </small>
                    </div>

                    <div className="impact-metric mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>Pod Capacity</span>
                        <span className={getUtilizationClass(simulated.pods.utilization)}>
                          {simulated.pods.utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${simulated.pods.utilization > 80 ? 'bg-danger' : simulated.pods.utilization > 60 ? 'bg-warning' : 'bg-primary'}`}
                          style={{ width: `${simulated.pods.utilization}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {simulated.pods.used} / {simulated.pods.total} pods
                      </small>
                    </div>

                    {/* Warnings */}
                    {simulated.cpu.utilization > 90 && (
                      <div className="alert alert-danger">
                        <i data-feather="alert-triangle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                        CPU utilization would exceed 90%!
                      </div>
                    )}
                    {simulated.memory.utilization > 90 && (
                      <div className="alert alert-danger">
                        <i data-feather="alert-triangle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                        Memory utilization would exceed 90%!
                      </div>
                    )}
                    {simulated.nodes < 3 && (
                      <div className="alert alert-warning">
                        <i data-feather="alert-triangle" style={{ width: '16px', height: '16px' }} className="me-2"></i>
                        Less than 3 nodes may impact high availability
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="row">
        <div className="col-12 grid-margin">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Recommendations</h5>
              
              <div className="recommendations-list">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`alert ${getRecommendationClass(rec.type)} d-flex align-items-start`}>
                    <i 
                      data-feather={getRecommendationIcon(rec.type)} 
                      style={{ width: '20px', height: '20px', flexShrink: 0 }} 
                      className="me-3 mt-1"
                    ></i>
                    <div className="flex-grow-1">
                      <h6 className="alert-heading mb-1">{rec.title}</h6>
                      <p className="mb-2">{rec.description}</p>
                      <small className="d-block">
                        <strong>Recommended Action:</strong> {rec.action}
                      </small>
                    </div>
                    <span className="badge bg-light text-dark ms-3">{rec.category}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h6 className="mb-3">Implementation Plan</h6>
                <ol className="implementation-steps">
                  <li className="mb-2">
                    <strong>Immediate Actions:</strong> Address any critical resource constraints by adding nodes or optimizing workloads
                  </li>
                  <li className="mb-2">
                    <strong>Short-term (1-2 weeks):</strong> Implement node right-sizing and workload distribution improvements
                  </li>
                  <li className="mb-2">
                    <strong>Medium-term (1-3 months):</strong> Set up autoscaling policies and implement cost optimization strategies
                  </li>
                  <li className="mb-2">
                    <strong>Long-term (3-6 months):</strong> Establish capacity planning processes and regular review cycles
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KubernetesNodeCapacityPlanning;