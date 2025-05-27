// imports/ui/pages/AgentWorkflow/workflow-components/transform/code/schema.js

export default {
  type: 'object',
  properties: {
    code: {
      type: 'string',
      minLength: 1
    },
    timeout: {
      type: 'number',
      minimum: 100,
      maximum: 30000,
      default: 5000
    },
    libraries: {
      type: 'object',
      properties: {
        lodash: {
          type: 'boolean',
          default: false
        },
        moment: {
          type: 'boolean',
          default: false
        },
        crypto: {
          type: 'boolean',
          default: false
        }
      }
    },
    errorHandling: {
      type: 'string',
      enum: ['throw', 'returnError', 'returnNull'],
      default: 'throw'
    },
    options: {
      type: 'object',
      properties: {
        asyncAllowed: {
          type: 'boolean',
          default: true
        },
        sandboxed: {
          type: 'boolean',
          default: true
        },
        preserveConsoleOutput: {
          type: 'boolean',
          default: true
        }
      }
    }
  },
  required: ['code']
};
