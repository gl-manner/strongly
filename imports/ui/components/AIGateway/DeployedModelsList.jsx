import React from 'react';
import feather from 'feather-icons';
import { Link } from 'react-router-dom';

const DeployedModelsList = ({ models, onModelAction }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [models]);

  return (
    <div className="row mb-4">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="card-title">Your Deployed Models</h6>
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                  type="button"
                  id="deployedModelsActions"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i data-feather="settings" className="icon-sm"></i>
                </button>
                <ul className="dropdown-menu" aria-labelledby="deployedModelsActions">
                  <li>
                    <a className="dropdown-item" href="#" onClick={() => window.location.reload()}>
                      <i data-feather="refresh-cw" className="icon-sm me-2"></i> Refresh Status
                    </a>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/operations/ai-gateway/self-hosted/kubernetes">
                      <i data-feather="activity" className="icon-sm me-2"></i> View Kubernetes Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {models.length === 0 ? (
              <div className="text-center py-4">
                <div className="mb-3">
                  <i data-feather="server" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                </div>
                <p className="mb-3">No self-hosted models deployed yet</p>
                <p className="text-muted mb-4">Deploy your first model from the available models below</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Parameters</th>
                      <th>Hardware</th>
                      <th>Deployed On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className={`status-dot bg-${getStatusColor(model.status)} me-2`}></span>
                            {model.name}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(model.status)}`}>
                            {getStatusLabel(model.status)}
                          </span>
                        </td>
                        <td>{model.parameters}</td>
                        <td>{model.hardwareTier || 'Standard'}</td>
                        <td>{new Date(model.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="d-flex">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              title="Edit Configuration"
                              onClick={() => onModelAction('edit', model)}
                            >
                              <i data-feather="settings" style={{ width: '16px', height: '16px' }}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary me-1"
                              title="Restart"
                              onClick={() => onModelAction('restart', model)}
                              disabled={model.status === 'deploying'}
                            >
                              <i data-feather="refresh-cw" style={{ width: '16px', height: '16px' }}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning me-1"
                              title="Terminate"
                              onClick={() => onModelAction('terminate', model)}
                              disabled={model.status === 'deploying' || model.status === 'inactive'}
                            >
                              <i data-feather="power" style={{ width: '16px', height: '16px' }}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                              onClick={() => onModelAction('delete', model)}
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
  );
};

// Helper functions for status display
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active':
      return 'bg-success';
    case 'deploying':
      return 'bg-warning';
    case 'failed':
      return 'bg-danger';
    case 'deleted':
      return 'bg-secondary';
    default:
      return 'bg-danger';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'deploying':
      return 'Deploying';
    case 'failed':
      return 'Failed';
    case 'deleted':
      return 'Deleted';
    default:
      return 'Inactive';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'deploying':
      return 'warning';
    case 'failed':
      return 'danger';
    case 'deleted':
      return 'secondary';
    default:
      return 'danger';
  }
};

export default DeployedModelsList;
