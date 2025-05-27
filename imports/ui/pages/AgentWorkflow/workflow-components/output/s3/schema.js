// imports/ui/pages/AgentWorkflow/workflow-components/output/s3/schema.js

export default {
  type: 'object',
  properties: {
    bucketName: {
      type: 'string',
      minLength: 3,
      maxLength: 63,
      pattern: '^[a-z0-9][a-z0-9.-]*[a-z0-9]$'
    },
    objectKey: {
      type: 'string',
      minLength: 1,
      maxLength: 1024,
      default: 'data/{{timestamp}}/output.json'
    },
    region: {
      type: 'string',
      default: 'us-east-1'
    },
    endpoint: {
      type: 'string',
      format: 'uri'
    },
    accessKeyId: {
      type: 'string',
      minLength: 16,
      maxLength: 128
    },
    secretAccessKey: {
      type: 'string',
      minLength: 1
    },
    useEnvCredentials: {
      type: 'boolean',
      default: true
    },
    envPrefix: {
      type: 'string',
      default: 'AWS_',
      pattern: '^[A-Z_][A-Z0-9_]*$'
    },
    contentType: {
      type: 'string',
      default: 'application/json'
    },
    contentEncoding: {
      type: 'string'
    },
    cacheControl: {
      type: 'string'
    },
    acl: {
      type: 'string',
      enum: [
        'private',
        'public-read',
        'public-read-write',
        'authenticated-read',
        'bucket-owner-read',
        'bucket-owner-full-control'
      ],
      default: 'private'
    },
    storageClass: {
      type: 'string',
      enum: [
        'STANDARD',
        'STANDARD_IA',
        'ONEZONE_IA',
        'INTELLIGENT_TIERING',
        'GLACIER',
        'GLACIER_IR',
        'DEEP_ARCHIVE'
      ],
      default: 'STANDARD'
    },
    serverSideEncryption: {
      type: 'string',
      enum: ['none', 'AES256', 'aws:kms'],
      default: 'none'
    },
    kmsKeyId: {
      type: 'string'
    },
    metadata: {
      type: 'object',
      additionalProperties: { type: 'string' },
      default: {}
    },
    tags: {
      type: 'object',
      additionalProperties: { type: 'string' },
      default: {}
    },
    dataFormat: {
      type: 'string',
      enum: ['json', 'csv', 'text', 'binary'],
      default: 'json'
    },
    jsonPretty: {
      type: 'boolean',
      default: true
    },
    csvDelimiter: {
      type: 'string',
      maxLength: 1,
      default: ','
    },
    csvHeaders: {
      type: 'boolean',
      default: true
    },
    compression: {
      type: 'string',
      enum: ['none', 'gzip'],
      default: 'none'
    },
    partSize: {
      type: 'number',
      minimum: 5242880, // 5MB
      maximum: 104857600, // 100MB
      default: 5242880
    },
    queueSize: {
      type: 'number',
      minimum: 1,
      maximum: 10,
      default: 4
    },
    timeout: {
      type: 'number',
      minimum: 10000,
      maximum: 600000,
      default: 60000
    },
    retries: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      default: 3
    },
    versioningEnabled: {
      type: 'boolean',
      default: false
    },
    deleteOldVersions: {
      type: 'boolean',
      default: false
    },
    maxVersions: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      default: 10
    }
  },
  required: ['bucketName', 'objectKey'],
  allOf: [
    {
      // Credential requirements
      if: {
        properties: { useEnvCredentials: { const: false } }
      },
      then: {
        required: ['accessKeyId', 'secretAccessKey']
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
      // KMS encryption requirements
      if: {
        properties: { serverSideEncryption: { const: 'aws:kms' } }
      },
      then: {
        required: ['kmsKeyId']
      }
    },
    {
      // CSV format requirements
      if: {
        properties: { dataFormat: { const: 'csv' } }
      },
      then: {
        required: ['csvDelimiter']
      }
    }
  ]
};
