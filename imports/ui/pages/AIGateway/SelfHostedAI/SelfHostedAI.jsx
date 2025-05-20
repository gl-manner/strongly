// /imports/ui/pages/AIGateway/SelfHostedAI/SelfHostedAI.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import feather from 'feather-icons';
import './SelfHostedAI.scss';
import { OpenSourceLLMsCollection } from '/imports/api/ai-gateway/OpenSourceLLMsCollection';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';

export const SelfHostedAI = () => {
  // State for model search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('local'); // 'local' or 'huggingface'
  const [selectedTags, setSelectedTags] = useState([]);
  const [modelTags, setModelTags] = useState([]);

  // State for Hugging Face models
  const [huggingFaceModels, setHuggingFaceModels] = useState([]);
  const [huggingFaceLoading, setHuggingFaceLoading] = useState(false);
  const [huggingFaceError, setHuggingFaceError] = useState(null);

  // State for deployment modal
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    hardwareTier: 'standard',
    replicas: 1,
    maxTokens: 2048,
    allowedUsers: 'all',
    customParameters: ''
  });

  // Use Tracker to get data from collections
  const { user, loading, openSourceModels, deployedModels, error } = useTracker(() => {
    console.log("SelfHostedAI tracker running");
    try {
      // Handle subscriptions independently to isolate issues
      const openSourceModelsHandle = Meteor.subscribe('openSourceLLMs');
      const deployedModelsHandle = Meteor.subscribe('deployedLLMs', 'self-hosted');

      console.log("Subscription status:", {
        openSourceModels: openSourceModelsHandle.ready(),
        deployedModels: deployedModelsHandle.ready()
      });

      return {
        user: Meteor.user(),
        openSourceModels: OpenSourceLLMsCollection.find({}).fetch(),
        deployedModels: LLMsCollection.find({ type: 'self-hosted' }).fetch(),
        loading: !openSourceModelsHandle.ready() || !deployedModelsHandle.ready(),
        error: null
      };
    } catch (error) {
      console.error("Error in SelfHostedAI tracker:", error);
      return {
        user: Meteor.user(),
        openSourceModels: [],
        deployedModels: [],
        loading: false,
        error: error.message
      };
    }
  }, []);

  // Initialize feather icons and extract tags from models
  useEffect(() => {
    feather.replace();

    // Extract unique tags from models for filtering
    if (openSourceModels && openSourceModels.length > 0) {
      const allTags = openSourceModels.flatMap(model => model.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();
      setModelTags(uniqueTags);
    }
  }, [openSourceModels]);

  // Function to search Hugging Face models
  const searchHuggingFaceModels = () => {
    setHuggingFaceLoading(true);
    setHuggingFaceError(null);

    // Call the Meteor method to search Hugging Face
    Meteor.call('searchHuggingFaceModels', searchQuery, (error, result) => {
      setHuggingFaceLoading(false);

      if (error) {
        console.error('Error searching Hugging Face models:', error);
        setHuggingFaceError(error.message);
      } else {
        setHuggingFaceModels(result || []);
      }
    });
  };

  // Toggle selected tags for filtering
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filter models based on search query and selected tags
  const filteredModels = useMemo(() => {
    let filtered = [...openSourceModels];

    // Apply text search if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(query) ||
        model.organization.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        (model.tags && model.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Apply tag filters if any are selected
    if (selectedTags.length > 0) {
      filtered = filtered.filter(model =>
        model.tags && selectedTags.every(tag => model.tags.includes(tag))
      );
    }

    return filtered;
  }, [openSourceModels, searchQuery, selectedTags]);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setShowDeploymentModal(true);
  };

  const handleDeployModel = () => {
    Meteor.call(
      'deployLLM',
      {
        modelId: selectedModel._id,
        modelName: selectedModel.name,
        modelSource: 'huggingface',
        modelUrl: selectedModel.repoUrl,
        ...deploymentConfig
      },
      (error, result) => {
        if (error) {
          console.error('Error deploying model:', error);
          // Display error notification to user
        } else {
          console.log('Model deployment initiated:', result);
          setShowDeploymentModal(false);
          // Display success notification to user
        }
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeploymentConfig({
      ...deploymentConfig,
      [name]: value
    });
  };

  if (loading) {
    return (
      <div className="loading-container d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3">Loading models data...</div>
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
    <div className="self-hosted-ai">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Self Hosted AI</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <span className="me-2">←</span> Back to Gateway
          </Link>
          <Link to="/operations/ai-gateway/self-hosted/custom" className="btn btn-primary">
            <span className="me-2">+</span> Add Custom Model
          </Link>
        </div>
      </div>

      {/* Deployed Self-Hosted Models */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Your Deployed Models</h6>

              {deployedModels.length === 0 ? (
                <div className="text-center py-4">
                  <span className="server-icon">⚙️</span>
                  <p className="mt-3">No self-hosted models deployed yet</p>
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
                      {deployedModels.map((model) => (
                        <tr key={model._id}>
                          <td>{model.name}</td>
                          <td>
                            <span className={`badge ${model.status === 'active' ? 'bg-success' : model.status === 'deploying' ? 'bg-warning' : 'bg-danger'}`}>
                              {model.status === 'active' ? 'Active' : model.status === 'deploying' ? 'Deploying' : 'Inactive'}
                            </span>
                          </td>
                          <td>{model.parameters}</td>
                          <td>{model.hardwareTier}</td>
                          <td>{new Date(model.createdAt).toLocaleString()}</td>
                          <td>
                            <div className="d-flex">
                              <button className="btn btn-sm btn-outline-primary me-1" title="Edit Configuration">
                                <span>⚙️</span>
                              </button>
                              <button className="btn btn-sm btn-outline-secondary me-1" title="Restart">
                                <span>🔄</span>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" title="Terminate">
                                <span>⏻</span>
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

      {/* Open Source LLMs */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-4">Available Open Source Models</h6>

              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div className="d-flex mb-3 mb-md-0">
                  <ul className="nav nav-tabs">
                    <li className="nav-item">
                      <a
                        className={`nav-link ${searchType === 'local' ? 'active' : ''}`}
                        onClick={() => setSearchType('local')}
                        href="#"
                      >
                        Library Models
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className={`nav-link ${searchType === 'huggingface' ? 'active' : ''}`}
                        onClick={() => setSearchType('huggingface')}
                        href="#"
                      >
                        Hugging Face
                      </a>
                    </li>
                  </ul>
                </div>

                <div className="input-group" style={{ maxWidth: '500px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={searchType === 'local' ? "Search models by name, organization or tags..." : "Search Hugging Face models..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchType === 'huggingface') {
                        searchHuggingFaceModels();
                      }
                    }}
                  />
                  {searchType === 'huggingface' && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={searchHuggingFaceModels}
                      disabled={huggingFaceLoading}
                    >
                      {huggingFaceLoading ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      ) : (
                        <span className="search-icon">Search</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Show tags for filtering when viewing local models */}
              {searchType === 'local' && modelTags.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex flex-wrap">
                    {modelTags.map((tag, index) => (
                      <div key={index} className="me-2 mb-2">
                        <button
                          className={`btn btn-sm ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show HuggingFace error if any */}
              {searchType === 'huggingface' && huggingFaceError && (
                <div className="alert alert-danger mb-4">
                  <span className="me-2">⚠️</span>
                  {huggingFaceError}
                </div>
              )}

              {/* Link to Hugging Face website */}
              {searchType === 'huggingface' && (
                <div className="mb-4">
                  <p>
                    Browse all available models at <a href="https://huggingface.co/models" target="_blank" rel="noopener noreferrer">Hugging Face Model Hub</a>.
                  </p>
                </div>
              )}

              <div className="row">
                {(searchType === 'local' ? filteredModels : huggingFaceModels).length === 0 ? (
                  <div className="col-12 text-center py-4">
                    {searchType === 'local' ? (
                      <p>No models found matching your search criteria</p>
                    ) : huggingFaceLoading ? (
                      <div>
                        <div className="spinner-border text-primary mb-3" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Searching Hugging Face models...</p>
                      </div>
                    ) : searchQuery ? (
                      <p>No Hugging Face models found. Try a different search term or browse the Model Hub.</p>
                    ) : (
                      <p>Enter a search term to find models on Hugging Face.</p>
                    )}
                  </div>
                ) : (
                  (searchType === 'local' ? filteredModels : huggingFaceModels).map((model) => (
                    <div key={model._id || model.id} className="col-md-4 mb-4">
                      <div className="card h-100 model-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="card-title mb-0">{model.name}</h6>
                            <span className="badge bg-info">{model.parameters}</span>
                          </div>
                          <p className="text-muted small mb-2">By {model.organization}</p>
                          <p className="card-text mb-3">{model.description}</p>
                          <div className="mb-3">
                            {(model.tags || []).map((tag, index) => (
                              <span key={index} className="badge bg-light text-dark me-1 mb-1">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="card-footer bg-transparent">
                          <button
                            className="btn btn-primary w-100"
                            onClick={() => handleModelSelect(model)}
                          >
                            Deploy Model
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {showDeploymentModal && selectedModel && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deploy {selectedModel.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeploymentModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <h6 className="mb-3">Model Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Name:</strong> {selectedModel.name}</p>
                      <p><strong>Organization:</strong> {selectedModel.organization}</p>
                      <p><strong>Parameters:</strong> {selectedModel.parameters}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Repository:</strong> <a href={selectedModel.repoUrl} target="_blank" rel="noopener noreferrer">Hugging Face</a></p>
                      <p><strong>License:</strong> {selectedModel.license}</p>
                      <p><strong>Tags:</strong> {(selectedModel.tags || []).join(', ')}</p>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3">Deployment Configuration</h6>
                <div className="mb-3">
                  <label className="form-label">Hardware Tier</label>
                  <select
                    className="form-select"
                    name="hardwareTier"
                    value={deploymentConfig.hardwareTier}
                    onChange={handleInputChange}
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
                    value={deploymentConfig.replicas}
                    onChange={handleInputChange}
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
                    value={deploymentConfig.maxTokens}
                    onChange={handleInputChange}
                  />
                  <div className="form-text">Maximum context length for model inputs and outputs</div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Access Control</label>
                  <select
                    className="form-select"
                    name="allowedUsers"
                    value={deploymentConfig.allowedUsers}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Users</option>
                    <option value="team">Team Only</option>
                    <option value="admin">Admins Only</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Advanced Configuration (JSON)</label>
                  <textarea
                    className="form-control"
                    name="customParameters"
                    rows="4"
                    value={deploymentConfig.customParameters}
                    onChange={handleInputChange}
                    placeholder='{"temperature": 0.7, "top_p": 0.9, "custom_option": "value"}'
                  ></textarea>
                  <div className="form-text">Additional configuration parameters in JSON format</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDeploymentModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleDeployModel}>Deploy Model</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfHostedAI;
