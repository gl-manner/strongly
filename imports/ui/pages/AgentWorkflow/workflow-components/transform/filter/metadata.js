// imports/ui/pages/AgentWorkflow/workflow-components/transform/filter/metadata.js

export default {
  // Display Information
  label: 'Filter Data',
  description: 'Filter arrays or objects based on conditions',
  color: '#8b5cf6', // Blue

  // Default Configuration
  defaultData: {
    filterType: 'simple', // simple, advanced, custom
    conditions: [
      {
        field: '',
        operator: 'equals',
        value: '',
        caseSensitive: false
      }
    ],
    logic: 'and', // and, or
    customFunction: '// Return true to keep item, false to filter out\n// Example: return item.age > 18;',
    options: {
      keepEmpty: false,
      deepFilter: false,
      returnFirst: false
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
  tags: ['filter', 'condition', 'array', 'object', 'transform'],

  // Behavior Flags
  isAsync: false,
  requiresAuth: false,
  isBeta: false
};
