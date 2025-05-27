// imports/ui/pages/AgentWorkflow/workflow-components/output/database/schema.js

export default {
  type: 'object',
  properties: {
    databaseType: {
      type: 'string',
      enum: ['mongodb', 'postgresql', 'mysql'],
      default: 'mongodb'
    },
    connectionString: {
      type: 'string'
    },
    useEnvVariable: {
      type: 'boolean',
      default: true
    },
    envVariableName: {
      type: 'string',
      default: 'DATABASE_URL',
      pattern: '^[A-Z_][A-Z0-9_]*$'
    },
    database: {
      type: 'string'
    },
    collection: {
      type: 'string'
    },
    table: {
      type: 'string'
    },
    operation: {
      type: 'string',
      enum: ['insert', 'update', 'upsert', 'replace', 'delete', 'custom'],
      default: 'insert'
    },
    documents: {
      type: 'string',
      default: '{{input}}'
    },
    filter: {
      type: 'string',
      default: '{}'
    },
    update: {
      type: 'string',
      default: '{{input}}'
    },
    updateOptions: {
      type: 'object',
      properties: {
        multi: {
          type: 'boolean',
          default: false
        },
        upsert: {
          type: 'boolean',
          default: false
        }
      },
      default: {}
    },
    deleteFilter: {
      type: 'string',
      default: '{}'
    },
    deleteOptions: {
      type: 'object',
      properties: {
        multi: {
          type: 'boolean',
          default: false
        }
      },
      default: {}
    },
    sqlOperation: {
      type: 'string',
      enum: ['INSERT', 'UPDATE', 'DELETE'],
      default: 'INSERT'
    },
    sqlQuery: {
      type: 'string'
    },
    onConflict: {
      type: 'string',
      enum: ['error', 'ignore', 'update'],
      default: 'error'
    },
    conflictColumns: {
      type: 'array',
      items: { type: 'string' },
      default: []
    },
    returning: {
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'number',
      minimum: 1000,
      maximum: 300000,
      default: 30000
    }
  },
  required: [],
  allOf: [
    {
      // Connection string requirement
      if: {
        properties: { useEnvVariable: { const: false } }
      },
      then: {
        required: ['connectionString']
      }
    },
    {
      // Environment variable requirement
      if: {
        properties: { useEnvVariable: { const: true } }
      },
      then: {
        required: ['envVariableName']
      }
    },
    {
      // MongoDB collection requirement
      if: {
        properties: {
          databaseType: { const: 'mongodb' },
          operation: { not: { const: 'custom' } }
        }
      },
      then: {
        required: ['collection']
      }
    },
    {
      // SQL table requirement
      if: {
        properties: {
          databaseType: { enum: ['postgresql', 'mysql'] },
          operation: { not: { const: 'custom' } }
        }
      },
      then: {
        required: ['database', 'table']
      }
    },
    {
      // Custom SQL query requirement
      if: {
        properties: {
          operation: { const: 'custom' },
          databaseType: { enum: ['postgresql', 'mysql'] }
        }
      },
      then: {
        required: ['sqlQuery']
      }
    }
  ]
};
