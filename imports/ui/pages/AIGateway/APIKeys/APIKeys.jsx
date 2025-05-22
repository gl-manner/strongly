import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './APIKeys.scss';
import { ProviderApiKeysCollection } from '/imports/api/ai-gateway/ProviderApiKeysCollection';
import Spinner from '/imports/ui/components/common/Spinner/Spinner';
import ErrorAlert from '/imports/ui/components/common/ErrorAlert/ErrorAlert';
import { Alert } from '/imports/ui/components/common/Alert/Alert';
import CreateProviderKeyModal from '/imports/ui/pages/AIGateway/components/CreateProviderKeyModal';

// Simple icons
const Icons = {
  ArrowLeft: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12,19 5,12 12,5"></polyline>
    </svg>
  ),
  Plus: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
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
  ),
  Copy: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  ),
  Check: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  Edit: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  Trash: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Zap: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
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
  X: ({ className = "" }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
};

export const APIKeys = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showKeyValues, setShowKeyValues] = useState({});
  const [copiedKeys, setCopiedKeys] = useState({});
  const [alerts, setAlerts] = useState([]);

  // Alert management functions
  const showAlert = (type, message) => {
    const alertId = Date.now();
    const newAlert = {
      id: alertId,
      type,
      message
    };
    setAlerts(prev => [...prev, newAlert]);
    return alertId;
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Get provider API keys using useTracker
  const { loading, apiKeys, error } = useTracker(() => {
    try {
      const handle = Meteor.subscribe('providerApiKeys');

      return {
        loading: !handle.ready(),
        apiKeys: ProviderApiKeysCollection.find({}, { sort: { createdAt: -1 } }).fetch(),
        error: null
      };
    } catch (error) {
      console.error("Error in API Keys tracker:", error);
      return {
        loading: false,
        apiKeys: [],
        error: error.message
      };
    }
  }, []);

  const handleCreateApiKey = (formData) => {
    toast.info('Creating API key...', { autoClose: false, toastId: 'creating-key' });

    Meteor.call('providerApiKeys.create', formData, (error, result) => {
      toast.dismiss('creating-key');

      if (error) {
        console.error('Error creating API key:', error);
        toast.error(`Failed to create API key: ${error.message}`);
        showAlert('error', `Failed to create API key: ${error.message}`);
      } else {
        console.log('API key created:', result);
        toast.success('API key created and validated successfully!');
        showAlert('success', `${result.name} created successfully!`);
        setShowCreateModal(false);
      }
    });
  };

  const handleUpdateApiKey = (formData) => {
    if (!editingKey) return;

    toast.info('Updating API key...', { autoClose: false, toastId: 'updating-key' });

    Meteor.call('providerApiKeys.update', editingKey._id, formData, (error, result) => {
      toast.dismiss('updating-key');

      if (error) {
        console.error('Error updating API key:', error);
        toast.error(`Failed to update API key: ${error.message}`);
        showAlert('error', `Failed to update API key: ${error.message}`);
      } else {
        console.log('API key updated:', result);
        toast.success('API key updated successfully!');
        showAlert('success', `${editingKey.name} updated successfully!`);
        setShowEditModal(false);
        setEditingKey(null);
      }
    });
  };

  const handleDeleteKey = (keyId, keyName) => {
    if (confirm(`Are you sure you want to delete "${keyName}"? This action cannot be undone and may affect models using this key.`)) {
      toast.info('Deleting API key...', { autoClose: false, toastId: 'deleting-key' });

      Meteor.call('providerApiKeys.delete', keyId, (error, result) => {
        toast.dismiss('deleting-key');

        if (error) {
          console.error('Error deleting API key:', error);
          toast.error(`Failed to delete API key: ${error.message}`);
        } else {
          toast.success('API key deleted successfully');
        }
      });
    }
  };

  const handleTestKey = (keyId, keyName) => {
    toast.info(`Testing ${keyName}...`, { autoClose: false, toastId: `testing-${keyId}` });

    Meteor.call('providerApiKeys.test', keyId, (error, result) => {
      toast.dismiss(`testing-${keyId}`);

      if (error) {
        toast.error(`Test failed: ${error.message}`);
        showAlert('error', `${keyName} connection test failed: ${error.message}`);
      } else if (result.success) {
        toast.success(`${keyName} connection test successful!`);
        showAlert('success', `${keyName} connection test successful!`);
      } else {
        toast.error(`${keyName} connection test failed: ${result.message}`);
        showAlert('error', `${keyName} connection test failed: ${result.message}`);
      }
    });
  };

  const handleEditKey = (key) => {
    // Load the full key details for editing
    Meteor.call('providerApiKeys.get', key._id, (error, keyDetails) => {
      if (error) {
        console.error('Error loading key details:', error);
        toast.error(`Failed to load key details: ${error.message}`);
        showAlert('error', `Failed to load key details: ${error.message}`);
      } else {
        setEditingKey(keyDetails);
        setShowEditModal(true);
      }
    });
  };

  const toggleShowKey = (keyId) => {
    setShowKeyValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKeys(prev => ({ ...prev, [keyId]: true }));
      setTimeout(() => {
        setCopiedKeys(prev => ({ ...prev, [keyId]: false }));
      }, 2000);
      toast.success('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const getProviderBadgeColor = (provider) => {
    const colors = {
      'openai': 'success',
      'anthropic': 'primary',
      'mistral': 'warning',
      'google': 'info',
      'cohere': 'secondary',
      'custom': 'dark'
    };
    return colors[provider] || 'secondary';
  };

  if (loading) {
    return <Spinner message="Loading API keys..." />;
  }

  if (error) {
    return <ErrorAlert title="Error Loading API Keys" message={error} />;
  }

  return (
    <div className="api-keys">
      {/* Alert notifications */}
      <div className="alerts-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1050 }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onClose={() => removeAlert(alert.id)}
            timeout={alert.type === 'error' ? 8000 : 5000} // Show errors longer
          />
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Provider API Keys</h4>
          <p className="text-muted">Manage API keys for third-party AI providers</p>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <Icons.ArrowLeft className="icon-sm me-2" /> Back to Gateway
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Icons.Plus className="icon-sm me-2" /> Add API Key
          </button>
        </div>
      </div>

      {/* Usage Information */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">About Provider API Keys</h6>
              <p className="mb-3">
                Provider API keys are used to authenticate with third-party AI services like OpenAI, Anthropic, and others.
                These keys are securely stored and can be reused across multiple models.
              </p>
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Benefits:</h6>
                  <ul className="list-unstyled">
                    <li>• Reuse keys across multiple models</li>
                    <li>• Centralized key management</li>
                    <li>• Built-in key validation</li>
                    <li>• Usage tracking and monitoring</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Security:</h6>
                  <ul className="list-unstyled">
                    <li>• Keys are encrypted at rest</li>
                    <li>• Keys are never displayed in full</li>
                    <li>• Individual user access control</li>
                    <li>• Connection testing before storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-4">Your API Keys</h6>

              {apiKeys.length === 0 ? (
                <div className="text-center py-4">
                  <div className="mb-3">
                    <Icons.Key style={{ width: '48px', height: '48px', strokeWidth: 1, opacity: 0.5 }} />
                  </div>
                  <p className="mb-3">No API keys created yet</p>
                  <p className="text-muted mb-3">
                    Add API keys for your preferred AI providers to get started with third-party models.
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Icons.Plus className="icon-sm me-2" /> Add Your First API Key
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Provider</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Used</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Icons.Key className="icon-sm me-2 text-primary" />
                              <div>
                                <div className="fw-medium">{key.name}</div>
                                {key.description && (
                                  <small className="text-muted">{key.description}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${getProviderBadgeColor(key.provider)}`}>
                              {key.provider}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${key.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {key.testResult && (
                              <div className="mt-1">
                                <small className={`text-${key.testResult.success ? 'success' : 'danger'}`}>
                                  Last test: {key.testResult.success ? 'Passed' : 'Failed'}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(key.createdAt)}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(key.lastUsedAt)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                title="Edit"
                                onClick={() => handleEditKey(key)}
                              >
                                <Icons.Edit className="icon-sm" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                title="Test Connection"
                                onClick={() => handleTestKey(key._id, key.name)}
                              >
                                <Icons.Zap className="icon-sm" />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                                onClick={() => handleDeleteKey(key._id, key.name)}
                              >
                                <Icons.Trash className="icon-sm" />
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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <CreateProviderKeyModal
          onSubmit={handleCreateApiKey}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit API Key Modal */}
      {showEditModal && editingKey && (
        <CreateProviderKeyModal
          onSubmit={handleUpdateApiKey}
          onClose={() => {
            setShowEditModal(false);
            setEditingKey(null);
          }}
          isEditing={true}
          editingKey={editingKey}
        />
      )}
    </div>
  );
};

export default APIKeys;
