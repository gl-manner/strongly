// imports/ui/pages/AgentWorkflow/workflow-components/transform/map/schema.js

export default {
  type: 'object',
  properties: {
    mapType: {
      type: 'string',
      enum: ['template', 'fields', 'custom'],
      default: 'template'
    },
    template: {
      type: 'object',
      additionalProperties: true
    },
    fieldMappings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: {
            type: 'string'
          },
          target: {
            type: 'string'
          },
          transform: {
            type: 'string',
            enum: [
              'none', 'uppercase', 'lowercase', 'capitalize', 'trim',
              'number', 'boolean', 'string', 'date', 'json', 'stringify',
              'base64', 'base64decode'
            ],
            default: 'none'
          },
          defaultValue: {
            type: 'string'
          }
        },
        required: ['source', 'target']
      }
    },
    customFunction: {
      type: 'string'
    },
    options: {
      type: 'object',
      properties: {
        skipNull: {
          type: 'boolean',
          default: true
        },
        flattenResult: {
          type: 'boolean',
          default: false
        },
        preserveOriginal: {
          type: 'boolean',
          default: false
        }
      }
    }
  },
  required: ['mapType']
};
