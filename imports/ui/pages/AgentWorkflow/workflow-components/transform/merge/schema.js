// imports/ui/pages/AgentWorkflow/workflow-components/transform/merge/schema.js

export default {
  type: 'object',
  properties: {
    mergeType: {
      type: 'string',
      enum: ['object', 'array', 'concat', 'join', 'custom'],
      default: 'object'
    },
    mergeStrategy: {
      type: 'string',
      enum: ['shallow', 'deep', 'replace'],
      default: 'shallow'
    },
    arrayHandling: {
      type: 'string',
      enum: ['concat', 'merge', 'replace', 'unique'],
      default: 'concat'
    },
    joinOptions: {
      type: 'object',
      properties: {
        separator: {
          type: 'string',
          default: ', '
        },
        prefix: {
          type: 'string',
          default: ''
        },
        suffix: {
          type: 'string',
          default: ''
        }
      }
    },
    keyMapping: {
      type: 'object',
      additionalProperties: {
        type: 'string'
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
        skipEmpty: {
          type: 'boolean',
          default: true
        },
        removeDuplicates: {
          type: 'boolean',
          default: false
        },
        preserveArrayOrder: {
          type: 'boolean',
          default: true
        }
      }
    }
  },
  required: ['mergeType']
};
