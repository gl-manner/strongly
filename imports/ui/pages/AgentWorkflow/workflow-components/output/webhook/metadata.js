// imports/ui/pages/AgentWorkflow/workflow-components/output/webhook/metadata.js

export default {
  // Display Information
  label: 'Webhook',
  description: 'Send data to external webhooks via HTTP/HTTPS',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    url: '',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    authentication: 'none', // none, basic, bearer, apikey
    username: '',
    password: '',
    bearerToken: '',
    apiKey: '',
    apiKeyHeader: 'X-API-Key',
    body: '{{input}}', // Template for request body
    bodyType: 'json', // json, form, raw
    queryParams: {},
    timeout: 30000, // 30 seconds
    retryCount: 3,
    retryDelay: 1000, // 1 second
    validateSSL: true,
    followRedirects: true,
    maxRedirects: 5,
    responseHandling: 'json', // json, text, binary
    successCodes: [200, 201, 202, 204],
    errorHandling: 'fail' // fail, continue, retry
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['webhook', 'http', 'api', 'integration', 'rest'],

  // Behavior Flags
  isAsync: true, // HTTP requests are async
  requiresAuth: false, // Auth is configured per webhook
  isBeta: false
};
