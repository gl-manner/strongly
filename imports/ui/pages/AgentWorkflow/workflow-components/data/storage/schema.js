// imports/ui/pages/AgentWorkflow/workflow-components/data/storage/schema.js

export default {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      enum: ['get', 'set', 'delete', 'list'],
      default: 'get'
    },
    key: {
      type: 'string',
      minLength: 1,
      maxLength: 255
    },
    value: {
      type: 'string'
    },
    namespace: {
      type: 'string',
      default: 'default',
      minLength: 1,
      maxLength: 100
    },
    ttl: {
      type: ['number', 'null'],
      minimum: 1,
      maximum: 86400 * 365 // Max 1 year
    },
    options: {
      type: 'object',
      properties: {
        returnPrevious: {
          type: 'boolean',
          default: false
        },
        createIfNotExists: {
          type: 'boolean',
          default: true
        },
        overwrite: {
          type: 'boolean',
          default: true
        }
      }
    }
  },
  required: ['operation', 'namespace']
};
