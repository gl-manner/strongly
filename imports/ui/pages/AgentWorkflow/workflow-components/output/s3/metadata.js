// imports/ui/pages/AgentWorkflow/workflow-components/output/s3/metadata.js

export default {
  // Display Information
  label: 'Save to S3',
  description: 'Upload data to Amazon S3 or S3-compatible storage',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    // S3 Configuration
    bucketName: '',
    objectKey: 'data/{{timestamp}}/output.json',
    region: 'us-east-1',
    endpoint: '', // For S3-compatible services
    accessKeyId: '',
    secretAccessKey: '',
    useEnvCredentials: true,
    envPrefix: 'AWS_', // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
    // Upload options
    contentType: 'application/json',
    contentEncoding: '',
    cacheControl: '',
    acl: 'private', // private, public-read, public-read-write, etc.
    storageClass: 'STANDARD', // STANDARD, STANDARD_IA, GLACIER, etc.
    serverSideEncryption: 'none', // none, AES256, aws:kms
    kmsKeyId: '',
    metadata: {},
    tags: {},
    // Data processing
    dataFormat: 'json', // json, csv, text, binary
    jsonPretty: true,
    csvDelimiter: ',',
    csvHeaders: true,
    compression: 'none', // none, gzip
    // Advanced options
    partSize: 5242880, // 5MB - for multipart uploads
    queueSize: 4, // Concurrent parts for multipart
    timeout: 60000, // 60 seconds
    retries: 3,
    // Versioning
    versioningEnabled: false,
    deleteOldVersions: false,
    maxVersions: 10
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['s3', 'aws', 'storage', 'cloud', 'upload'],

  // Behavior Flags
  isAsync: true, // S3 operations are async
  requiresAuth: true, // Needs AWS credentials
  isBeta: false
};
