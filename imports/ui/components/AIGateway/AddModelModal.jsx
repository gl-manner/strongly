import React, { useState, useEffect } from 'react';
import feather from 'feather-icons';

const AddModelModal = ({
  formData,
  onInputChange,
  onSubmit,
  onClose,
  onTestConnection,
  testStatus,
  testInProgress,
  discoveredModels,
  discoveringModels,
  onDiscoveredModelSelect,
  provider
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [jsonValid, setJsonValid] = useState(true);

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [testStatus, activeTab, discoveredModels]);

  // Validate JSON input
  useEffect(() => {
    if (formData.additionalHeaders) {
      try {
        JSON.parse(formData.additionalHeaders);
        setJsonValid(true);
      } catch (e) {
        setJsonValid(false);
      }
    } else {
      setJsonValid(true);
    }
  }, [formData.additionalHeaders]);

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {provider ? (
                <div className="d-flex align-items-center">
                  {provider.logoUrl && (
                    <img src={provider.logoUrl} alt={provider.name} style={{ height: '24px', marginRight: '10px' }} />
                  )}
                  Configure {provider.name}
                </div>
              ) : (
                'Add Third-Party Model'
              )}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    href="#"
                    onClick={() => setActiveTab('basic')}
                  >
                    <i data-feather="settings" className="icon-sm me-2"></i> Basic Settings
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'advanced' ? 'active' : ''}`}
                    href="#"
                    onClick={() => setActiveTab('advanced')}
                  >
                    <i data-feather="sliders" className="icon-sm me-2"></i> Advanced Options
                  </a>
                </li>
                {discoveredModels.length > 0 && (
                  <li className="nav-item">
                    <a
                      className={`nav-link ${activeTab === 'models' ? 'active' : ''}`}
                      href="#"
                      onClick={() => setActiveTab('models')}
                    >
                      <i data-feather="list" className="icon-sm me-2"></i> Available Models
                      <span className="badge bg-primary ms-2">{discoveredModels.length}</span>
                    </a>
                  </li>
                )}
              </ul>

              {activeTab === 'basic' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Display Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g., OpenAI GPT-4"
                      value={formData.name}
                      onChange={onInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Provider <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="provider"
                        placeholder="e.g., OpenAI"
                        value={formData.provider}
                        onChange={onInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Organization ID</label>
                      <input
                        type="text"
                        className="form-control"
                        name="organization"
                        placeholder="Organization ID (if required)"
                        value={formData.organization}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">API Endpoint <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="apiEndpoint"
                        placeholder="e.g., https://api.openai.com/v1"
                        value={formData.apiEndpoint}
                        onChange={onInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">API Version</label>
                      <input
                        type="text"
                        className="form-control"
                        name="apiVersion"
                        placeholder="e.g., v1"
                        value={formData.apiVersion}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">API Key <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      className="form-control"
                      name="apiKey"
                      placeholder="Enter API key"
                      value={formData.apiKey}
                      onChange={onInputChange}
                      required
                    />
                    <div className="form-text">
                      Your API key is encrypted and stored securely. Never share your API keys.
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Model Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="modelName"
                        placeholder="e.g., gpt-4-turbo"
                        value={formData.modelName}
                        onChange={onInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Max Tokens</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxTokens"
                        min="1"
                        placeholder="e.g., 2048"
                        value={formData.maxTokens}
                        onChange={onInputChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'advanced' && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Additional Headers (JSON)</label>
                    <textarea
                      className={`form-control ${!jsonValid && formData.additionalHeaders ? 'is-invalid' : ''}`}
                      name="additionalHeaders"
                      rows="8"
                      placeholder='{"x-custom-header": "value"}'
                      value={formData.additionalHeaders}
                      onChange={onInputChange}
                    ></textarea>
                    {!jsonValid && formData.additionalHeaders && (
                      <div className="invalid-feedback">
                        Invalid JSON format
                      </div>
                    )}
                    <div className="form-text">Additional HTTP headers required by the API in JSON format</div>
                  </div>

                  <div className="alert alert-info">
                    <div className="d-flex">
                      <i data-feather="info" className="icon-sm me-2 flex-shrink-0"></i>
                      <div>
                        <p className="mb-1">
                          <strong>Advanced Settings Tips:</strong>
                        </p>
                        <ul className="mb-0 ps-3">
                          <li>For Azure OpenAI, add <code>{"x-ms-azure-api-key": "your-key"}</code> to headers</li>
                          <li>For custom endpoints, ensure the URL includes the full path to the API</li>
                          <li>Use the Test Connection button to verify your configuration</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'models' && (
                <div className="available-models">
                  <p className="mb-3">
                    The following models were discovered from {formData.provider}.
                    Click on a model to select it.
                  </p>

                  {discoveringModels ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading models...</span>
                      </div>
                      <p>Discovering available models...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Model ID</th>
                            <th>Type</th>
                            <th>Capabilities</th>
                            <th>Context Window</th>
                          </tr>
                        </thead>
                        <tbody>
                          {discoveredModels.map((model, index) => (
                            <tr
                              key={index}
                              className={`cursor-pointer ${formData.modelName === model.id ? 'table-primary' : ''}`}
                              onClick={() => onDiscoveredModelSelect(model)}
                            >
                              <td>{model.id}</td>
                              <td>{model.type || 'Unknown'}</td>
                              <td>
                                {(model.capabilities || []).map((cap, i) => (
                                  <span key={i} className="badge bg-info me-1">{cap}</span>
                                ))}
                              </td>
                              <td>{model.context_window || 'Unknown'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {testStatus && (
                <div className={`alert ${testStatus.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                  <div className="d-flex align-items-center">
                    <i data-feather={testStatus.success ? 'check-circle' : 'alert-circle'} className="icon-sm me-2"></i>
                    <div>
                      <strong>{testStatus.message}</strong>
                      {testStatus.details && (
                        <pre className="mt-2 p-2 bg-light rounded" style={{ fontSize: '0.8rem', maxHeight: '200px', overflow: 'auto' }}>
                          {JSON.stringify(testStatus.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={onTestConnection}
                disabled={testInProgress || !formData.apiKey || !formData.provider || !formData.apiEndpoint || !jsonValid}
              >
                {testInProgress ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Testing...
                  </>
                ) : (
                  <>
                    <i data-feather="zap" className="icon-sm me-2"></i> Test Connection
                  </>
                )}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!formData.apiKey || !formData.provider || !formData.apiEndpoint || !jsonValid || !formData.modelName}
              >
                <i data-feather="plus" className="icon-sm me-2"></i> Add Model
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddModelModal;
