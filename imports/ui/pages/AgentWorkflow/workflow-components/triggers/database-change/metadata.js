export default {
  label: 'Database Change',
  description: 'Trigger when database records change',
  icon: '🔄',
  color: '#4CAF50',

  defaultData: {
    connection: '',
    collection: '',
    operation: 'all',
    filters: {},
    polling: false,
    pollingInterval: 60
  },

  allowedInputs: [],
  allowedOutputs: ['*'],
  maxInputs: 0,
  maxOutputs: -1,

  version: '1.0.0',
  author: 'System',
  tags: ['trigger', 'database', 'change', 'watch', 'realtime'],
  isAsync: true,
  requiresAuth: true,
  isBeta: false
};
