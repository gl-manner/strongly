// imports/ui/pages/AgentWorkflow/workflow-components/transform/map/metadata.js

export default {
  // Display Information
  label: 'Map Transform',
  description: 'Transform each item in an array or object properties',
  color: '#8b5cf6', // Violet

  // Default Configuration
  defaultData: {
    mapType: 'template', // template, fields, custom
    template: {
      // Define output structure with placeholders
      id: '{{id}}',
      name: '{{firstName}} {{lastName}}',
      email: '{{email}}'
    },
    fieldMappings: [
      {
        source: '',
        target: '',
        transform: 'none', // none, uppercase, lowercase, number, boolean, date, json
        defaultValue: ''
      }
    ],
    customFunction: '// Transform each item\n// Available variables: item, index, array\n// Example:\nreturn {\n  ...item,\n  fullName: `${item.firstName} ${item.lastName}`,\n  timestamp: new Date()\n};',
    options: {
      skipNull: true,
      flattenResult: false,
      preserveOriginal: false
    }
  },

  // Connection Rules
  allowedInputs: ['*'],
  allowedOutputs: ['*'],
  maxInputs: -1,
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['map', 'transform', 'array', 'object', 'template'],

  // Behavior Flags
  isAsync: false,
  requiresAuth: false,
  isBeta: false
};
