// imports/ui/pages/AgentWorkflow/workflow-components/data/s3/schema.js

export default {
  type: 'object',
  properties: {
    operation: {
      type: 'string',
      enum: ['get', 'put', 'delete', 'list'],
      default: 'get'
    },
    bucket: {
      type: 'string',
      minLength: 3,
      maxLength: 63,
      pattern: '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
    },
    key: {
      type: 'string',
      minLength: 1,
      maxLength: 1024
    },
    region: {
      type: 'string',
      default: 'us-east-1'
    },
    endpoint: {
      type: 'string',
      format: 'uri'
    },
    credentials: {
      type: 'object',
      properties: {
        accessKeyId: {
          type: 'string',
          minLength: 16,
          maxLength: 128
        },
        secretAccessKey: {
          type: 'string',
          minLength: 40
        }
      },
      required: ['accessKeyId', 'secretAccessKey']
    },
    options: {
      type: 'object',
      properties: {
        // Get options
        versionId: {
          type: 'string'
        },

        // Put options
        acl: {
          type: 'string',
          enum: ['private', 'public-read', 'public-read-write', 'authenticated-read'],
          default: 'private'
        },
        contentType: {
          type: 'string',
          default: 'auto'
        },
        metadata: {
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        },

        // List options
        prefix: {
          type: 'string'
        },
        delimiter: {
          type: 'string',
          default: '/'
        },
        maxKeys: {
          type: 'number',
          minimum: 1,
          maximum: 1000,
          default: 1000
        }
      }
    }
  },
  required: ['operation', 'bucket', 'credentials']
};
