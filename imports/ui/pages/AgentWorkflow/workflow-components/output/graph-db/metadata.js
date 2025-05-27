// imports/ui/pages/AgentWorkflow/workflow-components/output/graph-db/metadata.js

export default {
  // Display Information
  label: 'Graph Database',
  description: 'Store data in graph databases (Neo4j, ArangoDB, Neptune)',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    // Graph DB Provider
    provider: 'neo4j', // neo4j, arangodb, neptune, orientdb
    connectionUri: '',
    username: '',
    password: '',
    useEnvCredentials: true,
    envPrefix: 'GRAPH_DB_', // GRAPH_DB_URI, GRAPH_DB_USER, GRAPH_DB_PASSWORD

    // Database configuration
    database: 'neo4j', // Default database

    // Operation type
    operation: 'create', // create, merge, update, delete, query

    // Entity configuration
    entityType: 'node', // node, relationship, both

    // Node operations
    nodeLabel: '',
    nodeProperties: '{{input}}', // Template for node properties
    nodeIdField: 'id', // Field to use as node identifier

    // Relationship operations
    relationshipType: '',
    relationshipProperties: {},
    fromNodeLabel: '',
    fromNodeId: '',
    toNodeLabel: '',
    toNodeId: '',
    relationshipDirection: 'out', // out, in, both

    // Cypher query (for custom operations)
    cypherQuery: '',
    queryParameters: {},

    // Batch operations
    batchSize: 1000,
    transactional: true,

    // Neo4j specific
    neo4j: {
      encryption: true,
      trustStrategy: 'TRUST_ALL_CERTIFICATES',
      maxConnectionPoolSize: 100,
      connectionAcquisitionTimeout: 60000
    },

    // ArangoDB specific
    arangodb: {
      databaseName: '_system',
      collectionType: 'document', // document, edge
      waitForSync: true,
      overwrite: false
    },

    // Neptune specific
    neptune: {
      format: 'property-graph', // property-graph, rdf
      engine: 'gremlin', // gremlin, sparql
      iamAuth: false
    },

    // Advanced options
    timeout: 30000,
    retries: 3,
    returnData: true,
    returnFormat: 'full' // full, id, count
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['graph', 'database', 'neo4j', 'relationships', 'nodes', 'cypher'],

  // Behavior Flags
  isAsync: true, // Graph operations are async
  requiresAuth: true, // Needs database credentials
  isBeta: false
};
