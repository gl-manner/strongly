import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { LLMsCollection } from '/imports/api/ai-gateway/LLMsCollection';
import { OpenSourceLLMsCollection } from '/imports/api/ai-gateway/OpenSourceLLMsCollection';
import { ProviderApiKeysCollection } from '/imports/api/ai-gateway/ProviderApiKeysCollection';

// Helper functions for provider defaults
const getDefaultModelForProvider = (provider) => {
  const defaults = {
    'openai': 'gpt-3.5-turbo',
    'anthropic': 'claude-3-haiku-20240307',
    'mistral': 'mistral-tiny',
    'google': 'gemini-pro',
    'cohere': 'command-light'
  };
  return defaults[provider.toLowerCase()] || 'test-model';
};

const getDefaultEndpointForProvider = (provider) => {
  const endpoints = {
    'openai': 'https://api.openai.com/v1',
    'anthropic': 'https://api.anthropic.com',
    'mistral': 'https://api.mistral.ai/v1',
    'google': 'https://generativelanguage.googleapis.com/v1',
    'cohere': 'https://api.cohere.ai/v1'
  };
  return endpoints[provider.toLowerCase()] || 'https://api.example.com/v1';
};

// Get the AI Gateway URL from settings
const getGatewayUrl = () => {
  const settings = Meteor.settings;
  if (!settings || !settings['strongly-ai-backend'] || !settings['strongly-ai-backend']['ai-gateway']) {
    throw new Meteor.Error('gateway-url-not-found', 'AI Gateway URL not found in settings');
  }
  return settings['strongly-ai-backend']['ai-gateway'];
};

// Helper function to make authenticated HTTP requests to the gateway
const gatewayRequest = async (method, endpoint, data = null, params = {}) => {
  const user = await Meteor.userAsync();
  if (!user) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to perform this action');
  }

  const gatewayUrl = getGatewayUrl();

  // The backend routes are already prefixed with /api/v1, so don't add it again
  const url = `${gatewayUrl}/${endpoint}`.replace(/\/+/g, '/').replace(':/', '://');

  // Get the user's API token
  const apiKey = user.services?.aigateway?.apiKey;

  if (!apiKey) {
    throw new Meteor.Error('no-api-key', 'No API key available for this user');
  }

  const options = {
    headers: {
      // Use X-API-Key header as expected by the backend auth middleware
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    },
    params,
    timeout: 30000 // 30 second timeout
  };

  if (data) {
    options.data = data;
  }

  try {
    return HTTP.call(method, url, options);
  } catch (error) {
    console.error(`Error in gateway request to ${endpoint}:`, error);

    // Better error handling to match backend error format
    let errorMessage = error.message;
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.content) {
      try {
        const content = JSON.parse(error.response.content);
        if (content.detail) {
          errorMessage = content.detail;
        } else if (content.error?.message) {
          errorMessage = content.error.message;
        }
      } catch (parseError) {
        // Content is not JSON, use as is
        errorMessage = error.response.content;
      }
    }

    throw new Meteor.Error(
      'gateway-request-failed',
      errorMessage
    );
  }
};

// Helper function to make unauthenticated requests (for registration)
const gatewayPublicRequest = async (method, endpoint, data = null, params = {}) => {
  const gatewayUrl = getGatewayUrl();
  const url = `${gatewayUrl}/${endpoint}`.replace(/\/+/g, '/').replace(':/', '://');

  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    params,
    timeout: 30000
  };

  if (data) {
    options.data = data;
  }

  try {
    return HTTP.call(method, url, options);
  } catch (error) {
    console.error(`Error in public gateway request to ${endpoint}:`, error);

    let errorMessage = error.message;
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.response?.content) {
      try {
        const content = JSON.parse(error.response.content);
        if (content.detail) {
          errorMessage = content.detail;
        } else if (content.error?.message) {
          errorMessage = content.error.message;
        }
      } catch (parseError) {
        errorMessage = error.response.content;
      }
    }

    throw new Meteor.Error(
      'gateway-public-request-failed',
      errorMessage
    );
  }
};

