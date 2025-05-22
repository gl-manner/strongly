import React, { useState } from 'react';
import feather from 'feather-icons';

const DeploymentModal = ({ model, config, onConfigChange, onDeploy, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize feather icons
  React.useEffect(() => {
    feather.replace();
  }, []);

  // Helper for validating JSON input in the advanced tab
  const validateJson = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isJsonValid = validateJson(config.customParameters);

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Deploy {model.name}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6 className="mb-3">Model Information</h6>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Name:</strong> {model.name}</p>
                  <p><strong>Organization:</strong> {model.organization}</p>
                  <p><strong>Parameters:</strong> {model.parameters}</p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Repository:</strong> {' '}
                    {model.repoUrl && (
                      <a
                        href={model.repoUrl.startsWith('http') ? model.repoUrl : `https://huggingface.co/${model.repoUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Hugging Face
                      </a>
                    )}
                  </p>
                  <p><strong>License:</strong> {model.license}</p>
                  <p><strong>Tags:</strong> {(model.tags || []).join(', ')}</p>
                </div>
              </div>
            </div>

            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                  href="#"
                  onClick={() => setActiveTab('basic')}
                >
                  <i data-feather="settings" className="icon-sm me-2"></i> Basic Configuration
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'advanced' ? 'active' : ''}`}
                  href="#"
                  onClick={() => setActiveTab('advanced')}
                >
                  <i data-feather="code" className="icon-sm me-2"></i> Advanced Settings
                </a>
              </li>
            </ul>

            {activeTab === 'basic' ? (
              <>
                <div className="mb-3">
                  <label className="form-label">Hardware Tier</label>
                  <select
                    className="form-select"
                    name="hardwareTier"
                    value={config.hardwareTier}
                    onChange={onConfigChange}
                  >
                    <option value="basic">Basic (2 vCPU, 8GB RAM)</option>
                    <option value="standard">Standard (4 vCPU, 16GB RAM)</option>
                    <option value="performance">Performance (8 vCPU, 32GB RAM)</option>
                    <option value="gpu-small">GPU Small (4 vCPU, 16GB RAM, 1 GPU)</option>
                    <option value="gpu-large">GPU Large (8 vCPU, 32GB RAM, 1 GPU)</option>
                  </select>
                  <div className="form-text">Select appropriate hardware based on model size and performance needs</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Replicas</label>
                  <input
                    type="number"
                    className="form-control"
                    name="replicas"
                    min="1"
                    max="10"
                    value={config.replicas}
                    onChange={onConfigChange}
                  />
                  <div className="form-text">Number of instances to deploy (affects scalability and cost)</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Max Tokens</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxTokens"
                    min="512"
                    max="16384"
                    value={config.maxTokens}
                    onChange={onConfigChange}
                  />
                  <div className="form-text">Maximum context length for model inputs and outputs</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Access Control</label>
                  <select
                    className="form-select"
                    name="allowedUsers"
                    value={config.allowedUsers}
                    onChange={onConfigChange}
                  >
                    <option value="all">All Users</option>
                    <option value="team">Team Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="mb-3">
                <label className="form-label">Advanced Configuration (JSON)</label>
                <textarea
                  className={`form-control ${!isJsonValid ? 'is-invalid' : ''}`}
                  name="customParameters"
                  rows="10"
                  value={config.customParameters}
                  onChange={onConfigChange}
                  placeholder='{"temperature": 0.7, "top_p": 0.9, "custom_option": "value"}'
                ></textarea>
                {!isJsonValid && (
                  <div className="invalid-feedback">
                    Invalid JSON format
                  </div>
                )}
                <div className="form-text">
                  Additional configuration parameters in JSON format for vLLM or model-specific settings
                </div>
              </div>
            )}

            <div className="alert alert-info mt-3">
              <div className="d-flex">
                <i data-feather="info" className="icon-sm me-2 flex-shrink-0"></i>
                <div>
                  <strong>Deployment Info:</strong> Deploying this model will create a new instance in your Kubernetes cluster.
                  Initial deployment may take 5-10 minutes depending on the model size and hardware availability.
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onDeploy}
              disabled={activeTab === 'advanced' && !isJsonValid}
            >
              <i data-feather="server" className="icon-sm me-2"></i> Deploy Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentModal;
