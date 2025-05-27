// imports/ui/pages/AgentWorkflow/workflow-components/transform/merge/metadata.js

export default {
  // Display Information
  label: 'Merge Data',
  description: 'Merge multiple inputs or data sources together',
  color: '#8b5cf6', // Amber

  // Default Configuration
  defaultData: {
    mergeType: 'object', // object, array, concat, join, custom
    mergeStrategy: 'shallow', // shallow, deep, replace
    arrayHandling: 'concat', // concat, merge, replace, unique
    joinOptions: {
      separator: ', ',
      prefix: '',
      suffix: ''
    },
    keyMapping: {
      // Map input indices to output keys
      // e.g., { "0": "userData", "1": "orderData" }
    },
    customFunction: '// Merge multiple inputs\n// Available variables: inputs (array of all inputs)\n// Example:\nreturn inputs.reduce((acc, input) => ({ ...acc, ...input }), {});',
    options: {
      skipNull: true,
      skipEmpty: true,
      removeDuplicates: false,
      preserveArrayOrder: true
    }
  },

  // Connection Rules
  allowedInputs: ['*'],
  allowedOutputs: ['*'],
  maxInputs: -1, // Unlimited inputs for merging
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['merge', 'combine', 'join', 'aggregate', 'transform'],

  // Behavior Flags
  isAsync: false,
  requiresAuth: false,
  isBeta: false
};