Meteor.methods({
  // ---- Gateway API Key Management ----

  async 'aiGateway.ensureGatewayApiKey'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const user = await Meteor.users.findOneAsync(this.userId);

    // Remove any existing mock keys
    if (user.services?.aigateway?.isMock) {
      console.log('Removing mock API key...');
      await Meteor.users.updateAsync(this.userId, {
        $unset: {
          'services.aigateway': 1
        }
      });
    }

    // If user has a real API key, verify it works with actual API call
    if (user.services?.aigateway?.apiKey && !user.services?.aigateway?.isMock) {
      try {
        console.log('Testing existing API key with real API call...');
        // Test with an actual authenticated endpoint that requires a valid key
        const response = await gatewayRequest('GET', 'api/v1/auth/keys');
        if (response.statusCode === 200) {
          console.log('Existing API key is valid');
          return {
            success: true,
            hasKey: true,
            message: 'Gateway API key already exists and is valid'
          };
        }
      } catch (error) {
        console.warn('Existing API key is invalid, removing it:', error.message);
        // Remove invalid key
        await Meteor.users.updateAsync(this.userId, {
          $unset: {
            'services.aigateway': 1
          }
        });
      }
    }

    // Try to create a new API key via registration endpoint
    try {
      console.log('Attempting to create new API key via registration endpoint...');

      const response = await gatewayPublicRequest('POST', 'api/v1/auth/ensure-key', {
        user_id: this.userId,
        name: `Strongly.AI User ${user.profile?.name || user.username || user._id}`,
        description: 'Auto-generated key for Strongly.AI user access to AI Gateway',
        expires_days: null,
        allowed_models: [],
        allowed_ips: []
      });

      console.log('Registration response:', response.statusCode, response.data);

      if (response.data && response.data.key && response.data.key !== '***existing***') {
        // New key was created, store it
        await Meteor.users.updateAsync(this.userId, {
          $set: {
            'services.aigateway.apiKey': response.data.key,
            'services.aigateway.keyId': response.data.id,
            'services.aigateway.createdAt': new Date(),
            'services.aigateway.name': response.data.name,
            'services.aigateway.isReal': true // Mark as real API key
          }
        });

        // Verify the new key works with a real API call
        try {
          const testResponse = await gatewayRequest('GET', 'api/v1/auth/keys');
          console.log('New API key verified with real API call');
        } catch (testError) {
          console.error('New API key verification failed:', testError.message);
          // Remove the non-working key
          await Meteor.users.updateAsync(this.userId, {
            $unset: {
              'services.aigateway': 1
            }
          });
          throw new Error('Created API key is not working: ' + testError.message);
        }

        return {
          success: true,
          hasKey: true,
          message: 'Gateway API key created successfully',
          keyId: response.data.id,
          isNew: true
        };
      } else if (response.data && response.data.key === '***existing***') {
        // User already had a key, but we don't have it locally
        throw new Error('User has an existing API key in the gateway but we need the actual key value. Please contact administrator or create a new key.');
      } else {
        throw new Error('Invalid response from gateway API key creation');
      }
    } catch (error) {
      console.error('Failed to ensure gateway API key:', error);

      // Check specific error types
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw new Meteor.Error('registration-endpoint-missing',
          'AI Gateway registration endpoint not found. Please ensure the AI Gateway backend has been updated with the registration endpoints and is running.'
        );
      }

      if (error.message.includes('Too many registration attempts')) {
        throw new Meteor.Error('rate-limited', 'Too many registration attempts. Please wait 5 minutes and try again.');
      }

      if (error.message.includes('already has an active API key') || error.message.includes('409')) {
        throw new Meteor.Error('user-has-key',
          'User already has an API key in the gateway. Please contact administrator for assistance or manually set your API key.'
        );
      }

      // For connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        throw new Meteor.Error('gateway-unreachable',
          'Cannot connect to AI Gateway. Please ensure the AI Gateway is running and accessible.'
        );
      }

      throw new Meteor.Error('create-gateway-key-failed', `Failed to create API key: ${error.message}`);
    }
  },

  async 'aiGateway.clearInvalidApiKey'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    console.log('Clearing invalid/mock API key...');
    await Meteor.users.updateAsync(this.userId, {
      $unset: {
        'services.aigateway': 1
      }
    });

    return {
      success: true,
      message: 'Invalid API key cleared. Please call ensureGatewayApiKey to create a new one.'
    };
  },

  async 'aiGateway.refreshApiKey'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Force refresh of API key by removing current one and creating new
    await Meteor.users.updateAsync(this.userId, {
      $unset: {
        'services.aigateway.apiKey': 1
      }
    });

    // Now ensure a new key is created
    return await Meteor.callAsync('aiGateway.ensureGatewayApiKey');
  },

  async 'aiGateway.getApiKeyInfo'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    const aigatewayInfo = user.services?.aigateway;

    if (!aigatewayInfo?.apiKey) {
      return {
        hasKey: false,
        message: 'No API key found'
      };
    }

    // Check for mock keys
    if (aigatewayInfo.isMock) {
      return {
        hasKey: false,
        isMock: true,
        message: 'Found mock API key - this needs to be replaced with a real key'
      };
    }

    try {
      // Get API key details from gateway with real API call
      const response = await gatewayRequest('GET', 'api/v1/auth/keys');

      if (response.data && response.data.length > 0) {
        const keyInfo = response.data[0];

        return {
          hasKey: true,
          keyId: keyInfo.id,
          name: keyInfo.name,
          createdAt: keyInfo.created_at,
          lastUsedAt: keyInfo.last_used_at,
          isActive: keyInfo.is_active,
          allowedModels: keyInfo.allowed_models,
          allowedIps: keyInfo.allowed_ips,
          isReal: true
        };
      } else {
        return {
          hasKey: false,
          message: 'API key not found in gateway'
        };
      }
    } catch (error) {
      return {
        hasKey: false,
        error: error.message,
        message: 'API key appears to be invalid',
        localInfo: {
          keyId: aigatewayInfo.keyId,
          createdAt: aigatewayInfo.createdAt,
          isManual: aigatewayInfo.isManual || false
        }
      };
    }
  },

  // ---- Provider API Keys Management ----

  async 'providerApiKeys.create'(apiKeyData) {
    check(apiKeyData, {
      name: String,
      provider: String,
      apiKey: String,
      description: Match.Optional(String),
      organization: Match.Optional(String),
      additionalHeaders: Match.Optional(Object)
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      // Test the API key before storing it
      const testData = {
        provider: apiKeyData.provider,
        apiKey: apiKeyData.apiKey
      };

      // Only add optional fields if they exist
      if (apiKeyData.organization) {
        testData.organization = apiKeyData.organization;
      }

      if (apiKeyData.additionalHeaders) {
        testData.additionalHeaders = apiKeyData.additionalHeaders;
      }

      const testResult = await Meteor.callAsync('aiGateway.testProviderApiKey', testData);

      if (!testResult.success) {
        throw new Meteor.Error('invalid-api-key', 'API key validation failed');
      }

      // Store the API key (encrypted in a real implementation)
      const keyId = await ProviderApiKeysCollection.insertAsync({
        name: apiKeyData.name,
        provider: apiKeyData.provider,
        apiKey: apiKeyData.apiKey, // In production, encrypt this
        description: apiKeyData.description || null,
        organization: apiKeyData.organization || null,
        additionalHeaders: apiKeyData.additionalHeaders || null,
        owner: this.userId,
        isActive: true,
        createdAt: new Date(),
        lastUsedAt: null,
        lastTestedAt: new Date(),
        testResult: testResult
      });

      return {
        id: keyId,
        name: apiKeyData.name,
        provider: apiKeyData.provider,
        message: 'API key created and validated successfully'
      };
    } catch (error) {
      throw new Meteor.Error('create-api-key-failed', error.message);
    }
  },

  async 'providerApiKeys.list'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const apiKeys = await ProviderApiKeysCollection.find(
        { owner: this.userId },
        {
          sort: { createdAt: -1 },
          fields: {
            // Don't return the actual API key for security
            apiKey: 0
          }
        }
      ).fetchAsync();

      // Add masked preview of API key
      return apiKeys.map(key => {
        // We need to get the actual key to create preview, but don't return it
        const fullKey = ProviderApiKeysCollection.findOne(
          { _id: key._id, owner: this.userId },
          { fields: { apiKey: 1 } }
        );

        return {
          ...key,
          keyPreview: fullKey?.apiKey ? `••••••••••••${fullKey.apiKey.slice(-4)}` : '••••••••••••••••'
        };
      });
    } catch (error) {
      throw new Meteor.Error('list-api-keys-failed', error.message);
    }
  },

  async 'providerApiKeys.get'(keyId) {
    check(keyId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const apiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: keyId,
        owner: this.userId
      });

      if (!apiKey) {
        throw new Meteor.Error('not-found', 'API key not found');
      }

      // Return without the actual API key for security
      const { apiKey: actualKey, ...safeKey } = apiKey;
      return {
        ...safeKey,
        keyPreview: actualKey ? `••••••••••••${actualKey.slice(-4)}` : '••••••••••••••••'
      };
    } catch (error) {
      throw new Meteor.Error('get-api-key-failed', error.message);
    }
  },

  async 'providerApiKeys.update'(keyId, updateData) {
    check(keyId, String);
    check(updateData, {
      name: Match.Optional(String),
      description: Match.Optional(String),
      organization: Match.Optional(String),
      additionalHeaders: Match.Optional(Object),
      isActive: Match.Optional(Boolean)
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const apiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: keyId,
        owner: this.userId
      });

      if (!apiKey) {
        throw new Meteor.Error('not-found', 'API key not found');
      }

      // Prepare update data, removing undefined values
      const cleanUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          cleanUpdateData[key] = updateData[key];
        }
      });

      await ProviderApiKeysCollection.updateAsync(keyId, {
        $set: {
          ...cleanUpdateData,
          updatedAt: new Date()
        }
      });

      return { success: true, message: 'API key updated successfully' };
    } catch (error) {
      throw new Meteor.Error('update-api-key-failed', error.message);
    }
  },

  async 'providerApiKeys.delete'(keyId) {
    check(keyId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const apiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: keyId,
        owner: this.userId
      });

      if (!apiKey) {
        throw new Meteor.Error('not-found', 'API key not found');
      }

      // Check if API key is being used by any models
      const modelsUsingKey = await LLMsCollection.find({
        apiKeyId: keyId,
        owner: this.userId
      }).countAsync();

      if (modelsUsingKey > 0) {
        throw new Meteor.Error('key-in-use', `Cannot delete API key. It is being used by ${modelsUsingKey} model(s).`);
      }

      await ProviderApiKeysCollection.removeAsync(keyId);

      return { success: true, message: 'API key deleted successfully' };
    } catch (error) {
      throw new Meteor.Error('delete-api-key-failed', error.message);
    }
  },

  async 'providerApiKeys.test'(keyId) {
    check(keyId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const apiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: keyId,
        owner: this.userId
      });

      if (!apiKey) {
        throw new Meteor.Error('not-found', 'API key not found');
      }

      // Prepare test data, only including fields that have values
      const testData = {
        provider: apiKey.provider,
        apiKey: apiKey.apiKey
      };

      // Only add optional fields if they have actual values (not null or empty)
      if (apiKey.organization && apiKey.organization.trim()) {
        testData.organization = apiKey.organization.trim();
      }

      if (apiKey.additionalHeaders && typeof apiKey.additionalHeaders === 'object') {
        testData.additionalHeaders = apiKey.additionalHeaders;
      }

      // Test the API key
      const testResult = await Meteor.callAsync('aiGateway.testProviderApiKey', testData);

      // Update last tested time
      await ProviderApiKeysCollection.updateAsync(keyId, {
        $set: {
          lastTestedAt: new Date(),
          testResult: testResult
        }
      });

      return testResult;
    } catch (error) {
      throw new Meteor.Error('test-api-key-failed', error.message);
    }
  },

  // Helper method to test API key without storing it
  async 'aiGateway.testProviderApiKey'(keyData) {
    check(keyData, {
      provider: String,
      apiKey: String,
      organization: Match.Optional(String),
      additionalHeaders: Match.Optional(Object)
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      // Use existing test connection method but with provider-specific logic
      const testConfig = {
        name: `Test ${keyData.provider} Connection`,
        provider: keyData.provider,
        apiKey: keyData.apiKey,
        modelName: getDefaultModelForProvider(keyData.provider),
        apiEndpoint: getDefaultEndpointForProvider(keyData.provider),
        type: 'third-party'
      };

      // Only add optional fields if they exist
      if (keyData.organization) {
        testConfig.organization = keyData.organization;
      }

      if (keyData.additionalHeaders) {
        testConfig.additionalHeaders = JSON.stringify(keyData.additionalHeaders);
      }

      const result = await Meteor.callAsync('aiGateway.testLLMConnection', testConfig);
      return result;
    } catch (error) {
      throw new Meteor.Error('test-provider-key-failed', error.message);
    }
  },

  // ---- Model Management Methods ----

  async 'aiGateway.listModels'(filters = {}) {
    check(filters, {
      provider: Match.Maybe(String),
      model_type: Match.Maybe(String),
      capability: Match.Maybe(String),
      active_only: Match.Maybe(Boolean),
      owner: Match.Maybe(String),
      tags: Match.Maybe([String]),
      skip: Match.Maybe(Number),
      limit: Match.Maybe(Number)
    });

    this.unblock();

    // Ensure user has an API key
    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('GET', 'api/v1/models', null, filters);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('list-models-failed', error.message);
    }
  },

  async 'aiGateway.getModelDetails'(modelId) {
    check(modelId, String);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('GET', `api/v1/models/${modelId}`);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('get-model-failed', error.message);
    }
  },

  async 'aiGateway.createModel'(modelData) {
    check(modelData, Object);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('POST', 'api/v1/models', modelData);

      // After successful creation in the gateway, add to local collection
      const localModel = {
        _id: response.data.id,
        name: response.data.name,
        type: response.data.provider === 'kubernetes' ? 'self-hosted' : 'third-party',
        provider: response.data.provider,
        modelId: response.data.model_id,
        status: response.data.is_active ? 'active' : 'inactive',
        parameters: response.data.parameters?.max_tokens || 2048,
        capabilities: response.data.capabilities || [],
        createdAt: new Date(response.data.created_at),
        updatedAt: new Date(response.data.updated_at),
        owner: this.userId
      };

      await LLMsCollection.insertAsync(localModel);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('create-model-failed', error.message);
    }
  },

  async 'aiGateway.updateModel'(modelId, updateData) {
    check(modelId, String);
    check(updateData, Object);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('PUT', `api/v1/models/${modelId}`, updateData);

      // Update local collection as well
      await LLMsCollection.updateAsync({ _id: modelId }, {
        $set: {
          name: response.data.name,
          status: response.data.is_active ? 'active' : 'inactive',
          parameters: response.data.parameters?.max_tokens || undefined,
          updatedAt: new Date(response.data.updated_at)
        }
      });

      return response.data;
    } catch (error) {
      throw new Meteor.Error('update-model-failed', error.message);
    }
  },

  async 'aiGateway.deleteModel'(modelId) {
    check(modelId, String);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      await gatewayRequest('DELETE', `api/v1/models/${modelId}`);

      // Remove from local collection as well
      await LLMsCollection.removeAsync({ _id: modelId });

      return true;
    } catch (error) {
      throw new Meteor.Error('delete-model-failed', error.message);
    }
  },

  // ---- Self-Hosted LLM Methods ----

  async 'aiGateway.listSelfHostedModels'() {
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('GET', 'api/v1/models/kubernetes');
      return response.data;
    } catch (error) {
      throw new Meteor.Error('list-k8s-models-failed', error.message);
    }
  },

  async 'aiGateway.deployModel'(modelConfig) {
    check(modelConfig, {
      modelId: String,
      modelName: String,
      modelSource: String,
      modelUrl: String,
      hardwareTier: String,
      replicas: Number,
      maxTokens: Number,
      allowedUsers: String,
      customParameters: Match.Maybe(String),
      type: Match.Maybe(String)
    });

    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    // First, create a placeholder in our local collection
    const deploymentId = await LLMsCollection.insertAsync({
      name: modelConfig.modelName,
      type: 'self-hosted',
      provider: 'kubernetes',
      status: 'deploying',
      parameters: modelConfig.maxTokens,
      hardwareTier: modelConfig.hardwareTier,
      createdAt: new Date(),
      owner: this.userId
    });

    // Prepare data for the gateway (match backend model structure)
    const gatewayModelData = {
      name: modelConfig.modelName,
      provider: "kubernetes",
      model_id: modelConfig.modelUrl,
      model_type: "chat", // Use lowercase to match backend enum
      capabilities: ["text", "chat"], // Use backend capability values
      kubernetes_config: {
        namespace: "ai-models", // You might want to make this configurable
        service_name: modelConfig.modelId,
        port: 8000,
        path: "/v1",
        use_service_account: true,
        timeout: 60
      },
      parameters: {
        max_tokens: modelConfig.maxTokens,
        hardware_tier: modelConfig.hardwareTier,
        replicas: modelConfig.replicas,
        ...JSON.parse(modelConfig.customParameters || '{}')
      },
      description: `Self-hosted model deployed from ${modelConfig.modelSource}`,
      tags: ["self-hosted", "kubernetes"]
    };

    try {
      // Call the gateway to start the deployment
      const response = await gatewayRequest('POST', 'api/v1/models', gatewayModelData);

      // Update the local record with the gateway ID
      await LLMsCollection.updateAsync({ _id: deploymentId }, {
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
      await LLMsCollection.updateAsync({ _id: deploymentId }, {
        $set: {
          status: 'failed',
          error: error.message
        }
      });
      throw new Meteor.Error('deploy-model-failed', error.message);
    }
  },

  async 'aiGateway.checkDeploymentStatus'(deploymentId) {
    check(deploymentId, String);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    const deployment = await LLMsCollection.findOneAsync(deploymentId);
    if (!deployment) {
      throw new Meteor.Error('not-found', 'Deployment not found');
    }

    if (!deployment.gatewayId) {
      throw new Meteor.Error('no-gateway-id', 'No gateway ID for this deployment');
    }

    try {
      const response = await gatewayRequest('GET', `api/v1/models/${deployment.gatewayId}`);

      // Update local status based on gateway response
      const newStatus = response.data.is_active ? 'active' : 'inactive';

      await LLMsCollection.updateAsync({ _id: deploymentId }, {
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
      // If error includes 404, the model might have been deleted
      if (error.message.includes('404') || error.message.includes('not found')) {
        await LLMsCollection.updateAsync({ _id: deploymentId }, {
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

  async 'aiGateway.addThirdPartyLLM'(providerConfig) {
    check(providerConfig, {
      name: String,
      provider: String,
      apiEndpoint: Match.Maybe(String),
      apiVersion: Match.Maybe(String),
      apiKey: Match.Maybe(String),
      selectedApiKeyId: Match.Maybe(String),
      modelName: String,
      maxTokens: Match.Maybe(Number),
      organization: Match.Maybe(String),
      additionalHeaders: Match.Maybe(String),
      type: Match.Maybe(String)
    });

    this.unblock();

    // Ensure user has a gateway API key
    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    // Map provider names to backend enum values
    const providerMap = {
      'openai': 'openai',
      'anthropic': 'anthropic',
      'mistral': 'mistral',
      'google': 'google',
      'cohere': 'cohere',
      'custom': 'custom'
    };

    const mappedProvider = providerMap[providerConfig.provider.toLowerCase()] || 'custom';

    let apiKeyToUse = providerConfig.apiKey;
    let apiEndpointToUse = providerConfig.apiEndpoint || getDefaultEndpointForProvider(providerConfig.provider);

    // If using an existing API key, fetch it
    if (providerConfig.selectedApiKeyId) {
      const savedApiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: providerConfig.selectedApiKeyId,
        owner: this.userId
      });

      if (!savedApiKey) {
        throw new Meteor.Error('api-key-not-found', 'Selected API key not found');
      }

      apiKeyToUse = savedApiKey.apiKey;
      // Use saved key's organization if not provided
      if (!providerConfig.organization && savedApiKey.organization) {
        providerConfig.organization = savedApiKey.organization;
      }
    }

    if (!apiKeyToUse) {
      throw new Meteor.Error('no-api-key', 'No API key provided');
    }

    // Prepare data for the gateway
    const gatewayModelData = {
      name: providerConfig.name,
      provider: mappedProvider,
      model_id: providerConfig.modelName,
      model_type: "chat", // Default to chat
      capabilities: ["text", "chat"], // Use backend capability values
      api_key: apiKeyToUse,
      parameters: {
        max_tokens: providerConfig.maxTokens || 2048,
        api_base: apiEndpointToUse,
        api_version: providerConfig.apiVersion || null,
        organization: providerConfig.organization || null
      },
      tags: ["third-party", mappedProvider]
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
      const response = await gatewayRequest('POST', 'api/v1/models', gatewayModelData);

      // Add to local collection
      const localModel = {
        _id: response.data.id,
        name: providerConfig.name,
        type: 'third-party',
        provider: providerConfig.provider,
        modelName: providerConfig.modelName,
        status: 'active',
        parameters: providerConfig.maxTokens || 2048,
        apiKeyId: providerConfig.selectedApiKeyId || null, // Store reference to API key if used
        createdAt: new Date(response.data.created_at),
        updatedAt: new Date(response.data.updated_at),
        owner: this.userId
      };

      await LLMsCollection.insertAsync(localModel);

      // Update last used time for the API key if one was used
      if (providerConfig.selectedApiKeyId) {
        await ProviderApiKeysCollection.updateAsync(providerConfig.selectedApiKeyId, {
          $set: {
            lastUsedAt: new Date()
          }
        });
      }

      return response.data;
    } catch (error) {
      throw new Meteor.Error('add-third-party-failed', error.message);
    }
  },

  async 'aiGateway.testLLMConnection'(providerConfig) {
    check(providerConfig, {
      name: Match.Optional(String),
      provider: String,
      apiEndpoint: Match.Optional(String),
      apiVersion: Match.Optional(String),
      apiKey: Match.Optional(String),
      selectedApiKeyId: Match.Optional(String),
      modelName: String,
      maxTokens: Match.Optional(Number),
      organization: Match.Optional(String),
      additionalHeaders: Match.Optional(String),
      type: Match.Optional(String)
    });
    this.unblock();

    // Ensure user has a REAL API key (no mocks)
    const keyResult = await Meteor.callAsync('aiGateway.ensureGatewayApiKey');
    if (!keyResult.success) {
      throw new Meteor.Error('no-valid-api-key', 'Cannot test LLM connection without a valid AI Gateway API key');
    }

    // Map provider names
    const providerMap = {
      'openai': 'openai',
      'anthropic': 'anthropic',
      'mistral': 'mistral',
      'google': 'google',
      'cohere': 'cohere',
      'custom': 'custom'
    };

    const mappedProvider = providerMap[providerConfig.provider.toLowerCase()] || 'custom';

    let apiKeyToUse = providerConfig.apiKey;
    let apiEndpointToUse = providerConfig.apiEndpoint || getDefaultEndpointForProvider(providerConfig.provider);

    // If using an existing API key, fetch it
    if (providerConfig.selectedApiKeyId) {
      const savedApiKey = await ProviderApiKeysCollection.findOneAsync({
        _id: providerConfig.selectedApiKeyId,
        owner: this.userId
      });

      if (!savedApiKey) {
        throw new Meteor.Error('api-key-not-found', 'Selected API key not found');
      }

      apiKeyToUse = savedApiKey.apiKey;
      // Use saved key's organization if not provided
      if (!providerConfig.organization && savedApiKey.organization) {
        providerConfig.organization = savedApiKey.organization;
      }
    }

    if (!apiKeyToUse) {
      throw new Meteor.Error('no-api-key', 'No API key provided for testing');
    }

    // Create a temporary model to test the connection
    const testModelData = {
      name: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: mappedProvider,
      model_id: providerConfig.modelName,
      model_type: "chat",
      capabilities: ["text", "chat"],
      api_key: apiKeyToUse,
      parameters: {
        max_tokens: providerConfig.maxTokens || 2048,
        api_base: apiEndpointToUse
      },
      description: "Temporary test model - will be deleted",
      tags: ["test", "temporary"]
    };

    // Only add optional parameters if they have values
    if (providerConfig.apiVersion) {
      testModelData.parameters.api_version = providerConfig.apiVersion;
    }

    if (providerConfig.organization) {
      testModelData.parameters.organization = providerConfig.organization;
    }

    // Parse additional headers if provided
    if (providerConfig.additionalHeaders) {
      try {
        testModelData.parameters.additional_headers = JSON.parse(providerConfig.additionalHeaders);
      } catch (e) {
        throw new Meteor.Error('invalid-headers', 'Additional headers must be valid JSON');
      }
    }

    let createdModelId = null;

    try {
      // Try to create the model to test the connection
      const createResponse = await gatewayRequest('POST', 'api/v1/models', testModelData);
      createdModelId = createResponse.data.id;

      // If successful, immediately delete the test model
      if (createdModelId) {
        try {
          await gatewayRequest('DELETE', `api/v1/models/${createdModelId}`);
        } catch (deleteError) {
          console.warn('Failed to delete test model:', deleteError.message);
          // Don't fail the test if deletion fails
        }
      }

      return {
        success: true,
        message: 'Connection test successful!',
        provider: providerConfig.provider,
        model: providerConfig.modelName,
        details: {
          endpoint: apiEndpointToUse,
          model_created: !!createdModelId,
          model_deleted: true,
          gateway_model_id: createdModelId,
          uses_saved_api_key: !!providerConfig.selectedApiKeyId
        }
      };
    } catch (error) {
      // Clean up test model if it was created
      if (createdModelId) {
        try {
          await gatewayRequest('DELETE', `api/v1/models/${createdModelId}`);
        } catch (deleteError) {
          console.warn('Failed to delete test model after error:', deleteError.message);
        }
      }

      console.error('Test connection error:', error);
      throw new Meteor.Error('test-connection-failed', error.message);
    }
  },

  // ---- Provider Discovery Methods ----

  async 'aiGateway.listProviders'() {
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('GET', 'api/v1/models/providers');
      return response.data;
    } catch (error) {
      throw new Meteor.Error('list-providers-failed', error.message);
    }
  },

  async 'aiGateway.discoverProviderModels'(provider, filters = {}) {
    check(provider, String);
    check(filters, {
      capability: Match.Maybe(String),
      model_type: Match.Maybe(String)
    });

    this.unblock();

    // Ensure user has an API key
    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      // Convert provider to lowercase to match backend enum
      const normalizedProvider = provider.toLowerCase();

      // Build the endpoint URL
      const endpoint = `api/v1/discovery/providers/${normalizedProvider}/models`;

      // Call the gateway discovery endpoint
      const response = await gatewayRequest('GET', endpoint, null, filters);

      return response.data;
    } catch (error) {
      throw new Meteor.Error('discover-provider-models-failed', error.message);
    }
  },

  // ---- Gateway Management Methods ----

  async 'aiGateway.testGatewayConnection'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Don't ensure API key here, this is for testing connectivity
    const gatewayUrl = getGatewayUrl();
    const results = {};

    // Test public endpoints first
    const publicEndpoints = [
      { path: '', description: 'Root endpoint' },
      { path: 'healthcheck', description: 'Public health check' },
      { path: 'api/v1/auth/health', description: 'Auth service health' }
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await HTTP.call('GET', `${gatewayUrl}/${endpoint.path}`, { timeout: 5000 });
        results[`public_${endpoint.path || 'root'}`] = {
          success: true,
          status: response.statusCode,
          description: endpoint.description
        };
      } catch (error) {
        results[`public_${endpoint.path || 'root'}`] = {
          success: false,
          status: error.response?.statusCode || 'error',
          description: endpoint.description,
          error: error.message
        };
      }
    }

    // Test registration endpoint
    try {
      const testUserId = `test_${Date.now()}`;
      const response = await gatewayPublicRequest('POST', 'api/v1/auth/ensure-key', {
        user_id: testUserId,
        name: 'Test Connection Key',
        description: 'Test key for connection verification'
      });

      results.registration = {
        success: true,
        status: response.statusCode,
        description: 'User registration endpoint',
        canCreateKeys: true
      };

      // Clean up test key if created
      if (response.data?.key && response.data.key !== '***existing***') {
        // Note: We can't easily delete the test key without auth,
        // but it's just a test key so it's okay to leave it
      }
    } catch (error) {
      results.registration = {
        success: false,
        status: error.response?.statusCode || 'error',
        description: 'User registration endpoint',
        error: error.message,
        canCreateKeys: false
      };
    }

    return {
      gatewayUrl,
      timestamp: new Date(),
      results,
      summary: {
        publicEndpointsWorking: Object.values(results).filter(r => r.success && r.description?.includes('endpoint')).length,
        registrationWorking: results.registration?.success || false
      }
    };
  },

  async 'aiGateway.testGatewayEndpoints'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    const results = {};
    const gatewayUrl = getGatewayUrl();

    // Test various endpoints
    const endpointsToTest = [
      { path: 'api/v1/models', method: 'GET', description: 'List models' },
      { path: 'api/v1/models/kubernetes', method: 'GET', description: 'List Kubernetes models' },
      { path: 'api/v1/models/providers', method: 'GET', description: 'List providers' },
      { path: 'api/v1/auth/keys', method: 'GET', description: 'List API keys' },
      { path: 'api/v1/auth/health', method: 'GET', description: 'Auth Health check' }
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await gatewayRequest(endpoint.method, endpoint.path);
        results[endpoint.path] = {
          success: true,
          status: response.statusCode,
          description: endpoint.description,
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        };
      } catch (error) {
        results[endpoint.path] = {
          success: false,
          status: error.response?.statusCode || 'error',
          description: endpoint.description,
          error: error.message
        };
      }
    }

    // Test public endpoints without auth
    const publicEndpoints = [
      { path: '', description: 'Root' },
      { path: 'api/v1/docs', description: 'API Documentation' },
      { path: 'healthcheck', description: 'Public Health Check' }
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const response = await HTTP.call('GET', `${gatewayUrl}/${endpoint.path}`, { timeout: 5000 });
        results[`public_${endpoint.path || 'root'}`] = {
          success: true,
          status: response.statusCode,
          description: endpoint.description
        };
      } catch (error) {
        results[`public_${endpoint.path || 'root'}`] = {
          success: false,
          status: error.response?.statusCode || 'error',
          description: endpoint.description,
          error: error.message
        };
      }
    }

    return {
      gatewayUrl,
      timestamp: new Date(),
      results
    };
  },

  async 'aiGateway.getGatewayInfo'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const gatewayUrl = getGatewayUrl();

      const endpoints = {
        root: null,
        models: null,
        docs: null,
        health: null
      };

      // Test root endpoint
      try {
        const response = await HTTP.call('GET', gatewayUrl, { timeout: 3000 });
        endpoints.root = { status: response.statusCode, available: true };
      } catch (error) {
        endpoints.root = { status: error.response?.statusCode || 'error', available: false };
      }

      // Test models endpoint (requires auth)
      try {
        await Meteor.callAsync('aiGateway.ensureGatewayApiKey');
        const response = await gatewayRequest('GET', 'api/v1/models');
        endpoints.models = {
          status: response.statusCode,
          available: true,
          count: response.data?.length || 0
        };
      } catch (error) {
        endpoints.models = {
          status: error.response?.statusCode || 'error',
          available: false
        };
      }

      // Test docs endpoint
      try {
        const response = await HTTP.call('GET', `${gatewayUrl}/api/v1/docs`, { timeout: 3000 });
        endpoints.docs = { status: response.statusCode, available: true };
      } catch (error) {
        endpoints.docs = { status: error.response?.statusCode || 'error', available: false };
      }

      // Test health endpoint
      try {
        const response = await HTTP.call('GET', `${gatewayUrl}/healthcheck`, { timeout: 3000 });
        endpoints.health = { status: response.statusCode, available: true };
      } catch (error) {
        endpoints.health = { status: error.response?.statusCode || 'error', available: false };
      }

      return {
        gatewayUrl,
        endpoints,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Meteor.Error('gateway-info-failed', error.message);
    }
  },

  // ---- Chat/Completion Methods ----

  async 'aiGateway.testModelChat'(modelId, message = "Hello, how are you?") {
    check(modelId, String);
    check(message, String);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('POST', 'api/v1/chat/completions', {
        model: modelId,
        messages: [
          { role: "user", content: message }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      return response.data;
    } catch (error) {
      throw new Meteor.Error('test-chat-failed', error.message);
    }
  },

  async 'aiGateway.generateCompletion'(modelId, prompt, options = {}) {
    check(modelId, String);
    check(prompt, String);
    check(options, Object);
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    const requestData = {
      model: modelId,
      prompt: prompt,
      max_tokens: options.maxTokens || 100,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 1.0,
      frequency_penalty: options.frequencyPenalty || 0.0,
      presence_penalty: options.presencePenalty || 0.0,
      stop: options.stop || null,
      stream: options.stream || false
    };

    try {
      const response = await gatewayRequest('POST', 'api/v1/completions', requestData);
      return response.data;
    } catch (error) {
      throw new Meteor.Error('generate-completion-failed', error.message);
    }
  },

  async 'aiGateway.generateEmbedding'(modelId, input) {
    check(modelId, String);
    check(input, Match.OneOf(String, [String]));
    this.unblock();

    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    try {
      const response = await gatewayRequest('POST', 'api/v1/embeddings', {
        model: modelId,
        input: input
      });

      return response.data;
    } catch (error) {
      throw new Meteor.Error('generate-embedding-failed', error.message);
    }
  }
});

