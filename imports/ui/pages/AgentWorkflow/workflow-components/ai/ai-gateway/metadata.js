// imports/ui/pages/AgentWorkflow/workflow-components/ai/ai-gateway/metadata.js

// This is the base metadata for the AI Gateway component
// We'll dynamically create individual components for each available model
export default {
  // Display Information
  label: 'AI Gateway', // This will be overridden for each model
  description: 'Connect to AI models through the AI Gateway',
  color: '#ec4899', // Pink color for AI components

  // Default Configuration
  defaultData: {
    modelId: '',
    modelName: '',
    provider: '',
    prompt: '',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    stopSequences: [],
    responseFormat: 'text', // text, json, markdown
    stream: false
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive data from any component
  allowedOutputs: ['*'], // Can send to any component
  maxInputs: 1, // Only one input
  maxOutputs: -1, // Unlimited outputs

  // Additional Metadata
  version: '1.0.0',
  author: 'AI Gateway System',
  tags: ['ai', 'llm', 'chat', 'completion'],

  // Behavior Flags
  isAsync: true, // AI calls are async
  requiresAuth: true, // Needs AI Gateway auth
  isBeta: false,

  // Special flag to indicate this is a dynamic component generator
  isDynamicComponent: true
};
