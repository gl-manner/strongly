// CreateProviderKeyModal.js

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';

// Simple icons
const Icons = {
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
  Info: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
};

// Provider templates
const providerTemplates = [
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    requiresOrg: true,
    placeholder: 'sk-...',
    helpText: 'Get your API key from https://platform.openai.com/api-keys'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com',
    requiresOrg: false,
    placeholder: 'sk-ant-...',
    helpText: 'Get your API key from https://console.anthropic.com/settings/keys'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    endpoint: 'https://api.mistral.ai/v1',
    requiresOrg: false,
    placeholder: 'sk-...',
    helpText: 'Get your API key from https://console.mistral.ai/api-keys'
  },
  {
    id: 'google',
    name: 'Google AI',
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    requiresOrg: false,
    placeholder: 'AIza...',
    helpText: 'Get your API key from Google AI Studio'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    endpoint: 'https://api.cohere.ai/v1',
    requiresOrg: false,
    placeholder: 'co-...',
    helpText: 'Get your API key from https://dashboard.cohere.com/api-keys'
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    endpoint: '',
    requiresOrg: false,
    placeholder: 'Enter your API key',
    helpText: 'Enter your custom provider API key'
  }
];

const CreateProviderKeyModal = ({ onSubmit, onClose, isEditing = false, editingKey = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    apiKey: '',
    description: '',
    organization: '',
    additionalHeaders: ''
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [jsonValid, setJsonValid] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Populate form for editing
  useEffect(() => {
    if (isEditing && editingKey) {
      console.log('Populating form with editing key:', editingKey);

      setFormData({
        name: editingKey.name || '',
        provider: editingKey.provider || '',
        apiKey: '', // Never populate API key for security
        description: editingKey.description || '',
        organization: editingKey.organization || '',
        additionalHeaders: editingKey.additionalHeaders ?
          JSON.stringify(editingKey.additionalHeaders, null, 2) : ''
      });
    } else if (!isEditing) {
      // Reset form for new key creation
      setFormData({
        name: '',
        provider: '',
        apiKey: '',
        description: '',
        organization: '',
        additionalHeaders: ''
      });
    }
  }, [isEditing, editingKey]);

  // Handle provider selection for editing mode
  useEffect(() => {
    if (isEditing && editingKey && formData.provider) {
      const provider = providerTemplates.find(p => p.id.toLowerCase() === formData.provider.toLowerCase());
      if (provider) {
        console.log('Setting selected provider for editing:', provider);
        setSelectedProvider(provider);
      }
    }
  }, [isEditing, editingKey, formData.provider]);

  // Validate JSON
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate name when provider is selected
    if (name === 'provider' && !formData.name) {
      const provider = providerTemplates.find(p => p.id === value);
      if (provider) {
        setFormData(prev => ({
          ...prev,
          name: `My ${provider.name} Key`
        }));
      }
    }
  };

  const handleProviderSelect = (providerId) => {
    const provider = providerTemplates.find(p => p.id === providerId);
    if (provider) {
      setFormData(prev => ({
        ...prev,
        provider: providerId,
        name: prev.name || `My ${provider.name} Key`
      }));
    }
  };

  const handleTestConnection = () => {
    if (!formData.apiKey || !formData.provider) {
      return;
    }

    setTestInProgress(true);
    setTestResult(null);

    // Prepare test data, only including fields that have values
    const testData = {
      provider: formData.provider,
      apiKey: formData.apiKey
    };

    // Only add optional fields if they have values
    if (formData.organization && formData.organization.trim()) {
      testData.organization = formData.organization.trim();
    }

    if (formData.additionalHeaders && formData.additionalHeaders.trim()) {
      try {
        testData.additionalHeaders = JSON.parse(formData.additionalHeaders);
      } catch (e) {
        setTestResult({
          success: false,
          message: 'Invalid JSON in additional headers'
        });
        setTestInProgress(false);
        return;
      }
    }

    Meteor.call('aiGateway.testProviderApiKey', testData, (error, result) => {
      setTestInProgress(false);

      if (error) {
        setTestResult({
          success: false,
          message: error.reason || error.message || 'Connection test failed'
        });
      } else {
        setTestResult(result);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    // Prepare submit data, only including fields that have values
    const submitData = {
      name: formData.name.trim(),
      provider: formData.provider
    };

    // For new keys, API key is required
    if (!isEditing) {
      submitData.apiKey = formData.apiKey.trim();
    } else if (formData.apiKey && formData.apiKey.trim()) {
      // For editing, only include API key if user provided a new one
      submitData.apiKey = formData.apiKey.trim();
    }

    // Only add optional fields if they have values
    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim();
    }

    if (formData.organization && formData.organization.trim()) {
      submitData.organization = formData.organization.trim();
    }

    if (formData.additionalHeaders && formData.additionalHeaders.trim()) {
      try {
        submitData.additionalHeaders = JSON.parse(formData.additionalHeaders);
      } catch (e) {
        // This shouldn't happen since we validate JSON, but just in case
        alert('Invalid JSON in additional headers');
        return;
      }
    }

    onSubmit(submitData);
  };

  const isFormValid = () => {
    // For editing, only require name and provider (API key is optional since we're not changing it)
    if (isEditing) {
      const requiredFieldsValid = formData.name.trim() && formData.provider;
      const jsonValidation = jsonValid;
      return requiredFieldsValid && jsonValidation;
    }

    // For creating, require name, provider, and API key
    const requiredFieldsValid = formData.name.trim() &&
                               formData.provider &&
                               formData.apiKey.trim();
    const jsonValidation = jsonValid;
    return requiredFieldsValid && jsonValidation;
  };

  // Get the current provider template (use state if set, otherwise find by ID)
  const currentProvider = selectedProvider || providerTemplates.find(p => p.id === formData.provider);

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Icons.Key className="icon-sm me-2" />
              {isEditing ? `Edit ${editingKey?.name}` : 'Add Provider API Key'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              {/* Provider Selection */}
              <div className="mb-4">
                <label className="form-label">Select Provider <span className="text-danger">*</span></label>
                <div className="row">
                  {providerTemplates.map(provider => (
                    <div key={provider.id} className="col-md-4 mb-2">
                      <div
                        className={`card cursor-pointer ${formData.provider === provider.id ? 'border-primary bg-light' : ''}`}
                        onClick={() => handleProviderSelect(provider.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body text-center py-2">
                          <small className="fw-medium">{provider.name}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div className="row">
                <div className="col-md-8 mb-3">
                  <label className="form-label">Key Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    placeholder="e.g., My OpenAI Key"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Provider <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Provider</option>
                    {providerTemplates.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* API Key */}
              <div className="mb-3">
                <label className="form-label">
                  API Key {isEditing ? <small className="text-warning">(Leave empty to keep current key)</small> : <span className="text-danger">*</span>}
                </label>
                <div className="input-group">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className="form-control"
                    name="apiKey"
                    placeholder={isEditing ? "Leave empty to keep current key" : currentProvider?.placeholder || "Enter your API key"}
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <Icons.EyeOff className="icon-sm" /> : <Icons.Eye className="icon-sm" />}
                  </button>
                </div>
                {isEditing ? (
                  <div className="form-text text-info">
                    <Icons.Info className="icon-sm me-1" />
                    For security reasons, the current API key is not displayed. Leave this field empty to keep the existing key, or enter a new key to replace it.
                  </div>
                ) : (
                  currentProvider?.helpText && (
                    <div className="form-text">
                      {currentProvider.helpText}
                    </div>
                  )
                )}
              </div>

              {/* Organization (for providers that support it) */}
              {currentProvider?.requiresOrg && (
                <div className="mb-3">
                  <label className="form-label">Organization ID <small className="text-muted">(Optional)</small></label>
                  <input
                    type="text"
                    className="form-control"
                    name="organization"
                    placeholder="org-..."
                    value={formData.organization || ''}
                    onChange={handleInputChange}
                  />
                  <div className="form-text">
                    Optional organization ID (for OpenAI team accounts)
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description <small className="text-muted">(Optional)</small></label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="2"
                  placeholder="Optional description for this API key"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* Additional Headers */}
              <div className="mb-3">
                <label className="form-label">Additional Headers <small className="text-muted">(Optional)</small></label>
                <textarea
                  className={`form-control ${!jsonValid ? 'is-invalid' : ''}`}
                  name="additionalHeaders"
                  rows="3"
                  placeholder='{"x-custom-header": "value"}'
                  value={formData.additionalHeaders || ''}
                  onChange={handleInputChange}
                ></textarea>
                {!jsonValid && (
                  <div className="invalid-feedback">
                    Invalid JSON format
                  </div>
                )}
                <div className="form-text">
                  Optional additional HTTP headers in JSON format
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
                  <div className="d-flex align-items-center mb-2">
                    {testResult.success ? (
                      <Icons.CheckCircle className="icon-sm me-2" />
                    ) : (
                      <Icons.AlertCircle className="icon-sm me-2" />
                    )}
                    <strong>{testResult.message}</strong>
                  </div>
                  {testResult.details && (
                    <pre className="mt-2 p-3 bg-light rounded w-100" style={{
                      fontSize: '0.8rem',
                      maxHeight: '200px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
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
                onClick={handleTestConnection}
                disabled={!formData.apiKey || !formData.provider || testInProgress}
              >
                {testInProgress ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
                <Icons.Plus className="icon-sm me-2" />
                {isEditing ? 'Update Key' : 'Add Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProviderKeyModal;
