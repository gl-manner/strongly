import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Link, useHistory } from 'react-router-dom';
import feather from 'feather-icons';
import { toast } from 'react-toastify';
import './ThirdPartyAI.scss';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
// Some components are missing. will add this later
// import LoadingSpinner from '/imports/ui/components/LoadingSpinner';
// import ErrorAlert from '/imports/ui/components/ErrorAlert';
// import ThirdPartyProviderCard from './components/ThirdPartyProviderCard';
// import ConnectedModelsTable from './components/ConnectedModelsTable';
// import AddModelModal from './components/AddModelModal';

// Predefined templates for major LLM providers
const providerTemplates = [
  {
    id: 'openai',
    name: 'OpenAI',
    logoUrl: '/images/openai-logo.svg',
    description: 'Connect to OpenAI\'s GPT models including GPT-4 and GPT-3.5 Turbo',
    apiEndpoint: 'https://api.openai.com/v1',
    apiVersion: 'v1',
    defaultModel: 'gpt-4o',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logoUrl: '/images/anthropic-logo.svg',
    description: 'Connect to Anthropic\'s Claude models including Claude 3 Opus and Sonnet',
    apiEndpoint: 'https://api.anthropic.com',
    apiVersion: 'v1',
    defaultModel: 'claude-3-opus-20240229',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logoUrl: '/images/mistral-logo.svg',
    description: 'Connect to Mistral AI\'s models including Mistral Large and Small',
    apiEndpoint: 'https://api.mistral.ai/v1',
    apiVersion: 'v1',
    defaultModel: 'mistral-large-latest',
  },
  {
    id: 'google',
    name: 'Google AI',
    logoUrl: '/images/google-logo.svg',
    description: 'Connect to Google\'s Gemini models',
    apiEndpoint: 'https://generativelanguage.googleapis.com',
    apiVersion: 'v1',
    defaultModel: 'gemini-1.5-pro',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    logoUrl: '/images/cohere-logo.svg',
    description: 'Connect to Cohere\'s Command and Embed models',
    apiEndpoint: 'https://api.cohere.ai/v1',
    apiVersion: 'v1',
    defaultModel: 'command',
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    logoUrl: '/images/api-logo.svg',
    description: 'Connect to any other LLM provider with a compatible API',
    apiEndpoint: '',
    apiVersion: '',
    defaultModel: '',
    isCustom: true,
  }
];

export const ThirdPartyAI = () => {
  const history = useHistory();
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Initialize feather icons when component mounts or updates
  useEffect(() => {
    feather.replace();
  }, [loading, thirdPartyModels, showAddModal]);

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

    Meteor.call(
      'aiGateway.addThirdPartyLLM',
      {
        ...formData,
        type: 'third-party'
      },
      (error, result) => {
        // Dismiss loading toast
        toast.dismiss('adding-model');

        if (error) {
          console.error('Error adding third-party LLM:', error);
          toast.error(`Failed to add model: ${error.message}`);
        } else {
          console.log('Third-party LLM added:', result);
          toast.success(`${formData.name} added successfully!`);
          setShowAddModal(false);
          resetForm();
        }
      }
    );
  };

  const handleTestConnection = () => {
    setTestInProgress(true);
    setTestStatus(null);

    Meteor.call(
      'aiGateway.testLLMConnection',
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
          toast.error(`Connection test failed: ${error.message}`);
        } else {
          console.log('Connection test successful:', result);
          setTestStatus({
            success: true,
            message: 'Connection successful!',
            details: result
          });
          toast.success('Connection test successful!');

          // If connection is successful, try to discover available models
          discoverModels();
        }
      }
    );
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
    switch (action) {
      case 'edit':
        history.push(`/operations/ai-gateway/third-party/edit/${model._id}`);
        break;

      case 'test':
        toast.info(`Testing connection to ${model.name}...`);
        Meteor.call('aiGateway.testLLMConnection', {
          provider: model.provider,
          apiKey: model.apiKey, // this would come from the stored model
          modelName: model.modelName,
          apiEndpoint: model.apiEndpoint,
        }, (error, result) => {
          if (error) {
            toast.error(`Connection test failed: ${error.message}`);
          } else {
            toast.success('Connection test successful!');
          }
        });
        break;

      case 'delete':
        if (confirm(`Are you sure you want to delete "${model.name}"? This action cannot be undone.`)) {
          toast.info(`Deleting ${model.name}...`);
          Meteor.call('aiGateway.deleteModel', model._id, (error) => {
            if (error) {
              toast.error(`Failed to delete model: ${error.message}`);
            } else {
              toast.success(`${model.name} deleted successfully`);
            }
          });
        }
        break;

      default:
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
  };

  if (loading) {
    // return <LoadingSpinner message="Loading third-party models..." />;
  }

  if (error) {
    // return <ErrorAlert title="Error Loading Data" message={error} />;
  }

  return (
    <div className="third-party-ai">
      <div className="d-flex justify-content-between align-items-center flex-wrap grid-margin">
        <div>
          <h4 className="mb-3 mb-md-0">Third Party AI</h4>
        </div>
        <div>
          <Link to="/operations/ai-gateway" className="btn btn-outline-primary me-2">
            <i data-feather="arrow-left" className="icon-sm me-2"></i> Back to Gateway
          </Link>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i data-feather="plus" className="icon-sm me-2"></i> Add Third Party Model
          </button>
        </div>
      </div>

      {/* Connected Models Table */}
      {/* <ConnectedModelsTable
        models={thirdPartyModels}
        onModelAction={handleModelAction}
      /> */}

      {/* Quick Connect Templates */}
      <div className="row">
        <div className="col-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-4">Quick Connect Templates</h6>

              <div className="row">
                {providerTemplates.map(provider => (
                  <div key={provider.id} className="col-md-4 mb-4">
                    {/* <ThirdPartyProviderCard
                      provider={provider}
                      onSelect={() => handleProviderSelect(provider)}
                    /> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Third-Party Model Modal */}
      {/* {showAddModal && (
        <AddModelModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleAddThirdPartyLLM}
          onClose={() => setShowAddModal(false)}
          onTestConnection={handleTestConnection}
          testStatus={testStatus}
          testInProgress={testInProgress}
          discoveredModels={discoveredModels}
          discoveringModels={discoveringModels}
          onDiscoveredModelSelect={handleDiscoveredModelSelect}
          provider={selectedProvider}
        />
      )} */}
    </div>
  );
};

export default ThirdPartyAI;
