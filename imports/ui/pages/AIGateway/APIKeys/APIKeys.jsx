import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import feather from 'feather-icons';
import './APIKeys.scss';
// Some components are missing. will add this later.
// import LoadingSpinner from '/imports/ui/components/LoadingSpinner';
// import ErrorAlert from '/imports/ui/components/ErrorAlert';
// import CreateKeyModal from './components/CreateKeyModal';

export const APIKeys = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [showApiKey, setShowApiKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Get API keys using useTracker
  const { loading, apiKeys, error } = useTracker(() => {
    try {
      // Subscribe to API keys
      const apiKeysHandle = Meteor.subscribe('apiKeys');

      return {
        loading: !apiKeysHandle.ready(),
        apiKeys: Meteor.call('aiGateway.listApiKeys') || [],
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

  // Initialize feather icons
  useEffect(() => {
    feather.replace();
  }, [loading, apiKeys, showApiKey, copiedKey]);

  const handleCreateApiKey = (formData) => {
    Meteor.call('aiGateway.createApiKey', formData, (error, result) => {
      if (error) {
        console.error('Error creating API key:', error);
        toast.error(`Failed to create API key: ${error.message}`);
      } else {
        console.log('API key created:', result);
        toast.success('API key created successfully!');
        setSelectedApiKey({
          id: result.id,
          name: result.name,
          key: result.key
        });
        setShowCreateModal(false);
      }
    });
  };

  const handleDeactivateKey = (keyId) => {
    if (confirm('Are you sure you want to deactivate this API key? This action cannot be undone.')) {
      Meteor.call('aiGateway.deactivateApiKey', keyId, (error) => {
        if (error) {
          console.error('Error deactivating API key:', error);
          toast.error(`Failed to deactivate API key: ${error.message}`);
        } else {
          toast.success('API key deactivated successfully');
        }
      });
    }
  };

  const handleDeleteKey = (keyId) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      Meteor.call('aiGateway.deleteApiKey', keyId, (error) => {
        if (error) {
          console.error('Error deleting API key:', error);
          toast.error(`Failed to delete API key: ${error.message}`);
        } else {
          toast.success('API key deleted successfully');
        }
      });
    }
  };

  const toggleShowApiKey = (keyId) => {
    if (showApiKey === keyId) {
      setShowApiKey(null);
    } else {
      setShowApiKey(keyId);
    }
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Calculate expiration status
  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return { status: 'active', label: 'Never expires' };

    const now = new Date();
    const expDate = new Date(expiresAt);
    const daysUntilExpiration = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

    if (expDate < now) {
      return { status: 'expired', label: 'Expired' };
    } else if (daysUntilExpiration <= 7) {
      return { status: 'warning', label: `Expires in ${daysUntilExpiration} days` };
    } else {
      return { status: 'active', label: `Expires in ${daysUntilExpiration} days` };
    }
  };

  if (loading) {
    // return <LoadingSpinner message="Loading API keys..." />;
  }

  if (error) {
    // return <ErrorAlert title="Error Loading API Keys" message={error} />;
  }

  return (
    <div className="api-keys">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">API Keys</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <i data-feather="arrow-left" className="icon-sm me-2"></i> Back to Gateway
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i data-feather="plus" className="icon-sm me-2"></i> Create API Key
          </button>
        </div>
      </div>

      {/* Newly Created API Key Alert */}
      {selectedApiKey && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <i data-feather="check-circle" className="icon-lg me-3"></i>
                <div className="flex-grow-1">
                  <h5 className="alert-heading">API Key Created Successfully!</h5>
                  <p>Your new API key has been created. Please copy it now as you won't be able to see it again.</p>
                  <div className="api-key-display p-2 bg-light rounded mb-3">
                    <div className="d-flex align-items-center">
                      <code className="flex-grow-1">{selectedApiKey.key}</code>
                      <button
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => copyToClipboard(selectedApiKey.key, 'new')}
                      >
                        {copiedKey === 'new' ? (
                          <>
                            <i data-feather="check" className="icon-sm"></i> Copied!
                          </>
                        ) : (
                          <>
                            <i data-feather="copy" className="icon-sm"></i> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedApiKey(null)}
                  >
                    <i data-feather="x" className="icon-sm me-2"></i> Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Usage Info */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Using API Keys</h6>
              <p>
                API keys are used to authenticate requests to the AI Gateway. Include the API key in the
                <code>Authorization</code> header of your requests as follows:
              </p>
              <div className="bg-light p-3 rounded">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <div className="mt-3">
                <button className="btn btn-sm btn-outline-primary me-2">
                  <i data-feather="book" className="icon-sm me-2"></i> View API Documentation
                </button>
                <button className="btn btn-sm btn-outline-secondary">
                  <i data-feather="download" className="icon-sm me-2"></i> Download SDK
                </button>
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
                    <i data-feather="key" style={{ width: '48px', height: '48px', strokeWidth: 1 }}></i>
                  </div>
                  <p className="mb-3">No API keys created yet</p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i data-feather="plus" className="icon-sm me-2"></i> Create API Key
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>API Key</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Last Used</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => {
                        const expirationInfo = getExpirationStatus(key.expires_at);

                        return (
                          <tr key={key.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i data-feather="key" className="icon-sm me-2 text-primary"></i>
                                <span>{key.name}</span>
                              </div>
                            </td>
                            <td>
                              <div className="api-key-cell">
                                {showApiKey === key.id ? (
                                  <div className="d-flex align-items-center">
                                    <code>{key.key_preview || '••••••••••••••••••••••'}</code>
                                    <button
                                      className="btn btn-sm btn-outline-secondary ms-2"
                                      onClick={() => toggleShowApiKey(key.id)}
                                    >
                                      <i data-feather="eye-off" className="icon-sm"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-primary ms-1"
                                      onClick={() => copyToClipboard(key.key_preview, key.id)}
                                      disabled={!key.key_preview}
                                    >
                                      {copiedKey === key.id ? (
                                        <i data-feather="check" className="icon-sm"></i>
                                      ) : (
                                        <i data-feather="copy" className="icon-sm"></i>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="d-flex align-items-center">
                                    <code>••••••••••••••••••••••</code>
                                    <button
                                      className="btn btn-sm btn-outline-secondary ms-2"
                                      onClick={() => toggleShowApiKey(key.id)}
                                      disabled={!key.key_preview}
                                    >
                                      <i data-feather="eye" className="icon-sm"></i>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`badge bg-${key.is_active ? (expirationInfo.status === 'warning' ? 'warning' : 'success') : 'danger'}`}>
                                {key.is_active ? (expirationInfo.status === 'expired' ? 'Expired' : 'Active') : 'Inactive'}
                              </span>
                              <small className="d-block text-muted mt-1">{expirationInfo.label}</small>
                            </td>
                            <td>{formatDate(key.created_at)}</td>
                            <td>{formatDate(key.last_used_at)}</td>
                            <td>
                              <div className="d-flex">
                                <button
                                  className="btn btn-sm btn-outline-danger me-1"
                                  title="Deactivate"
                                  onClick={() => handleDeactivateKey(key.id)}
                                  disabled={!key.is_active}
                                >
                                  <i data-feather="slash" style={{ width: '16px', height: '16px' }}></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete"
                                  onClick={() => handleDeleteKey(key.id)}
                                >
                                  <i data-feather="trash-2" style={{ width: '16px', height: '16px' }}></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {/* {showCreateModal && (
        <CreateKeyModal
          onSubmit={handleCreateApiKey}
          onClose={() => setShowCreateModal(false)}
        />
      )} */}
    </div>
  );
};

export default APIKeys;
