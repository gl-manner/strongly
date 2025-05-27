// imports/ui/pages/AgentWorkflow/workflow-components/ai/components-loader.js

import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

// Import base AI Gateway component files
import baseMetadata from './ai-gateway/metadata.js';
import BaseIcon from './ai-gateway/icon.jsx';
import BaseEditor from './ai-gateway/editor.jsx';
import baseSchema from './ai-gateway/schema.js';
import baseExecutor from './ai-gateway/executor.js';

// Store for dynamically created AI components
const aiComponents = {};
let isLoading = false;
let loadError = null;
let lastLoadTime = null;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Create a component for a specific AI model
 */
const createModelComponent = (model) => {
  // Map provider names for display
  const providerDisplayNames = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'mistral': 'Mistral AI',
    'google': 'Google AI',
    'cohere': 'Cohere',
    'kubernetes': 'Self-Hosted',
    'custom': 'Custom'
  };

  const providerName = providerDisplayNames[model.provider] || model.provider;

  // Create component with model-specific metadata
  return {
    // Core properties
    type: `ai-${model.id}`, // Unique type for each model
    category: 'ai',

    // Display information
    label: model.name,
    description: `${providerName} - ${model.description || model.model_id || 'AI Model'}`,
    color: '#ec4899', // Pink for AI
    provider: model.provider, // <- ADD THIS LINE

    // Default data with model info pre-filled
    defaultData: {
      ...baseMetadata.defaultData,
      modelId: model.id,
      modelName: model.name,
      provider: model.provider
    },

    // Connection rules (same as base)
    allowedInputs: baseMetadata.allowedInputs,
    allowedOutputs: baseMetadata.allowedOutputs,
    maxInputs: baseMetadata.maxInputs,
    maxOutputs: baseMetadata.maxOutputs,

    // Component modules with model info passed through
    Icon: (props) => BaseIcon({ ...props, provider: model.provider }),
    Editor: (props) => BaseEditor({
      ...props,
      node: {
        ...props.node,
        modelInfo: model
      }
    }),
    schema: baseSchema,
    executor: baseExecutor,

    // Additional metadata
    version: baseMetadata.version,
    author: `${providerName} via AI Gateway`,
    tags: [
      'ai',
      model.provider,
      ...(model.capabilities || []),
      ...(model.tags || [])
    ],

    // Behavior flags
    isAsync: true,
    requiresAuth: true,
    isBeta: model.provider === 'custom' || model.tags?.includes('beta'),

    // Model-specific info
    modelInfo: {
      id: model.id,
      modelId: model.model_id,
      name: model.name,
      provider: model.provider,
      modelType: model.model_type,
      capabilities: model.capabilities,
      isActive: model.is_active,
      parameters: model.parameters,
      createdAt: model.created_at,
      updatedAt: model.updated_at
    }
  };
};

/**
 * Load AI models and create components dynamically
 */
export const loadAIComponents = async () => {
  // Check cache
  if (lastLoadTime && Date.now() - lastLoadTime < CACHE_DURATION) {
    return aiComponents;
  }

  if (isLoading) {
    // Wait for current load to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isLoading) {
          clearInterval(checkInterval);
          resolve(aiComponents);
        }
      }, 100);
    });
  }

  isLoading = true;
  loadError = null;

  try {
    console.log('🤖 Loading AI models from gateway...');

    // Ensure user has AI Gateway access
    const keyResult = await Meteor.callAsync('aiGateway.ensureGatewayApiKey');
    if (!keyResult.success) {
      throw new Error('AI Gateway access not available');
    }

    // Fetch available models
    const models = await Meteor.callAsync('aiGateway.listModels', {
      active_only: true // Only show active models in workflow
    });

    console.log(`🤖 Found ${models.length} AI models`);

    // Clear existing components
    Object.keys(aiComponents).forEach(key => delete aiComponents[key]);

    // Create a component for each model
    models.forEach(model => {
      try {
        const component = createModelComponent(model);
        aiComponents[component.type] = component;
        console.log(`✅ Created component for ${model.name} (${model.provider})`);
      } catch (error) {
        console.error(`Failed to create component for model ${model.name}:`, error);
      }
    });

    lastLoadTime = Date.now();
    console.log(`🤖 Successfully loaded ${Object.keys(aiComponents).length} AI components`);

    return aiComponents;

  } catch (error) {
    loadError = error;
    console.error('❌ Failed to load AI models:', error);

    // Return empty object on error
    return {};
  } finally {
    isLoading = false;
  }
};

/**
 * Get all loaded AI components
 */
export const getAIComponents = () => {
  return { ...aiComponents };
};

/**
 * Get a specific AI component by type
 */
export const getAIComponent = (type) => {
  return aiComponents[type];
};

/**
 * Check if AI components are loaded
 */
export const areAIComponentsLoaded = () => {
  return Object.keys(aiComponents).length > 0;
};

/**
 * Get loading state
 */
export const getLoadingState = () => {
  return {
    isLoading,
    error: loadError,
    componentCount: Object.keys(aiComponents).length,
    lastLoadTime
  };
};

/**
 * Force reload AI components
 */
export const reloadAIComponents = async () => {
  lastLoadTime = null; // Clear cache
  return loadAIComponents();
};

/**
 * Initialize AI components with reactive updates
 */
export const initializeAIComponents = () => {
  // Initial load
  loadAIComponents().catch(error => {
    console.error('Initial AI components load failed:', error);
  });

  // Set up reactive updates when AI models change
  if (Meteor.isClient) {
    Tracker.autorun(() => {
      // Subscribe to AI models
      const handle = Meteor.subscribe('allLLMs');

      if (handle.ready()) {
        // Reload components when subscription is ready
        // This will refresh when models are added/removed
        loadAIComponents().catch(error => {
          console.error('Reactive AI components load failed:', error);
        });
      }
    });
  }
};

// Export default object with all functions
export default {
  loadAIComponents,
  getAIComponents,
  getAIComponent,
  areAIComponentsLoaded,
  getLoadingState,
  reloadAIComponents,
  initializeAIComponents
};
