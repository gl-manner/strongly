export default {
  label: 'Form',
  description: 'Trigger workflow on form submission',
  icon: '📝',
  color: '#4CAF50',

  defaultData: {
    formName: '',
    fields: [
      { name: 'email', type: 'email', required: true },
      { name: 'message', type: 'text', required: false }
    ],
    submitButton: 'Submit',
    successMessage: 'Thank you for your submission!',
    requireAuth: false
  },

  allowedInputs: [],
  allowedOutputs: ['*'],
  maxInputs: 0,
  maxOutputs: -1,

  version: '1.0.0',
  author: 'System',
  tags: ['trigger', 'form', 'input', 'user'],
  isAsync: false,
  requiresAuth: false,
  isBeta: false
};
