// imports/ui/pages/AgentWorkflow/workflow-components/data/database/metadata.js

export default {
  // Display Information
  label: 'Database Query',
  description: 'Query data from various database systems (MongoDB, PostgreSQL, MySQL)',
  color: '#3b82f6', // Green color for data components

  // Default Configuration
  defaultData: {
    databaseType: 'mongodb',
    connectionString: '',
    useEnvVariable: true,
    envVariableName: 'DATABASE_URL',
    database: '',
    collection: '', // For MongoDB
    table: '', // For SQL databases
    query: '',
    queryType: 'find', // find, findOne, aggregate, sql
    projection: {},
    sort: {},
    limit: 100,
    skip: 0,
    timeout: 30000 // 30 seconds
  },

  // Connection Rules
  allowedInputs: ['triggers', 'transform'], // Can be triggered or receive transformed data
  allowedOutputs: ['*'], // Can connect to anything
  maxInputs: 1, // Only one input trigger
  maxOutputs: -1, // Unlimited outputs

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['database', 'query', 'mongodb', 'postgresql', 'mysql', 'data'],

  // Behavior Flags
  isAsync: true, // Database operations are async
  requiresAuth: true, // Needs database credentials
  isBeta: false
};
