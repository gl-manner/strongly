// imports/ui/pages/AgentWorkflow/workflow-components/output/graph-db/schema.js

export default {
  type: 'object',
  properties: {
    provider: {
      type: 'string',
      enum: ['neo4j', 'arangodb', 'neptune', 'orientdb'],
      default: 'neo4j'
    },
    connectionUri: {
      type: 'string'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    useEnvCredentials: {
      type: 'boolean',
      default: true
    },
    envPrefix: {
      type: 'string',
      default: 'GRAPH_DB_',
      pattern: '^[A-Z_][A-Z0-9_]*$'
    },
    database: {
      type: 'string',
      default: 'neo4j'
    },
    operation: {
      type: 'string',
      enum: ['create', 'merge', 'update', 'delete', 'query'],
      default: 'create'
    },
    entityType: {
      type: 'string',
      enum: ['node', 'relationship', 'both'],
      default: 'node'
    },
    nodeLabel: {
      type: 'string'
    },
    nodeProperties: {
      type: 'string',
      default: '{{input}}'
    },
    nodeIdField: {
      type: 'string',
      default: 'id'
    },
    relationshipType: {
      type: 'string'
    },
    relationshipProperties: {
      type: 'object',
      default: {}
    },
    fromNodeLabel: {
      type: 'string'
    },
    fromNodeId: {
      type: 'string'
    },
    toNodeLabel: {
      type: 'string'
    },
    toNodeId: {
      type: 'string'
    },
    relationshipDirection: {
      type: 'string',
      enum: ['out', 'in', 'both'],
      default: 'out'
    },
    cypherQuery: {
      type: 'string'
    },
    queryParameters: {
      type: 'object',
      default: {}
    },
    batchSize: {
      type: 'number',
      minimum: 1,
      maximum: 10000,
      default: 1000
    },
    transactional: {
      type: 'boolean',
      default: true
    },
    neo4j: {
      type: 'object',
      properties: {
        encryption: {
          type: 'boolean',
          default: true
        },
        trustStrategy: {
          type: 'string',
          default: 'TRUST_ALL_CERTIFICATES'
        },
        maxConnectionPoolSize: {
          type: 'number',
          default: 100
        },
        connectionAcquisitionTimeout: {
          type: 'number',
          default: 60000
        }
      },
      default: {}
    },
    arangodb: {
      type: 'object',
      properties: {
        databaseName: {
          type: 'string',
          default: '_system'
        },
        collectionType: {
          type: 'string',
          enum: ['document', 'edge'],
          default: 'document'
        },
        waitForSync: {
          type: 'boolean',
          default: true
        },
        overwrite: {
          type: 'boolean',
          default: false
        }
      },
      default: {}
    },
    neptune: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['property-graph', 'rdf'],
          default: 'property-graph'
        },
        engine: {
          type: 'string',
          enum: ['gremlin', 'sparql'],
          default: 'gremlin'
        },
        iamAuth: {
          type: 'boolean',
          default: false
        }
      },
      default: {}
    },
    timeout: {
      type: 'number',
      minimum: 1000,
      maximum: 300000,
      default: 30000
    },
    retries: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      default: 3
    },
    returnData: {
      type: 'boolean',
      default: true
    },
    returnFormat: {
      type: 'string',
      enum: ['full', 'id', 'count'],
      default: 'full'
    }
  },
  required: [],
  allOf: [
    {
      // Connection requirements
      if: {
        properties: { useEnvCredentials: { const: false } }
      },
      then: {
        required: ['connectionUri']
      }
    },
    {
      // Environment variable requirements
      if: {
        properties: { useEnvCredentials: { const: true } }
      },
      then: {
        required: ['envPrefix']
      }
    },
    {
      // Node operation requirements
      if: {
        properties: {
          entityType: { const: 'node' },
          operation: { not: { const: 'query' } }
        }
      },
      then: {
        required: ['nodeLabel']
      }
    },
    {
      // Relationship operation requirements
      if: {
        properties: {
          entityType: { const: 'relationship' },
          operation: { not: { const: 'query' } }
        }
      },
      then: {
        required: ['relationshipType', 'fromNodeLabel', 'fromNodeId', 'toNodeLabel', 'toNodeId']
      }
    },
    {
      // Query operation requirements
      if: {
        properties: { operation: { const: 'query' } }
      },
      then: {
        required: ['cypherQuery']
      }
    },
    {
      // Database requirement for non-ArangoDB
      if: {
        properties: { provider: { not: { const: 'arangodb' } } }
      },
      then: {
        required: ['database']
      }
    }
  ]
};