// Function to initialize the OpenSourceLLMs collection with some default models
export const initializeOpenSourceModels = async () => {
  const count = await OpenSourceLLMsCollection.find().countAsync();
  if (count === 0) {
    const defaultModels = [
      {
        name: 'Llama 3.1 8B',
        organization: 'Meta AI',
        description: 'Meta\'s latest Llama 3.1 8B model, optimized for chat and general tasks.',
        parameters: '8B',
        tags: ['chat', 'general', 'instruction-following'],
        repoUrl: 'meta-llama/Meta-Llama-3.1-8B',
        license: 'Meta AI LLAMA 3.1 COMMUNITY LICENSE',
        framework: 'pytorch',
      },
      {
        name: 'Mistral 7B Instruct',
        organization: 'Mistral AI',
        description: 'Mistral 7B instruction-tuned model with impressive capabilities.',
        parameters: '7B',
        tags: ['chat', 'general', 'instruction-following'],
        repoUrl: 'mistralai/Mistral-7B-Instruct-v0.2',
        license: 'Apache 2.0',
        framework: 'pytorch',
      },
      {
        name: 'Phi-3 Mini',
        organization: 'Microsoft',
        description: 'Phi-3 Mini is a 3.8B parameter language model with strong reasoning capabilities.',
        parameters: '3.8B',
        tags: ['reasoning', 'compact', 'instruction-following'],
        repoUrl: 'microsoft/Phi-3-mini-4k-instruct',
        license: 'MIT',
        framework: 'pytorch',
      },
      {
        name: 'CodeLlama 7B Instruct',
        organization: 'Meta AI',
        description: 'CodeLlama instruction-tuned for code generation and understanding.',
        parameters: '7B',
        tags: ['code', 'programming', 'instruction-following'],
        repoUrl: 'codellama/CodeLlama-7b-Instruct-hf',
        license: 'Meta AI Code Llama License',
        framework: 'pytorch',
      },
      {
        name: 'Gemma 7B',
        organization: 'Google',
        description: 'Gemma is Google\'s open-source language model family.',
        parameters: '7B',
        tags: ['general', 'instruction-following'],
        repoUrl: 'google/gemma-7b',
        license: 'Gemma Terms of Use',
        framework: 'pytorch',
      },
      {
        name: 'Qwen2 7B',
        organization: 'Alibaba',
        description: 'Qwen2 is a large language model series developed by Alibaba Cloud.',
        parameters: '7B',
        tags: ['general', 'multilingual', 'instruction-following'],
        repoUrl: 'Qwen/Qwen2-7B',
        license: 'Apache 2.0',
        framework: 'pytorch',
      }
    ];

    for (const model of defaultModels) {
      await OpenSourceLLMsCollection.insertAsync({
        ...model,
        createdAt: new Date()
      });
    }
  }
};
