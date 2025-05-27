// imports/ui/pages/AgentWorkflow/workflow-components/output/database/metadata.js

export default {
  // Display Information
  label: 'Database Write',
  description: 'Write data to databases (MongoDB, PostgreSQL, MySQL)',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    databaseType: 'mongodb',
    connectionString: '',
    useEnvVariable: true,
    envVariableName: 'DATABASE_URL',
    database: '',
    collection: '', // For MongoDB
    table: '', // For SQL databases
    operation: 'insert', // insert, update, upsert, replace, delete
    // For insert/replace
    documents: '{{input}}', // Template for documents to insert
    // For update/upsert
    filter: '{}', // Query to find documents to update
    update: '{{input}}', // Update operations
    updateOptions: {
      multi: false, // Update multiple documents
      upsert: false // Create if doesn't exist
    },
    // For delete
    deleteFilter: '{}', // Query to find documents to delete
    deleteOptions: {
      multi: false // Delete multiple documents
    },
    // SQL specific
    sqlOperation: 'INSERT', // INSERT, UPDATE, DELETE
    sqlQuery: '', // Custom SQL query
    onConflict: 'error', // error, ignore, update
    conflictColumns: [], // For upsert operations
    returning: false, // Return inserted/updated rows
    timeout: 30000 // 30 seconds
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['database', 'storage', 'mongodb', 'postgresql', 'mysql', 'write'],

  // Behavior Flags
  isAsync: true, // Database operations are async
  requiresAuth: true, // Needs database credentials
  isBeta: false
};
