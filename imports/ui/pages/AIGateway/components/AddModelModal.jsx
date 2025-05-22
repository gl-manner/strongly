import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';

// Simple SVG icon components to replace feather icons
const Icons = {
  Settings: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  Sliders: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"></line>
      <line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line>
      <line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
  ),
  List: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  ),
  Users: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Search: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="M21 21l-4.35-4.35"></path>
    </svg>
  ),
  ChevronLeft: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6"></polyline>
    </svg>
  ),
  ChevronRight: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  ),
  Info: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
  CheckCircle: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22,4 12,14.01 9,11.01"></polyline>
    </svg>
  ),
  AlertCircle: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  Zap: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
    </svg>
  ),
  Plus: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Save: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17,21 17,13 7,13 7,21"></polyline>
      <polyline points="7,3 7,8 15,8"></polyline>
    </svg>
  ),
  Key: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
    </svg>
  ),
  Eye: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  EyeOff: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  )
};

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
  provider,
  isEditing = false,
  editingModel = null,
  // User sharing props
  users = [],
  selectedUsers = [],
  onUserSelectionChange,
  loadingUsers = false,
  usersError = null,
  onSearchUsers,
  userSearchQuery = '',
  usersPagination = { currentPage: 1, totalPages: 1, totalUsers: 0, usersPerPage: 10 },
  onPageChange
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [jsonValid, setJsonValid] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState(userSearchQuery);

  // API key integration state
  const [availableApiKeys, setAvailableApiKeys] = useState([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [useExistingKey, setUseExistingKey] = useState(true);

  // Handle search input with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchUsers && searchQuery !== userSearchQuery) {
        onSearchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchUsers, userSearchQuery]);

  // Load available API keys when modal opens or provider changes
  useEffect(() => {
    if (formData.provider && (activeTab === 'basic' || !isEditing)) {
      setLoadingApiKeys(true);

      Meteor.call('providerApiKeys.list', (error, keys) => {
        setLoadingApiKeys(false);

        if (error) {
          console.error('Error loading API keys:', error);
          setAvailableApiKeys([]);
        } else {
          // Filter keys by provider
          const providerKeys = keys.filter(key =>
            key.provider.toLowerCase() === formData.provider.toLowerCase() && key.isActive
          );
          setAvailableApiKeys(providerKeys);

          // Auto-select first available key if none selected
          if (providerKeys.length > 0 && !formData.selectedApiKeyId && useExistingKey) {
            onInputChange({
              target: {
                name: 'selectedApiKeyId',
                value: providerKeys[0]._id
              }
            });
          }
        }
      });
    }
  }, [formData.provider, activeTab, useExistingKey]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Handle user selection
  const handleUserSelect = (userId, selected) => {
    if (onUserSelectionChange) {
      const newSelection = selected
        ? [...selectedUsers, userId]
        : selectedUsers.filter(id => id !== userId);
      onUserSelectionChange(newSelection);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (onUserSelectionChange) {
      const currentPageUserIds = users.map(user => user._id);
      const allSelected = currentPageUserIds.every(id => selectedUsers.includes(id));

      if (allSelected) {
        // Deselect all users on current page
        const newSelection = selectedUsers.filter(id => !currentPageUserIds.includes(id));
        onUserSelectionChange(newSelection);
      } else {
        // Select all users on current page
        const newSelection = [...new Set([...selectedUsers, ...currentPageUserIds])];
        onUserSelectionChange(newSelection);
      }
    }
  };

  const isAllSelected = users.length > 0 && users.every(user => selectedUsers.includes(user._id));
  const isSomeSelected = users.some(user => selectedUsers.includes(user._id));

  const getModalTitle = () => {
    if (isEditing && editingModel) {
      return `Edit ${editingModel.name}`;
    }
    if (provider) {
      return (
        <div className="d-flex align-items-center">
          {provider.logoUrl && (
            <img src={provider.logoUrl} alt={provider.name} style={{ height: '24px', marginRight: '10px' }} />
          )}
          Configure {provider.name}
        </div>
      );
    }
    return 'Add Third-Party Model';
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'provider'];

    // For new models, we need either an API key or selected API key
    if (!isEditing) {
      requiredFields.push('modelName');
      const hasApiKey = useExistingKey ? formData.selectedApiKeyId : formData.apiKey;
      if (!hasApiKey) {
        return false;
      }
    }

    return requiredFields.every(field => formData[field]?.trim()) && jsonValid;
  };

  const canTestConnection = () => {
    if (isEditing) {
      return !testInProgress;
    } else {
      const hasApiKey = useExistingKey ? formData.selectedApiKeyId : formData.apiKey;
      return !testInProgress &&
             hasApiKey &&
             formData.provider &&
             formData.modelName &&
             jsonValid;
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {getModalTitle()}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => handleTabChange('basic')}
                  >
                    <Icons.Settings className="icon-sm me-2" /> Basic Settings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => handleTabChange('advanced')}
                  >
                    <Icons.Sliders className="icon-sm me-2" /> Advanced Options
                  </button>
                </li>
                {discoveredModels.length > 0 && (
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'models' ? 'active' : ''}`}
                      onClick={() => handleTabChange('models')}
                    >
                      <Icons.List className="icon-sm me-2" /> Available Models
                      <span className="badge bg-primary ms-2">{discoveredModels.length}</span>
                    </button>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${activeTab === 'sharing' ? 'active' : ''}`}
                    onClick={() => handleTabChange('sharing')}
                  >
                    <Icons.Users className="icon-sm me-2" /> User Access
                    {selectedUsers.length > 0 && (
                      <span className="badge bg-success ms-2">{selectedUsers.length}</span>
                    )}
                  </button>
                </li>
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
                        disabled={isEditing}
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
                      <label className="form-label">
                        API Endpoint
                        {!isEditing && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="apiEndpoint"
                        placeholder="e.g., https://api.openai.com/v1"
                        value={formData.apiEndpoint}
                        onChange={onInputChange}
                        required={!isEditing}
                        disabled={isEditing}
                      />
                      {isEditing && (
                        <div className="form-text text-warning">
                          <Icons.Info className="icon-sm me-1" />
                          API endpoint cannot be changed for existing models for security reasons.
                        </div>
                      )}
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
                        disabled={isEditing}
                      />
                    </div>
                  </div>

                  {/* API Key Section */}
                  {!isEditing && (
                    <div className="mb-3">
                      <label className="form-label">
                        API Key <span className="text-danger">*</span>
                      </label>

                      <div className="mb-2">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="keyOption"
                            id="useExistingKey"
                            checked={useExistingKey}
                            onChange={() => setUseExistingKey(true)}
                          />
                          <label className="form-check-label" htmlFor="useExistingKey">
                            Use Existing Key
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="keyOption"
                            id="useNewKey"
                            checked={!useExistingKey}
                            onChange={() => setUseExistingKey(false)}
                          />
                          <label className="form-check-label" htmlFor="useNewKey">
                            Enter New Key
                          </label>
                        </div>
                      </div>

                      {useExistingKey ? (
                        <div>
                          {loadingApiKeys ? (
                            <div className="d-flex align-items-center">
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              <span>Loading your API keys...</span>
                            </div>
                          ) : availableApiKeys.length > 0 ? (
                            <div>
                              <select
                                className="form-select"
                                name="selectedApiKeyId"
                                value={formData.selectedApiKeyId || ''}
                                onChange={onInputChange}
                                required
                              >
                                <option value="">Select an API key</option>
                                {availableApiKeys.map(key => (
                                  <option key={key._id} value={key._id}>
                                    {key.name} ({key.keyPreview})
                                  </option>
                                ))}
                              </select>
                              <div className="form-text">
                                Select from your saved API keys for {formData.provider}
                              </div>
                            </div>
                          ) : (
                            <div className="alert alert-info">
                              <div className="d-flex align-items-center">
                                <Icons.Info className="icon-sm me-2" />
                                <div>
                                  <p className="mb-2">No saved API keys found for {formData.provider}.</p>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => {
                                        // Open API keys management in new tab
                                        window.open('/operations/ai-gateway/api-keys', '_blank');
                                      }}
                                    >
                                      <Icons.Plus className="icon-sm me-1" /> Add API Key
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => setUseExistingKey(false)}
                                    >
                                      Enter Key Manually
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="input-group">
                            <input
                              type={showApiKey ? "text" : "password"}
                              className="form-control"
                              name="apiKey"
                              placeholder="Enter API key"
                              value={formData.apiKey}
                              onChange={onInputChange}
                              required
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <Icons.EyeOff className="icon-sm" /> : <Icons.Eye className="icon-sm" />}
                            </button>
                          </div>
                          <div className="form-text">
                            <div className="d-flex justify-content-between align-items-center">
                              <span>Your API key will be used for this model only.</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-link p-0"
                                onClick={() => setUseExistingKey(true)}
                              >
                                Use saved key instead
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <div className="d-flex">
                          <Icons.Key className="icon-sm me-2 flex-shrink-0" />
                          <div>
                            <strong>API Key Security</strong>
                            <p className="mb-0">
                              For security reasons, API keys cannot be viewed or modified through this interface.
                              If you need to update the API key, please delete this model and create a new one.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">
                        Model Name
                        {!isEditing && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="modelName"
                        placeholder="e.g., gpt-4-turbo"
                        value={formData.modelName}
                        onChange={onInputChange}
                        required={!isEditing}
                        disabled={isEditing}
                      />
                      {isEditing && (
                        <div className="form-text text-warning">
                          <Icons.Info className="icon-sm me-1" />
                          Model name cannot be changed for existing deployments.
                        </div>
                      )}
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
                      <Icons.Info className="icon-sm me-2 flex-shrink-0" />
                      <div>
                        <p className="mb-1">
                          <strong>Advanced Settings Tips:</strong>
                        </p>
                        <ul className="mb-0 ps-3">
                          <li>For Azure OpenAI, add <code>{'{\"x-ms-azure-api-key\": \"your-key\"}'}</code> to headers</li>
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

              {activeTab === 'sharing' && (
                <div className="user-sharing">
                  <div className="mb-3">
                    <h6 className="mb-2">Share Model Access</h6>
                    <p className="text-muted mb-3">
                      Select users who should have access to this model. By default, only you have access to your models.
                    </p>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-8">
                      <div className="input-group">
                        <span className="input-group-text">
                          <Icons.Search className="icon-sm" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search users by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <button
                        type="button"
                        className={`btn w-100 ${isAllSelected ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                        onClick={handleSelectAll}
                        disabled={users.length === 0}
                      >
                        {isAllSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading users...</span>
                      </div>
                      <p>Loading users...</p>
                    </div>
                  ) : usersError ? (
                    <div className="alert alert-danger">
                      <Icons.AlertCircle className="icon-sm me-2" />
                      Error loading users: {usersError}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-4">
                      <Icons.Users style={{ width: '48px', height: '48px', strokeWidth: 1, opacity: 0.5 }} />
                      <p className="mt-3 mb-0 text-muted">
                        {searchQuery ? 'No users found matching your search.' : 'No users available.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {selectedUsers.length > 0 && (
                        <div className="alert alert-info mb-3">
                          <Icons.Info className="icon-sm me-2" />
                          <strong>{selectedUsers.length}</strong> user{selectedUsers.length !== 1 ? 's' : ''} selected for access
                        </div>
                      )}

                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover">
                          <thead className="sticky-top bg-white">
                            <tr>
                              <th style={{ width: '40px' }}>
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isAllSelected}
                                  ref={input => {
                                    if (input) input.indeterminate = isSomeSelected && !isAllSelected;
                                  }}
                                  onChange={handleSelectAll}
                                />
                              </th>
                              <th>User</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Last Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user._id}>
                                <td>
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={(e) => handleUserSelect(user._id, e.target.checked)}
                                  />
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <div className="avatar-circle me-2" style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      backgroundColor: '#e9ecef',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '14px',
                                      fontWeight: '500',
                                      color: '#495057'
                                    }}>
                                      {(user.profile?.name || user.username || user.emails?.[0]?.address || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="fw-medium">
                                        {user.profile?.name || user.username || 'Unknown User'}
                                      </div>
                                      {user.profile?.name && user.username && (
                                        <small className="text-muted">@{user.username}</small>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-muted">
                                    {user.emails?.[0]?.address || 'No email'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${user.roles?.includes('admin') ? 'bg-danger' : 'bg-secondary'}`}>
                                    {user.roles?.includes('admin') ? 'Admin' : 'User'}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-muted">
                                    {user.status?.lastActivity ?
                                      new Date(user.status.lastActivity).toLocaleDateString() :
                                      'Never'
                                    }
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {usersPagination.totalPages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="text-muted">
                            Showing {((usersPagination.currentPage - 1) * usersPagination.usersPerPage) + 1} to{' '}
                            {Math.min(usersPagination.currentPage * usersPagination.usersPerPage, usersPagination.totalUsers)} of{' '}
                            {usersPagination.totalUsers} users
                          </div>
                          <nav>
                            <ul className="pagination pagination-sm mb-0">
                              <li className={`page-item ${usersPagination.currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => onPageChange && onPageChange(usersPagination.currentPage - 1)}
                                  disabled={usersPagination.currentPage === 1}
                                >
                                  <Icons.ChevronLeft className="icon-sm" />
                                </button>
                              </li>

                              {[...Array(Math.min(5, usersPagination.totalPages))].map((_, index) => {
                                let pageNum;
                                if (usersPagination.totalPages <= 5) {
                                  pageNum = index + 1;
                                } else if (usersPagination.currentPage <= 3) {
                                  pageNum = index + 1;
                                } else if (usersPagination.currentPage >= usersPagination.totalPages - 2) {
                                  pageNum = usersPagination.totalPages - 4 + index;
                                } else {
                                  pageNum = usersPagination.currentPage - 2 + index;
                                }

                                return (
                                  <li key={pageNum} className={`page-item ${usersPagination.currentPage === pageNum ? 'active' : ''}`}>
                                    <button
                                      className="page-link"
                                      onClick={() => onPageChange && onPageChange(pageNum)}
                                    >
                                      {pageNum}
                                    </button>
                                  </li>
                                );
                              })}

                              <li className={`page-item ${usersPagination.currentPage === usersPagination.totalPages ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => onPageChange && onPageChange(usersPagination.currentPage + 1)}
                                  disabled={usersPagination.currentPage === usersPagination.totalPages}
                                >
                                  <Icons.ChevronRight className="icon-sm" />
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {testStatus && (
                <div className={`alert ${testStatus.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                  <div className="d-flex align-items-center">
                    {testStatus.success ? (
                      <Icons.CheckCircle className="icon-sm me-2" />
                    ) : (
                      <Icons.AlertCircle className="icon-sm me-2" />
                    )}
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
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={onTestConnection}
                disabled={!canTestConnection()}
              >
                {testInProgress ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Testing...
                  </>
                ) : (
                  <>
                    <Icons.Zap className="icon-sm me-2" /> Test Connection
                  </>
                )}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid()}
              >
                {isEditing ? (
                  <>
                    <Icons.Save className="icon-sm me-2" /> Update Model
                  </>
                ) : (
                  <>
                    <Icons.Plus className="icon-sm me-2" /> Add Model
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddModelModal;
