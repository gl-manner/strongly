import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import { OpenSourceLLMsCollection } from '/imports/api/ai-gateway/OpenSourceLLMsCollection';

// Get the AI Gateway URL from settings
const getGatewayUrl = () => {
  const settings = Meteor.settings;
  if (!settings || !settings['strongly-ai-backend'] || !settings['strongly-ai-backend']['ai-gateway']) {
    throw new Meteor.Error('gateway-url-not-found', 'AI Gateway URL not found in settings');
  }
  return settings['strongly-ai-backend']['ai-gateway'];
};

// Helper function to make authenticated HTTP requests to the gateway
const gatewayRequest = (method, endpoint, data = null, params = {}) => {
  const user = Meteor.user();
  if (!user) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to perform this action');
  }

  const gatewayUrl = getGatewayUrl();
  const url = `${gatewayUrl}${endpoint}`;

  // Get the user's API token or generate one
  const apiKey = user.services?.aigateway?.apiKey;

  if (!apiKey) {
    throw new Meteor.Error('no-api-key', 'No API key available for this user');
  }

  const options = {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    params
  };

  if (data) {
    options.data = data;
  }

  try {
    return HTTP.call(method, url, options);
  } catch (error) {
    console.error(`Error in gateway request to ${endpoint}:`, error);
    throw new Meteor.Error(
      'gateway-request-failed',
      error.response?.data?.detail || error.message || 'Gateway request failed'
    );
  }
};

