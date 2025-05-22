import React from 'react';
import feather from 'feather-icons';

const ModelCard = ({ model, onDeploy }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [model]);

  return (
    <div className="card h-100 model-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h6 className="card-title mb-0">{model.name}</h6>
          <span className="badge bg-info">{model.parameters}</span>
        </div>
        <p className="text-muted small mb-2">
          <i data-feather="users" className="icon-xs me-1"></i> {model.organization}
        </p>
        <p className="card-text mb-3">{model.description}</p>

        {model.repoUrl && (
          <div className="mb-2">
            <a
              href={model.repoUrl.startsWith('http') ? model.repoUrl : `https://huggingface.co/${model.repoUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-secondary"
            >
              <i data-feather="external-link" className="icon-xs me-1"></i> View Repository
            </a>
          </div>
        )}

        <div className="mb-3">
          {(model.tags || []).map((tag, index) => (
            <span key={index} className="badge bg-light text-dark me-1 mb-1">{tag}</span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
            <span>
              <i data-feather="layers" className="icon-xs me-1"></i> {model.framework || 'PyTorch'}
            </span>
            <span>
              <i data-feather="book" className="icon-xs me-1"></i> {model.license || 'Open Source'}
            </span>
          </div>
        </div>
      </div>
      <div className="card-footer bg-transparent">
        <button
          className="btn btn-primary w-100"
          onClick={onDeploy}
        >
          <i data-feather="server" className="icon-sm me-2"></i> Deploy Model
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
