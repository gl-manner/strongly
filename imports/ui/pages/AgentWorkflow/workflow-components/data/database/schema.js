// imports/ui/pages/AgentWorkflow/workflow-components/data/database/schema.js

export default {
  type: 'object',
  properties: {
    databaseType: {
      type: 'string',
      enum: ['mongodb', 'postgresql', 'mysql'],
      default: 'mongodb'
    },
    connectionString: {
      type: 'string',
      minLength: 1
    },
    useEnvVariable: {
      type: 'boolean',
      default: true
    },
    envVariableName: {
      type: 'string',
      minLength: 1,
      pattern: '^[A-Z_][A-Z0-9_]*$' // Valid environment variable name
    },
    database: {
      type: 'string',
      minLength: 1
    },
    collection: {
      type: 'string',
      minLength: 1
    },
    table: {
      type: 'string',
      minLength: 1
    },
    query: {
      type: 'string'
    },
    queryType: {
      type: 'string',
      enum: ['find', 'findOne', 'aggregate', 'sql'],
      default: 'find'
    },
    projection: {
      oneOf: [
        { type: 'object' },
        { type: 'string' }
      ]
    },
    sort: {
      oneOf: [
        { type: 'object' },
        { type: 'string' }
      ]
    },
    limit: {
      type: 'number',
      minimum: 0,
      maximum: 10000,
      default: 100
    },
    skip: {
      type: 'number',
      minimum: 0,
      default: 0
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
      // If not using env variable, connection string is required
      if: {
        properties: { useEnvVariable: { const: false } }
      },
      then: {
        required: ['connectionString']
      }
    },
    {
      // If using env variable, env variable name is required
      if: {
        properties: { useEnvVariable: { const: true } }
      },
      then: {
        required: ['envVariableName']
      }
    },
    {
      // MongoDB specific requirements
      if: {
        properties: {
          databaseType: { const: 'mongodb' },
          queryType: { not: { const: 'sql' } }
        }
      },
      then: {
        required: ['collection']
      }
    },
    {
      // SQL database specific requirements
      if: {
        properties: {
          databaseType: { enum: ['postgresql', 'mysql'] },
          queryType: { not: { const: 'sql' } }
        }
      },
      then: {
        required: ['database', 'table']
      }
    },
    {
      // Raw SQL query requirements
      if: {
        properties: { queryType: { const: 'sql' } }
      },
      then: {
        required: ['query']
      }
    }
  ]
};
