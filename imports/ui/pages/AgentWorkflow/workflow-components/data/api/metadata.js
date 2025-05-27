// imports/ui/pages/AgentWorkflow/workflow-components/data/api/metadata.js

export default {
  // Display Information
  label: 'API Request',
  description: 'Make HTTP requests to external APIs',
  color: '#3b82f6', // Sky blue

  // Default Configuration
  defaultData: {
    method: 'GET',
    url: '',
    headers: {},
    body: '',
    authentication: {
      type: 'none', // none, basic, bearer, apiKey
      credentials: {}
    },
    timeout: 30000, // 30 seconds
    retries: 0,
    responseType: 'json' // json, text, blob
  },

  // Connection Rules
  allowedInputs: ['triggers', 'data', 'transform', 'ai'],
  allowedOutputs: ['*'],
  maxInputs: -1,
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['api', 'http', 'rest', 'request', 'fetch', 'external'],

  // Behavior Flags
  isAsync: true,
  requiresAuth: false,
  isBeta: false
};