Meteor.methods({
  // ---- Model Management Methods ----

  'aiGateway.listModels'(filters = {}) {
    check(filters, {
      provider: Match.Maybe(String),
      type: Match.Maybe(String),
      capability: Match.Maybe(String),
      activeOnly: Match.Maybe(Boolean),
      tags: Match.Maybe([String]),
      skip: Match.Maybe(Number),
      limit: Match.Maybe(Number)
    });

    this.unblock();

    try {
      const response = gatewayRequest('GET', 'models', null, filters);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('list-models-failed', error.message);
    }
  },

  'aiGateway.getModelDetails'(modelId) {
    check(modelId, String);
    this.unblock();

    try {
      const response = gatewayRequest('GET', `models/${modelId}`);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('get-model-failed', error.message);
    }
  },

  'aiGateway.createModel'(modelData) {
    check(modelData, Object);
    this.unblock();

    try {
      const response = gatewayRequest('POST', 'models', modelData);

      // After successful creation in the gateway, add to local collection
      const localModel = {
        _id: response.data.id,
        name: response.data.name,
        type: modelData.provider === 'kubernetes' ? 'self-hosted' : 'third-party',
        provider: response.data.provider,
        modelId: response.data.model_id,
        status: response.data.active ? 'active' : 'inactive',
        parameters: response.data.parameters?.max_tokens || 2048,
        capabilities: response.data.capabilities || [],
        createdAt: new Date(),
        owner: Meteor.userId()
      };

      LLMsCollection.insert(localModel);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('create-model-failed', error.message);
    }
  },

  'aiGateway.updateModel'(modelId, updateData) {
    check(modelId, String);
    check(updateData, Object);
    this.unblock();

    try {
      const response = gatewayRequest('PUT', `models/${modelId}`, updateData);

      // Update local collection as well
      LLMsCollection.update({ _id: modelId }, {
        $set: {
          name: updateData.name || undefined,
          status: updateData.active ? 'active' : 'inactive',
          parameters: updateData.parameters?.max_tokens || undefined,
          updatedAt: new Date()
        }
      });

      return response.data;
    } catch (error) {
      throw new Meteor.Error('update-model-failed', error.message);
    }
  },

  'aiGateway.deleteModel'(modelId) {
    check(modelId, String);
    this.unblock();

    try {
      gatewayRequest('DELETE', `models/${modelId}`);

      // Remove from local collection as well
      LLMsCollection.remove({ _id: modelId });

      return true;
    } catch (error) {
      throw new Meteor.Error('delete-model-failed', error.message);
    }
  },

  // ---- Self-Hosted LLM Methods ----

  'aiGateway.listSelfHostedModels'() {
    this.unblock();

    try {
      const response = gatewayRequest('GET', 'models/kubernetes');
      return response.data;
    } catch (error) {
      throw new Meteor.Error('list-k8s-models-failed', error.message);
    }
  },

  'aiGateway.deployModel'(modelConfig) {
    check(modelConfig, {
      modelId: String,
      modelName: String,
      modelSource: String,
      modelUrl: String,
      hardwareTier: String,
      replicas: Number,
      maxTokens: Number,
      allowedUsers: String,
      customParameters: Match.Maybe(String)
    });

    this.unblock();

    // First, create a placeholder in our local collection
    const deploymentId = LLMsCollection.insert({
      name: modelConfig.modelName,
      type: 'self-hosted',
      provider: 'kubernetes',
      status: 'deploying',
      parameters: modelConfig.maxTokens,
      hardwareTier: modelConfig.hardwareTier,
      createdAt: new Date(),
      owner: Meteor.userId()
    });

    // Now prepare data for the gateway
    const gatewayModelData = {
      name: modelConfig.modelName,
      provider: "kubernetes",
      model_id: modelConfig.modelUrl,
      model_type: "CHAT",
      capabilities: ["CHAT", "COMPLETION"],
      parameters: {
        max_tokens: modelConfig.maxTokens,
        hardware_tier: modelConfig.hardwareTier,
        replicas: modelConfig.replicas
      },
      description: `Self-hosted model deployed from ${modelConfig.modelSource}`,
      custom_deployment: JSON.parse(modelConfig.customParameters || '{}')
    };

    try {
      // Call the gateway to start the deployment
      const response = gatewayRequest('POST', 'models', gatewayModelData);

      // Update the local record with the gateway ID
      LLMsCollection.update({ _id: deploymentId }, {
        $set: {
          gatewayId: response.data.id,
          // Don't change status yet - it's still deploying
        }
      });

      return {
        deploymentId,
        gatewayId: response.data.id
      };
    } catch (error) {
      // If gateway deployment fails, update the status
      LLMsCollection.update({ _id: deploymentId }, {
        $set: {
          status: 'failed',
          error: error.message
        }
      });
      throw new Meteor.Error('deploy-model-failed', error.message);
    }
  },

  'aiGateway.checkDeploymentStatus'(deploymentId) {
    check(deploymentId, String);
    this.unblock();

    const deployment = LLMsCollection.findOne(deploymentId);
    if (!deployment) {
      throw new Meteor.Error('not-found', 'Deployment not found');
    }

    if (!deployment.gatewayId) {
      throw new Meteor.Error('no-gateway-id', 'No gateway ID for this deployment');
    }

    try {
      const response = gatewayRequest('GET', `models/${deployment.gatewayId}`);

      // Update local status based on gateway response
      const newStatus = response.data.active ? 'active' : 'inactive';

      LLMsCollection.update({ _id: deploymentId }, {
        $set: {
          status: newStatus,
          lastChecked: new Date()
        }
      });

      return {
        status: newStatus,
        details: response.data
      };
    } catch (error) {
      // If error is 404, the model might have been deleted
      if (error.error === 'get-model-failed' && error.reason?.includes('404')) {
        LLMsCollection.update({ _id: deploymentId }, {
          $set: {
            status: 'deleted',
            lastChecked: new Date()
          }
        });
        return { status: 'deleted' };
      }

      throw new Meteor.Error('check-status-failed', error.message);
    }
  },

  // ---- Third-Party LLM Methods ----

  'aiGateway.addThirdPartyLLM'(providerConfig) {
    check(providerConfig, {
      name: String,
      provider: String,
      apiEndpoint: String,
      apiVersion: Match.Maybe(String),
      apiKey: String,
      modelName: String,
      maxTokens: Match.Maybe(Number),
      organization: Match.Maybe(String),
      additionalHeaders: Match.Maybe(String)
    });

    this.unblock();

    // Prepare data for the gateway
    const gatewayModelData = {
      name: providerConfig.name,
      provider: providerConfig.provider.toUpperCase().replace(/\s+/g, '_'),
      model_id: providerConfig.modelName,
      model_type: "CHAT",
      capabilities: ["CHAT", "COMPLETION"],
      api_key: providerConfig.apiKey,
      parameters: {
        max_tokens: providerConfig.maxTokens || 2048,
        api_base: providerConfig.apiEndpoint,
        api_version: providerConfig.apiVersion || '',
        organization: providerConfig.organization || ''
      }
    };

    // Parse additional headers if provided
    if (providerConfig.additionalHeaders) {
      try {
        gatewayModelData.parameters.additional_headers = JSON.parse(providerConfig.additionalHeaders);
      } catch (e) {
        throw new Meteor.Error('invalid-headers', 'Additional headers must be valid JSON');
      }
    }

    try {
      // Create the model in the gateway
      const response = gatewayRequest('POST', 'models', gatewayModelData);

      // Add to local collection
      const localModel = {
        _id: response.data.id,
        name: providerConfig.name,
        type: 'third-party',
        provider: providerConfig.provider,
        modelName: providerConfig.modelName,
        status: 'active',
        parameters: providerConfig.maxTokens || 2048,
        createdAt: new Date(),
        owner: Meteor.userId()
      };

      LLMsCollection.insert(localModel);

      return response.data;
    } catch (error) {
      throw new Meteor.Error('add-third-party-failed', error.message);
    }
  },

  'aiGateway.testLLMConnection'(providerConfig) {
    check(providerConfig, Object);
    this.unblock();

    // Format for test request
    const testData = {
      provider: providerConfig.provider.toUpperCase().replace(/\s+/g, '_'),
      api_key: providerConfig.apiKey,
      model: providerConfig.modelName,
      api_base: providerConfig.apiEndpoint,
      api_version: providerConfig.apiVersion || '',
      organization: providerConfig.organization || '',
      additional_headers: {}
    };

    // Parse additional headers if provided
    if (providerConfig.additionalHeaders) {
      try {
        testData.additional_headers = JSON.parse(providerConfig.additionalHeaders);
      } catch (e) {
        throw new Meteor.Error('invalid-headers', 'Additional headers must be valid JSON');
      }
    }

    try {
      const response = gatewayRequest('POST', 'models/test', testData);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('test-connection-failed', error.message);
    }
  },

  // ---- Hugging Face Methods ----

  'aiGateway.searchHuggingFaceModels'(query) {
    check(query, String);
    this.unblock();

    try {
      const response = gatewayRequest('GET', 'providers/huggingface/search', null, { query });
      return response.data.models;
    } catch (error) {
      throw new Meteor.Error('search-hf-failed', error.message);
    }
  },

  // ---- Model Discovery Methods ----

  'aiGateway.discoverProviderModels'(provider) {
    check(provider, String);
    this.unblock();

    try {
      const response = gatewayRequest('GET', `providers/${provider}/models`);
      return response.data.models;
    } catch (error) {
      throw new Meteor.Error('discover-models-failed', error.message);
    }
  },

  'aiGateway.registerProviderModel'(provider, modelId, name) {
    check(provider, String);
    check(modelId, String);
    check(name, Match.Maybe(String));
    this.unblock();

    try {
      const response = gatewayRequest('POST', `providers/${provider}/register`, null, {
        model_id: modelId,
        name: name || modelId
      });

      // Add to local collection
      const localModel = {
        _id: response.data.id,
        name: name || modelId,
        type: 'third-party',
        provider: provider,
        modelName: modelId,
        status: 'active',
        parameters: response.data.parameters?.max_tokens || 2048,
        capabilities: response.data.capabilities || [],
        createdAt: new Date(),
        owner: Meteor.userId()
      };

      LLMsCollection.insert(localModel);

      return response.data;
    } catch (error) {
      throw new Meteor.Error('register-model-failed', error.message);
    }
  }
});

