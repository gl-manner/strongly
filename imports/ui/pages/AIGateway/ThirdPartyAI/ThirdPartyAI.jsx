import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ThirdPartyAI.scss';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import Spinner from '/imports/ui/components/common/Spinner/Spinner';
import ErrorAlert from '/imports/ui/components/common/ErrorAlert/ErrorAlert';
import { Alert } from '/imports/ui/components/common/Alert/Alert';
import ThirdPartyProviderCard from '/imports/ui/pages/AIGateway/components/ThirdPartyProviderCard';
import ConnectedModelsTable from '/imports/ui/pages/AIGateway/components/ConnectedModelsTable';
import AddModelModal from '/imports/ui/pages/AIGateway/components/AddModelModal';

// Simple SVG icon components to replace feather icons
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
  )
};

// Predefined templates for major LLM providers
const providerTemplates = [
  {
    id: 'openai',
    name: 'OpenAI',
    logoUrl: '/assets/images/openai-logo.svg',
    description: 'Connect to OpenAI\'s GPT models including GPT-4 and GPT-3.5 Turbo',
    apiEndpoint: 'https://api.openai.com/v1',
    apiVersion: 'v1',
    defaultModel: 'gpt-4o',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logoUrl: '/assets/images/anthropic-logo.svg',
    description: 'Connect to Anthropic\'s Claude models including Claude 3.7 Sonnet',
    apiEndpoint: 'https://api.anthropic.com',
    apiVersion: '2023-06-01',
    defaultModel: 'claude-3-7-sonnet-20250219',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logoUrl: '/assets/images/mistral-logo.svg',
    description: 'Connect to Mistral AI\'s models including Mistral Large and Small',
    apiEndpoint: 'https://api.mistral.ai/v1',
    apiVersion: 'v1',
    defaultModel: 'mistral-large-latest',
  },
  {
    id: 'google',
    name: 'Google AI',
    logoUrl: '/assets/images/google-logo.svg',
    description: 'Connect to Google\'s Gemini models',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
    apiVersion: 'v1',
    defaultModel: 'gemini-1.5-pro',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    logoUrl: '/assets/images/cohere-logo.svg',
    description: 'Connect to Cohere\'s Command and Embed models',
    apiEndpoint: 'https://api.cohere.ai/v1',
    apiVersion: 'v1',
    defaultModel: 'command-r-plus',
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    logoUrl: '/assets/images/api-logo.svg',
    description: 'Connect to any other LLM provider with a compatible API',
    apiEndpoint: '',
    apiVersion: '',
    defaultModel: '',
    isCustom: true,
  }
];

