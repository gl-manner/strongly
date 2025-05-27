// imports/ui/pages/AgentWorkflow/workflow-components/transform/code/metadata.js

export default {
  // Display Information
  label: 'Custom Code',
  description: 'Transform data using custom JavaScript code',
  color: '#8b5cf6', // Indigo

  // Default Configuration
  defaultData: {
    code: `// Transform your data with JavaScript
// Available variables:
//   - input: The input data from previous nodes
//   - context: Workflow context and metadata
//   - console: For logging (console.log, console.error)
//   - JSON, Math, Date, Array, Object: Standard JS globals

// Example transformation:
const result = {
  originalData: input,
  transformed: true,
  timestamp: new Date().toISOString(),
  count: Array.isArray(input) ? input.length : 1
};

return result;`,
    timeout: 5000, // 5 seconds
    libraries: {
      lodash: false,
      moment: false,
      crypto: false
    },
    errorHandling: 'throw', // throw, returnError, returnNull
    options: {
      asyncAllowed: true,
      sandboxed: true,
      preserveConsoleOutput: true
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
  tags: ['code', 'javascript', 'custom', 'transform', 'script'],

  // Behavior Flags
  isAsync: true,
  requiresAuth: false,
  isBeta: false
};