// Function to initialize the OpenSourceLLMs collection with some default models
export const initializeOpenSourceModels = () => {
  if (OpenSourceLLMsCollection.find().count() === 0) {
    const defaultModels = [
      {
        name: 'Llama 3 8B',
        organization: 'Meta AI',
        description: 'Meta\'s Llama 3 8B model, optimized for chat and general tasks.',
        parameters: '8B',
        tags: ['chat', 'general', 'instruction-following'],
        repoUrl: 'meta-llama/Meta-Llama-3-8B',
        license: 'Meta AI LLAMA 3 COMMUNITY LICENSE',
        framework: 'pytorch',
      },
      {
        name: 'Mistral 7B',
        organization: 'Mistral AI',
        description: 'Mistral 7B is a powerful and efficient language model with impressive capabilities.',
        parameters: '7B',
        tags: ['chat', 'general', 'instruction-following'],
        repoUrl: 'mistralai/Mistral-7B-v0.1',
        license: 'Apache 2.0',
        framework: 'pytorch',
      },
      {
        name: 'Phi-2',
        organization: 'Microsoft',
        description: 'Phi-2 is a 2.7B parameter language model with impressive reasoning capabilities.',
        parameters: '2.7B',
        tags: ['reasoning', 'compact', 'instruction-following'],
        repoUrl: 'microsoft/phi-2',
        license: 'Microsoft Research License',
        framework: 'pytorch',
      },
      {
        name: 'CodeLlama 7B',
        organization: 'Meta AI',
        description: 'CodeLlama is specialized for code generation and understanding.',
        parameters: '7B',
        tags: ['code', 'programming', 'instruction-following'],
        repoUrl: 'codellama/CodeLlama-7b-hf',
        license: 'Meta AI Code Llama License',
        framework: 'pytorch',
      },
      {
        name: 'Falcon 7B',
        organization: 'TII',
        description: 'Falcon is a foundation model trained on a mixture of curated corpora.',
        parameters: '7B',
        tags: ['general', 'instruction-following'],
        repoUrl: 'tiiuae/falcon-7b',
        license: 'TII Falcon License',
        framework: 'pytorch',
      },
      {
        name: 'MPT 7B',
        organization: 'MosaicML',
        description: 'MPT-7B is an open-source language model trained on 1T tokens of text.',
        parameters: '7B',
        tags: ['general', 'instruction-following'],
        repoUrl: 'mosaicml/mpt-7b',
        license: 'Apache 2.0',
        framework: 'pytorch',
      }
    ];

    defaultModels.forEach(model => {
      OpenSourceLLMsCollection.insert({
        ...model,
        createdAt: new Date()
      });
    });
  }
};
