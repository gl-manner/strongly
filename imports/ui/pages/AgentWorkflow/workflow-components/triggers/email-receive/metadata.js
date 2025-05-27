export default {
  label: 'Email Receive',
  description: 'Trigger workflow when email is received',
  icon: '📧',
  color: '#4CAF50',

  defaultData: {
    emailAddress: '',
    subject: '',
    from: '',
    attachments: false,
    folder: 'inbox',
    pollInterval: 60
  },

  allowedInputs: [],
  allowedOutputs: ['*'],
  maxInputs: 0,
  maxOutputs: -1,

  version: '1.0.0',
  author: 'System',
  tags: ['trigger', 'email', 'mail', 'inbox'],
  isAsync: true,
  requiresAuth: true,
  isBeta: false
};
