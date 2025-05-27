// imports/ui/pages/AgentWorkflow/workflow-components/transform/filter/schema.js

export default {
  type: 'object',
  properties: {
    filterType: {
      type: 'string',
      enum: ['simple', 'advanced', 'custom'],
      default: 'simple'
    },
    conditions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: {
            type: 'string'
          },
          operator: {
            type: 'string',
            enum: [
              'equals', 'not_equals', 'contains', 'not_contains',
              'starts_with', 'ends_with', 'greater_than', 'less_than',
              'greater_equal', 'less_equal', 'in', 'not_in',
              'is_empty', 'is_not_empty', 'is_null', 'is_not_null', 'regex'
            ]
          },
          value: {
            type: 'string'
          },
          caseSensitive: {
            type: 'boolean',
            default: false
          }
        },
        required: ['field', 'operator']
      }
    },
    logic: {
      type: 'string',
      enum: ['and', 'or'],
      default: 'and'
    },
    advancedExpression: {
      type: 'string'
    },
    customFunction: {
      type: 'string'
    },
    options: {
      type: 'object',
      properties: {
        keepEmpty: {
          type: 'boolean',
          default: false
        },
        deepFilter: {
          type: 'boolean',
          default: false
        },
        returnFirst: {
          type: 'boolean',
          default: false
        }
      }
    }
  },
  required: ['filterType']
};
