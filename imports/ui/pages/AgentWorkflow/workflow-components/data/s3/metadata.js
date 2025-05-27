// imports/ui/pages/AgentWorkflow/workflow-components/data/s3/metadata.js

export default {
  // Display Information
  label: 'S3 Storage',
  description: 'Read and write files to Amazon S3 or S3-compatible storage',
  color: '#3b82f6', // Orange

  // Default Configuration
  defaultData: {
    operation: 'get', // get, put, delete, list
    bucket: '',
    key: '',
    region: 'us-east-1',
    endpoint: '', // For S3-compatible services
    credentials: {
      accessKeyId: '',
      secretAccessKey: ''
    },
    options: {
      // Get options
      versionId: '',

      // Put options
      acl: 'private', // private, public-read, public-read-write
      contentType: 'auto',
      metadata: {},

      // List options
      prefix: '',
      delimiter: '/',
      maxKeys: 1000
    }
  },

  // Connection Rules
  allowedInputs: ['triggers', 'data', 'transform', 'ai'],
  allowedOutputs: ['*'],
  maxInputs: -1,
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['s3', 'aws', 'storage', 'cloud', 'bucket', 'object'],

  // Behavior Flags
  isAsync: true,
  requiresAuth: true,
  isBeta: false
};
