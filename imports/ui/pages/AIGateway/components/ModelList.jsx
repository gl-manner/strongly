// /imports/ui/pages/AIGateway/components/ModelList.jsx
import React from 'react';
import feather from 'feather-icons';
import { Link } from 'react-router-dom';

const ModelList = ({ models, onModelAction, emptyStateType }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [models]);

  if (models.length === 0) {
    let message = 'No models available';
    let addLink = '/operations/ai-gateway/self-hosted';
    let addText = 'Add Self-Hosted Model';
    let icon = 'server';

    if (emptyStateType === 'self-hosted') {
      message = 'No self-hosted models deployed yet';
      addLink = '/operations/ai-gateway/self-hosted';
      addText = 'Add Self-Hosted Model';
      icon = 'server';
    } else if (emptyStateType === 'third-party') {
      message = 'No third-party models connected yet';
      addLink = '/operations/ai-gateway/third-party';
      addText = 'Connect Third-Party Model';
      icon = 'globe';
    }

    return (
      <div className="text-center py-4">
        <div className="mb-3">
          <i data-feather={icon} style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
        </div>
        <p className="mb-3">{message}</p>
        <Link to={addLink} className="btn btn-primary mt-2">
          <i data-feather="plus" className="icon-sm me-2"></i> {addText}
        </Link>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Provider</th>
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
                  <i
                    data-feather={model.type === 'self-hosted' ? 'server' : 'globe'}
                    className="icon-sm me-2 text-primary"
                  ></i>
                  <span>{model.name}</span>
                </div>
              </td>
              <td>
                <span className={`badge ${model.type === 'self-hosted' ? 'bg-info' : 'bg-primary'}`}>
                  {model.type === 'self-hosted' ? 'Self-Hosted' : 'Third-Party'}
                </span>
              </td>
              <td>{model.provider || 'Custom'}</td>
              <td>
                <span className={`badge ${model.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                  {model.status === 'active' ? 'Active' : model.status === 'deploying' ? 'Deploying' : 'Inactive'}
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
                  {model.type === 'self-hosted' && (
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      title="Restart"
                      onClick={() => onModelAction('restart', model)}
                    >
                      <i data-feather="refresh-cw" style={{ width: '16px', height: '16px' }}></i>
                    </button>
                  )}
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
  );
};

export default ModelList;
