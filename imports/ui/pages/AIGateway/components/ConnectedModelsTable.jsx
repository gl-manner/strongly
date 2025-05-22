import React from 'react';
import feather from 'feather-icons';
import { Link } from 'react-router-dom';

const ConnectedModelsTable = ({ models, onModelAction }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [models]);

  const getProviderLogo = (provider) => {
    const lowerProvider = provider.toLowerCase();
    if (lowerProvider.includes('openai')) return '/assets/images/openai-logo.svg';
    if (lowerProvider.includes('anthropic')) return '/assets/images/anthropic-logo.svg';
    if (lowerProvider.includes('mistral')) return '/assets/images/mistral-logo.svg';
    if (lowerProvider.includes('google')) return '/assets/images/google-logo.svg';
    if (lowerProvider.includes('cohere')) return '/assets/images/cohere-logo.svg';
    if (lowerProvider.includes('custom')) return '/assets/images/api-logo.svg';
    return null;
  };

  return (
    <div className="row mb-4">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="card-title">Connected Third-Party Models</h6>
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                  type="button"
                  id="connectedModelsActions"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i data-feather="settings" className="icon-sm"></i>
                </button>
                <ul className="dropdown-menu" aria-labelledby="connectedModelsActions">
                  <li>
                    <a className="dropdown-item" href="#" onClick={() => window.location.reload()}>
                      <i data-feather="refresh-cw" className="icon-sm me-2"></i> Refresh Status
                    </a>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/operations/ai-gateway/api-keys">
                      <i data-feather="key" className="icon-sm me-2"></i> Manage API Keys
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {models.length === 0 ? (
              <div className="text-center py-4">
                <div className="mb-3">
                  <i data-feather="globe" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                </div>
                <p className="mb-3">No third-party models connected yet</p>
                <p className="text-muted mb-3">Connect to external AI providers like OpenAI, Anthropic, or Mistral using the templates below</p>
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => onModelAction('add')}
                >
                  <i data-feather="plus" className="icon-sm me-2"></i> Add Third Party Model
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Name</th>
                      <th>Model</th>
                      <th>Status</th>
                      <th>Last Used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {getProviderLogo(model.provider) ? (
                              <img
                                src={getProviderLogo(model.provider)}
                                alt={model.provider}
                                style={{ height: '24px', width: '24px', marginRight: '10px' }}
                              />
                            ) : (
                              <i data-feather="globe" className="icon-sm me-2"></i>
                            )}
                            {model.provider}
                          </div>
                        </td>
                        <td>{model.name}</td>
                        <td>{model.modelName}</td>
                        <td>
                          <span className={`badge ${model.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {model.status === 'active' ? 'Connected' : 'Error'}
                          </span>
                        </td>
                        <td>{model.lastUsed ? new Date(model.lastUsed).toLocaleString() : 'Never'}</td>
                        <td>
                          <div className="d-flex">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              title="Edit Configuration"
                              onClick={() => onModelAction('edit', model)}
                            >
                              <i data-feather="edit-2" style={{ width: '16px', height: '16px' }}></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary me-1"
                              title="Test Connection"
                              onClick={() => onModelAction('test', model)}
                            >
                              <i data-feather="zap" style={{ width: '16px', height: '16px' }}></i>
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

export default ConnectedModelsTable;