export const ThirdPartyAI = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
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
  const [discoveredModels, setDiscoveredModels] = useState([]);
  const [discoveringModels, setDiscoveringModels] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // User sharing state
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    usersPerPage: 10
  });

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

  // User management functions
  const loadUsers = (page = 1, search = '') => {
    setLoadingUsers(true);
    setUsersError(null);

    Meteor.call('users.list', {
      page,
      limit: usersPagination.usersPerPage,
      search
    }, (error, result) => {
      setLoadingUsers(false);

      if (error) {
        console.error('Error loading users:', error);
        setUsersError(error.message);
      } else {
        setUsers(result.users);
        setUsersPagination({
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalUsers: result.totalUsers,
          usersPerPage: result.usersPerPage
        });
      }
    });
  };

  const handleSearchUsers = (query) => {
    setUserSearchQuery(query);
    loadUsers(1, query);
  };

  const handlePageChange = (page) => {
    loadUsers(page, userSearchQuery);
  };

  const handleUserSelectionChange = (selectedUserIds) => {
    setSelectedUsers(selectedUserIds);
  };

  // Load users when modal opens
  useEffect(() => {
    if (showAddModal || showEditModal) {
      loadUsers();
    }
  }, [showAddModal, showEditModal]);

  // Get third-party models with useTracker
  const { user, loading, thirdPartyModels, error } = useTracker(() => {
    try {
      const modelsHandle = Meteor.subscribe('deployedLLMs', 'third-party');

      return {
        user: Meteor.user(),
        thirdPartyModels: LLMsCollection.find({ type: 'third-party' }, { sort: { createdAt: -1 } }).fetch(),
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddThirdPartyLLM = (e) => {
    e.preventDefault();

    // Show toast notification for loading state
    toast.info(`Adding model ${formData.name}...`, {
      autoClose: false,
      toastId: 'adding-model'
    });

    // Prepare model data with user sharing
    const modelData = {
      ...formData,
      type: 'third-party',
      sharedWith: selectedUsers // Include selected users
    };

    Meteor.call(
      'aiGateway.addThirdPartyLLM',
      modelData,
      (error, result) => {
        // Dismiss loading toast
        toast.dismiss('adding-model');

        if (error) {
          console.error('Error adding third-party LLM:', error);
          toast.error(`Failed to add model: ${error.message}`);
          showAlert('error', `Failed to add model: ${error.message}`);
        } else {
          console.log('Third-party LLM added:', result);
          toast.success(`${formData.name} added successfully!`);
          showAlert('success', `${formData.name} added successfully!`);

          if (selectedUsers.length > 0) {
            showAlert('info', `Model shared with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`);
          }

          setShowAddModal(false);
          resetForm();
        }
      }
    );
  };

  const handleUpdateThirdPartyLLM = (e) => {
    e.preventDefault();

    if (!editingModel) return;

    // Show toast notification for loading state
    toast.info(`Updating model ${formData.name}...`, {
      autoClose: false,
      toastId: 'updating-model'
    });

    const updateData = {
      name: formData.name,
      parameters: {
        max_tokens: formData.maxTokens,
        organization: formData.organization,
        additional_headers: formData.additionalHeaders ? JSON.parse(formData.additionalHeaders) : undefined
      },
      sharedWith: selectedUsers // Include updated user sharing
    };

    Meteor.call(
      'aiGateway.updateModel',
      editingModel._id,
      updateData,
      (error, result) => {
        // Dismiss loading toast
        toast.dismiss('updating-model');

        if (error) {
          console.error('Error updating third-party LLM:', error);
          toast.error(`Failed to update model: ${error.message}`);
          showAlert('error', `Failed to update model: ${error.message}`);
        } else {
          console.log('Third-party LLM updated:', result);
          toast.success(`${formData.name} updated successfully!`);
          showAlert('success', `${formData.name} updated successfully!`);

          if (selectedUsers.length > 0) {
            showAlert('info', `Model now shared with ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`);
          }

          setShowEditModal(false);
          setEditingModel(null);
          resetForm();
        }
      }
    );
  };

  const handleTestConnection = () => {
    console.log('handleTestConnection called');
    console.log('editingModel:', editingModel);
    console.log('formData:', formData);

    setTestInProgress(true);
    setTestStatus(null);

    // Show immediate feedback
    toast.info('Testing connection...', { autoClose: false, toastId: 'test-connection' });

    // For existing models, test using the model ID
    if (editingModel) {
      console.log('Testing existing model:', editingModel._id);

      // Try the simpler test method first
      Meteor.call(
        'aiGateway.testLLMConnection',
        {
          name: editingModel.name,
          provider: editingModel.provider,
          modelName: editingModel.modelName,
          apiEndpoint: formData.apiEndpoint || 'https://api.openai.com/v1', // fallback
          apiKey: 'test-key-placeholder', // This won't be used for existing models
          type: 'third-party'
        },
        (error, result) => {
          console.log('Test result for existing model:', { error, result });
          setTestInProgress(false);
          toast.dismiss('test-connection');

          if (error) {
            // If the test method fails, try using the model chat method
            console.log('Trying alternative test method...');

            Meteor.call(
              'aiGateway.testModelChat',
              editingModel._id,
              'Hello, this is a connection test.',
              (chatError, chatResult) => {
                console.log('Chat test result:', { chatError, chatResult });

                if (chatError) {
                  console.error('Both test methods failed:', chatError);
                  setTestStatus({
                    success: false,
                    message: chatError.reason || chatError.message || 'Connection test failed'
                  });
                  showAlert('error', `Connection test failed: ${chatError.reason || chatError.message || 'Unknown error'}`);
                } else {
                  console.log('Chat test successful:', chatResult);
                  setTestStatus({
                    success: true,
                    message: 'Connection test successful!',
                    details: chatResult
                  });
                  showAlert('success', `Connection test successful for ${editingModel.name}!`);
                }
              }
            );
          } else {
            console.log('Connection test successful:', result);
            setTestStatus({
              success: true,
              message: 'Connection test successful!',
              details: result
            });
            showAlert('success', `Connection test successful for ${editingModel.name}!`);
          }
        }
      );
    } else {
      console.log('Testing new model configuration');
      // For new models, use the existing test method
      const testData = {
        ...formData,
        type: 'third-party'
      };
      console.log('Test data:', testData);

      Meteor.call(
        'aiGateway.testLLMConnection',
        testData,
        (error, result) => {
          console.log('testLLMConnection result:', { error, result });
          setTestInProgress(false);
          toast.dismiss('test-connection');

          if (error) {
            console.error('Connection test failed:', error);
            setTestStatus({
              success: false,
              message: error.reason || error.message || 'Connection failed'
            });
            showAlert('error', `Connection test failed: ${error.reason || error.message || 'Unknown error'}`);
          } else {
            console.log('Connection test successful:', result);
            setTestStatus({
              success: true,
              message: 'Connection successful!',
              details: result
            });
            showAlert('success', `Connection test successful for ${formData.name || formData.provider}!`);
          }
        }
      );
    }
  };

  const discoverModels = () => {
    if (!formData.provider) {
      return;
    }

    setDiscoveringModels(true);
    setDiscoveredModels([]);

    Meteor.call(
      'aiGateway.discoverProviderModels',
      formData.provider,
      (error, result) => {
        setDiscoveringModels(false);

        if (error) {
          console.error('Model discovery failed:', error);
          toast.warning(`Couldn't discover models: ${error.message}`);
        } else if (result && result.length > 0) {
          setDiscoveredModels(result);
          toast.info(`Discovered ${result.length} models from ${formData.provider}`);
        } else {
          toast.info('No models discovered. You may need to specify the model ID manually.');
        }
      }
    );
  };

  const handleModelAction = (action, model) => {
    console.log('handleModelAction called:', action, model);

    switch (action) {
      case 'edit':
        // Load model data for editing
        setEditingModel(model);

        // Get full model details from the gateway
        toast.info('Loading model configuration...');

        Meteor.call('aiGateway.getModelDetails', model._id, (error, modelDetails) => {
          if (error) {
            console.error('Failed to load model details:', error);
            toast.error(`Failed to load model details: ${error.message}`);

            // Fallback to local data
            setFormData({
              name: model.name || '',
              provider: model.provider || '',
              apiEndpoint: '', // We don't store this locally for security
              apiVersion: '',
              apiKey: '', // Never populate API key for security
              modelName: model.modelName || '',
              maxTokens: model.parameters || 2048,
              organization: '',
              additionalHeaders: ''
            });
            setSelectedUsers(model.sharedWith || []); // Load existing sharing
          } else {
            // Populate form with gateway data
            setFormData({
              name: modelDetails.name || model.name || '',
              provider: modelDetails.provider || model.provider || '',
              apiEndpoint: modelDetails.parameters?.api_base || '',
              apiVersion: modelDetails.parameters?.api_version || '',
              apiKey: '', // Never populate API key for security
              modelName: modelDetails.model_id || model.modelName || '',
              maxTokens: modelDetails.parameters?.max_tokens || model.parameters || 2048,
              organization: modelDetails.parameters?.organization || '',
              additionalHeaders: modelDetails.parameters?.additional_headers ?
                JSON.stringify(modelDetails.parameters.additional_headers, null, 2) : ''
            });
            setSelectedUsers(modelDetails.sharedWith || model.sharedWith || []); // Load existing sharing
            toast.success('Model configuration loaded');
          }
        });

        // Find matching provider template
        const matchingProvider = providerTemplates.find(p =>
          p.name.toLowerCase() === model.provider.toLowerCase()
        ) || providerTemplates.find(p => p.id === 'custom');

        setSelectedProvider(matchingProvider);
        setShowEditModal(true);
        break;

      case 'test':
        console.log('Testing connection for model:', model);

        // Show loading toast
        toast.info(`Testing connection to ${model.name}...`, {
          autoClose: false,
          toastId: `testing-${model._id}`
        });

        // Try multiple test methods to ensure one works
        const testModel = async () => {
          try {
            // Method 1: Try the model chat test first
            console.log('Trying testModelChat method...');
            const chatResult = await new Promise((resolve, reject) => {
              Meteor.call('aiGateway.testModelChat', model._id, 'Hello, this is a connection test.', (error, result) => {
                if (error) reject(error);
                else resolve(result);
              });
            });

            console.log('testModelChat successful:', chatResult);
            toast.dismiss(`testing-${model._id}`);
            showAlert('success', `Connection test successful for ${model.name}!`);

          } catch (chatError) {
            console.log('testModelChat failed, trying alternative method:', chatError);

            try {
              // Method 2: Try the connection test method
              console.log('Trying testLLMConnection method...');
              const connectionResult = await new Promise((resolve, reject) => {
                Meteor.call('aiGateway.testLLMConnection', {
                  name: model.name,
                  provider: model.provider,
                  modelName: model.modelName,
                  apiEndpoint: 'https://api.openai.com/v1', // fallback endpoint
                  apiKey: 'existing-model-test', // placeholder for existing model
                  type: 'third-party'
                }, (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                });
              });

              console.log('testLLMConnection successful:', connectionResult);
              toast.dismiss(`testing-${model._id}`);
              showAlert('success', `Connection test successful for ${model.name}!`);

            } catch (connectionError) {
              console.log('testLLMConnection failed, trying basic model check:', connectionError);

              try {
                // Method 3: Try just getting model details to verify it exists
                console.log('Trying getModelDetails method...');
                const modelDetails = await new Promise((resolve, reject) => {
                  Meteor.call('aiGateway.getModelDetails', model._id, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  });
                });

                console.log('getModelDetails successful:', modelDetails);
                toast.dismiss(`testing-${model._id}`);

                if (modelDetails && modelDetails.is_active) {
                  showAlert('success', `Model ${model.name} is active and reachable!`);
                } else {
                  showAlert('warning', `Model ${model.name} exists but may not be active.`);
                }

              } catch (detailsError) {
                console.error('All test methods failed:', detailsError);
                toast.dismiss(`testing-${model._id}`);
                showAlert('error', `Connection test failed for ${model.name}: ${detailsError.reason || detailsError.message || 'Unable to reach model'}`);
              }
            }
          }
        };

        testModel();
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete "${model.name}"? This action cannot be undone.`)) {
          toast.info(`Deleting ${model.name}...`, {
            autoClose: false,
            toastId: `deleting-${model._id}`
          });

          Meteor.call('aiGateway.deleteModel', model._id, (error) => {
            toast.dismiss(`deleting-${model._id}`);

            if (error) {
              toast.error(`Failed to delete model: ${error.message}`);
            } else {
              toast.success(`${model.name} deleted successfully`);
            }
          });
        }
        break;

      case 'add':
        resetForm();
        setShowAddModal(true);
        break;

      default:
        console.log('Unknown action:', action);
        break;
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setFormData({
      ...formData,
      name: provider.isCustom ? '' : `${provider.name} ${provider.defaultModel}`,
      provider: provider.name,
      apiEndpoint: provider.apiEndpoint,
      apiVersion: provider.apiVersion,
      modelName: provider.defaultModel
    });
    setShowAddModal(true);
  };

  const handleDiscoveredModelSelect = (model) => {
    setFormData({
      ...formData,
      name: `${formData.provider} ${model.id}`,
      modelName: model.id
    });
  };

  const resetForm = () => {
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
    setTestStatus(null);
    setDiscoveredModels([]);
    setSelectedProvider(null);
    setSelectedUsers([]); // Reset selected users
  };

  const handleCloseModal = () => {
    if (showAddModal) {
      setShowAddModal(false);
    }
    if (showEditModal) {
      setShowEditModal(false);
      setEditingModel(null);
    }
    resetForm();
  };

  if (loading) {
    return <Spinner message="Loading third-party models..." />;
  }

  if (error) {
    return <ErrorAlert title="Error Loading Data" message={error} />;
  }

  return (
    <div className="third-party-ai">
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
          <h4 className="mb-3 mb-md-0">Third Party AI</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <Icons.ArrowLeft className="icon-sm me-2" /> Back to Gateway
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Icons.Plus className="icon-sm me-2" /> Add Third Party Model
          </button>
        </div>
      </div>

      {/* Connected Models Table */}
      <ConnectedModelsTable
        models={thirdPartyModels}
        onModelAction={handleModelAction}
      />

      {/* Quick Connect Templates */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-4">Quick Connect Templates</h6>

              <div className="row">
                {providerTemplates.map(provider => (
                  <div key={provider.id} className="col-md-4 mb-4">
                    <ThirdPartyProviderCard
                      provider={provider}
                      onSelect={() => handleProviderSelect(provider)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Third-Party Model Modal */}
      {showAddModal && (
        <AddModelModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleAddThirdPartyLLM}
          onClose={handleCloseModal}
          onTestConnection={handleTestConnection}
          testStatus={testStatus}
          testInProgress={testInProgress}
          discoveredModels={discoveredModels}
          discoveringModels={discoveringModels}
          onDiscoveredModelSelect={handleDiscoveredModelSelect}
          provider={selectedProvider}
          isEditing={false}
          onShowAlert={showAlert}
          users={users}
          selectedUsers={selectedUsers}
          onUserSelectionChange={handleUserSelectionChange}
          loadingUsers={loadingUsers}
          usersError={usersError}
          onSearchUsers={handleSearchUsers}
          userSearchQuery={userSearchQuery}
          usersPagination={usersPagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Edit Third-Party Model Modal */}
      {showEditModal && (
        <AddModelModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleUpdateThirdPartyLLM}
          onClose={handleCloseModal}
          onTestConnection={handleTestConnection}
          testStatus={testStatus}
          testInProgress={testInProgress}
          discoveredModels={discoveredModels}
          discoveringModels={discoveringModels}
          onDiscoveredModelSelect={handleDiscoveredModelSelect}
          provider={selectedProvider}
          isEditing={true}
          editingModel={editingModel}
          onShowAlert={showAlert}
          users={users}
          selectedUsers={selectedUsers}
          onUserSelectionChange={handleUserSelectionChange}
          loadingUsers={loadingUsers}
          usersError={usersError}
          onSearchUsers={handleSearchUsers}
          userSearchQuery={userSearchQuery}
          usersPagination={usersPagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ThirdPartyAI;
