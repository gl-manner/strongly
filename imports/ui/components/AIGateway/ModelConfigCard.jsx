import React from 'react';
import feather from 'feather-icons';

const ModelConfigCard = ({ config, isValid, isEditing }) => {
  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, [config]);

  // Calculate estimated resources based on model configuration
  const getEstimatedResources = () => {
    let cpuCount = 2;
    let memoryGB = 8;
    let gpuCount = 0;

    switch (config.hardwareTier) {
      case 'basic':
        cpuCount = 2;
        memoryGB = 8;
        break;
      case 'standard':
        cpuCount = 4;
        memoryGB = 16;
        break;
      case 'performance':
        cpuCount = 8;
        memoryGB = 32;
        break;
      case 'gpu-small':
        cpuCount = 4;
        memoryGB = 16;
        gpuCount = 1;
        break;
      case 'gpu-large':
        cpuCount = 8;
        memoryGB = 32;
        gpuCount = 1;
        break;
    }

    // Adjust for replicas
    cpuCount *= config.replicas;
    memoryGB *= config.replicas;
    gpuCount *= config.replicas;

    return { cpuCount, memoryGB, gpuCount };
  };

  const resources = getEstimatedResources();

  // Helper to estimate model size based on URL
  const getEstimatedModelSize = () => {
    const url = config.repoUrl.toLowerCase();

    if (url.includes('7b')) return '7B';
    if (url.includes('8b')) return '8B';
    if (url.includes('13b')) return '13B';
    if (url.includes('70b')) return '70B';
    if (url.includes('opus')) return '18B+';
    if (url.includes('34b')) return '34B';
    if (url.includes('mistral-large')) return '32B';

    return 'Unknown';
  };

  const modelSize = getEstimatedModelSize();

  // Check if hardware is likely sufficient for the model
  const isHardwareSufficient = () => {
    if (modelSize === 'Unknown') return true;

    const sizeNum = parseInt(modelSize);
    if (isNaN(sizeNum)) return true;

    if (sizeNum > 30 && !config.hardwareTier.includes('gpu')) {
      return false;
    }

    if (sizeNum > 13 && config.hardwareTier === 'basic') {
      return false;
    }

    return true;
  };

  const hardwareWarning = !isHardwareSufficient();

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="card-title mb-4">Configuration Summary</h6>

        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="me-auto">
              <h5 className="mb-0">{config.name || 'Custom Model'}</h5>
              <p className="text-muted mb-0">
                {modelSize !== 'Unknown' ? `${modelSize} parameters` : 'Self-hosted LLM'}
              </p>
            </div>
            <span className={`badge ${isValid ? 'bg-success' : 'bg-warning'}`}>
              {isValid ? 'Valid' : 'Incomplete'}
            </span>
          </div>

          <div className="d-flex flex-wrap mb-2">
            {config.tags && config.tags.map((tag, index) => (
              <span key={index} className="badge bg-light text-dark me-1 mb-1">{tag}</span>
            ))}
            {(!config.tags || config.tags.length === 0) && (
              <span className="text-muted fst-italic">No tags</span>
            )}
          </div>
        </div>

        <div className="divider mb-4"></div>

        <div className="mb-4">
          <h6 className="mb-3">Deployment Specs</h6>

          <div className="list-group mb-3">
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <i data-feather="cpu" className="icon-sm me-2 text-primary"></i>
                CPU
              </div>
              <span>{resources.cpuCount} vCPUs</span>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <i data-feather="database" className="icon-sm me-2 text-success"></i>
                Memory
              </div>
              <span>{resources.memoryGB} GB</span>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <i data-feather="hard-drive" className="icon-sm me-2 text-warning"></i>
                GPU
              </div>
              <span>{resources.gpuCount > 0 ? `${resources.gpuCount} GPU${resources.gpuCount > 1 ? 's' : ''}` : 'None'}</span>
            </div>
            <div className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <i data-feather="copy" className="icon-sm me-2 text-info"></i>
                Replicas
              </div>
              <span>{config.replicas}</span>
            </div>
          </div>

          {hardwareWarning && (
            <div className="alert alert-warning">
              <div className="d-flex">
                <i data-feather="alert-triangle" className="icon-sm me-2 flex-shrink-0"></i>
                <div>
                  The selected hardware may be insufficient for a {modelSize} model. Consider upgrading to a GPU tier.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <h6 className="mb-3">Model Settings</h6>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Type:</span>
            <span>{config.modelType === 'CHAT' ? 'Chat (LLM)' : config.modelType === 'EMBEDDING' ? 'Embedding' : 'Completion'}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Quantization:</span>
            <span>{config.quantization}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Max Tokens:</span>
            <span>{config.maxTokens}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Access:</span>
            <span>{config.allowedUsers === 'all' ? 'All Users' : config.allowedUsers === 'team' ? 'Team Only' : 'Admins Only'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigCard;
