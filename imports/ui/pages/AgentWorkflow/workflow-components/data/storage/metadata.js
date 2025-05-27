// imports/ui/pages/AgentWorkflow/workflow-components/data/storage/metadata.js

export default {
  // Display Information
  label: 'Key-Value Storage',
  description: 'Store and retrieve data from persistent key-value storage',
  color: '#3b82f6', // Violet

  // Default Configuration
  defaultData: {
    operation: 'get', // get, set, delete, list
    key: '',
    value: '',
    namespace: 'default',
    ttl: null, // Time to live in seconds
    options: {
      returnPrevious: false,
      createIfNotExists: true,
      overwrite: true
    }
  },

  // Connection Rules
  allowedInputs: ['triggers', 'data', 'transform', 'ai'],
  allowedOutputs: ['*'],
  maxInputs: -1,
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['storage', 'cache', 'key-value', 'persist', 'store'],

  // Behavior Flags
  isAsync: true,
  requiresAuth: false,
  isBeta: false
};
