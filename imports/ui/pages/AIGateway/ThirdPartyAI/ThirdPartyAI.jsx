// /imports/ui/pages/AIGateway/ThirdPartyAI/ThirdPartyAI.jsx
import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './ThirdPartyAI.scss';
import { LLMsCollection } from '/imports/api/llms/LLMsCollection';

export const ThirdPartyAI = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    apiEndpoint: '',
    apiVersion: '',
    apiKey: '',
    modelName: '',
    maxTokens: 2048,
    organization: '',
    additionalHeaders: ''
  });
  const [testStatus, setTestStatus] = useState(null);
  const [testInProgress, setTestInProgress] = useState(false);

  const { user, loading, thirdPartyModels, error } = useTracker(() => {
    console.log("ThirdPartyAI tracker running");
    try {
      const modelsHandle = Meteor.subscribe('deployedLLMs', 'third-party');

      console.log("Third-party models subscription status:", modelsHandle.ready());

      return {
        user: Meteor.user(),
        thirdPartyModels: LLMsCollection.find({ type: 'third-party' }).fetch(),
        loading: !modelsHandle.ready(),
        error: null
      };
    } catch (error) {
      console.error("Error in ThirdPartyAI tracker:", error);
      return {
        user: Meteor.user(),
        thirdPartyModels: [],
        loading: false,
        error: error.message
      };
    }
  }, []);

  // Initialize feather icons when component mounts
  useEffect(() => {
    feather.replace();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddThirdPartyLLM = (e) => {
    e.preventDefault();

    Meteor.call(
      'addThirdPartyLLM',
      {
        ...formData,
        type: 'third-party'
      },
      (error, result) => {
        if (error) {
          console.error('Error adding third-party LLM:', error);
          // Display error notification to user
        } else {
          console.log('Third-party LLM added:', result);
          setShowAddModal(false);
          setFormData({
            name: '',
            provider: '',
            apiEndpoint: '',
            apiVersion: '',
            apiKey: '',
            modelName: '',
            maxTokens: 2048,
            organization: '',
            additionalHeaders: ''
          });
          // Display success notification to user
        }
      }
    );
  };

  const handleTestConnection = () => {
    setTestInProgress(true);
    setTestStatus(null);

    Meteor.call(
      'testLLMConnection',
      {
        ...formData,
        type: 'third-party'
      },
      (error, result) => {
        setTestInProgress(false);

        if (error) {
          console.error('Connection test failed:', error);
          setTestStatus({
            success: false,
            message: error.reason || 'Connection failed'
          });
        } else {
          console.log('Connection test successful:', result);
          setTestStatus({
            success: true,
            message: 'Connection successful!',
            details: result
          });
        }
      }
    );
  };

  const handleDeleteModel = (modelId) => {
    if (confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      Meteor.call('deleteLLM', modelId, (error) => {
        if (error) {
          console.error('Error deleting model:', error);
          // Display error notification
        } else {
          // Display success notification
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3">Loading third-party models...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        <h4 className="alert-heading">Error Loading Data</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please check the server console for more details.</p>
      </div>
    );
  }

  return (
    <div className="third-party-ai">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Third Party AI</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <i data-feather="arrow-left" className="me-2"></i> Back to Gateway
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i data-feather="plus" className="me-2"></i> Add Third Party Model
          </button>
        </div>
      </div>

      {/* Connected Third-Party Models */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Connected Third-Party Models</h6>

              {thirdPartyModels.length === 0 ? (
                <div className="text-center py-4">
                  <i data-feather="globe" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                  <p className="mt-3">No third-party models connected yet</p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Third Party Model
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Provider</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Last Used</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thirdPartyModels.map((model) => (
                        <tr key={model._id}>
                          <td>{model.name}</td>
                          <td>{model.provider}</td>
                          <td>{model.modelName}</td>
                          <td>
                            <span className={`badge ${model.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {model.status === 'active' ? 'Connected' : 'Error'}
                            </span>
                          </td>
                          <td>{model.lastUsed ? new Date(model.lastUsed).toLocaleString() : 'Never'}</td>
                          <td>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-outline-primary me-1" title="Edit Configuration">
                                <i data-feather="edit-2" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary me-1" title="Test Connection">
                                <i data-feather="zap" style={{ width: '16px', height: '16px' }}></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDeleteModel(model._id)}
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

      {/* Predefined Templates */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-4">Quick Connect Templates</h6>

              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="card h-100 template-card">
                    <div className="card-body text-center">
                      <img src="/images/openai-logo.svg" alt="OpenAI" className="mb-3" style={{ height: '60px' }} />
                      <h6 className="card-title">OpenAI</h6>
                      <p className="card-text">Connect to OpenAI's GPT models including GPT-4 and GPT-3.5 Turbo</p>
                    </div>
                    <div className="card-footer bg-transparent">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            provider: 'OpenAI',
                            apiEndpoint: 'https://api.openai.com/v1',
                            apiVersion: 'v1'
                          });
                          setShowAddModal(true);
                        }}
                      >
                        Configure OpenAI
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 mb-4">
                  <div className="card h-100 template-card">
                    <div className="card-body text-center">
                      <img src="/images/anthropic-logo.svg" alt="Anthropic" className="mb-3" style={{ height: '60px' }} />
                      <h6 className="card-title">Anthropic</h6>
                      <p className="card-text">Connect to Anthropic's Claude models including Claude 3 Opus and Sonnet</p>
                    </div>
                    <div className="card-footer bg-transparent">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            provider: 'Anthropic',
                            apiEndpoint: 'https://api.anthropic.com',
                            apiVersion: 'v1'
                          });
                          setShowAddModal(true);
                        }}
                      >
                        Configure Anthropic
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 mb-4">
                  <div className="card h-100 template-card">
                    <div className="card-body text-center">
                      <img src="/images/mistral-logo.svg" alt="Mistral AI" className="mb-3" style={{ height: '60px' }} />
                      <h6 className="card-title">Mistral AI</h6>
                      <p className="card-text">Connect to Mistral AI's models including Mistral Large and Small</p>
                    </div>
                    <div className="card-footer bg-transparent">
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            provider: 'Mistral AI',
                            apiEndpoint: 'https://api.mistral.ai/v1',
                            apiVersion: 'v1'
                          });
                          setShowAddModal(true);
                        }}
                      >
                        Configure Mistral AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Third-Party Model Modal */}
      {showAddModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Third-Party Model</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddThirdPartyLLM}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Display Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      placeholder="e.g., OpenAI GPT-4"
                      value={formData.name}
                      onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      required
                    />
                    <div className="form-text">Your API key is encrypted and stored securely</div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Model Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        name="modelName"
                        placeholder="e.g., gpt-4-turbo"
                        value={formData.modelName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Max Tokens</label>
                      <input
                        type="number"
                        className="form-control"
                        name="maxTokens"
                        min="1"
                        placeholder="e.g., 2048"
                        value={formData.maxTokens}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Additional Headers (JSON)</label>
                    <textarea
                      className="form-control"
                      name="additionalHeaders"
                      rows="3"
                      placeholder='{"x-custom-header": "value"}'
                      value={formData.additionalHeaders}
                      onChange={handleInputChange}
                    ></textarea>
                    <div className="form-text">Additional HTTP headers required by the API in JSON format</div>
                  </div>

                  {testStatus && (
                    <div className={`alert ${testStatus.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                      <div className="d-flex align-items-center">
                        <i data-feather={testStatus.success ? 'check-circle' : 'alert-circle'} className="me-2"></i>
                        <div>
                          <strong>{testStatus.message}</strong>
                          {testStatus.details && (
                            <pre className="mt-2 p-2 bg-light" style={{ fontSize: '0.8rem' }}>
                              {JSON.stringify(testStatus.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleTestConnection}
                    disabled={testInProgress}
                  >
                    {testInProgress ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                  <button type="submit" className="btn btn-primary">Add Model</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThirdPartyAI;
