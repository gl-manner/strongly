export default {
  label: 'Webhook',
  description: 'Trigger workflow when webhook is received',
  icon: '🪝',
  color: '#4CAF50',

  defaultData: {
    method: 'POST',
    path: '/webhook',
    authentication: 'none',
    headers: {},
    responseCode: 200,
    responseBody: '{"success": true}'
  },

  allowedInputs: [],
  allowedOutputs: ['*'],
  maxInputs: 0,
  maxOutputs: -1,

  version: '1.0.0',
  author: 'System',
  tags: ['trigger', 'http', 'webhook', 'api'],
  isAsync: true,
  requiresAuth: false,
  isBeta: false
};
