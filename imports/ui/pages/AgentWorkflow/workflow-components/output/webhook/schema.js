// imports/ui/pages/AgentWorkflow/workflow-components/output/webhook/schema.js

export default {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      format: 'uri',
      minLength: 1
    },
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'POST'
    },
    headers: {
      type: 'object',
      additionalProperties: { type: 'string' },
      default: { 'Content-Type': 'application/json' }
    },
    authentication: {
      type: 'string',
      enum: ['none', 'basic', 'bearer', 'apikey'],
      default: 'none'
    },
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    bearerToken: {
      type: 'string'
    },
    apiKey: {
      type: 'string'
    },
    apiKeyHeader: {
      type: 'string',
      default: 'X-API-Key'
    },
    body: {
      type: 'string',
      default: '{{input}}'
    },
    bodyType: {
      type: 'string',
      enum: ['json', 'form', 'raw'],
      default: 'json'
    },
    queryParams: {
      type: 'object',
      additionalProperties: { type: 'string' },
      default: {}
    },
    timeout: {
      type: 'number',
      minimum: 1000,
      maximum: 300000,
      default: 30000
    },
    retryCount: {
      type: 'number',
      minimum: 0,
      maximum: 10,
      default: 3
    },
    retryDelay: {
      type: 'number',
      minimum: 100,
      maximum: 60000,
      default: 1000
    },
    validateSSL: {
      type: 'boolean',
      default: true
    },
    followRedirects: {
      type: 'boolean',
      default: true
    },
    maxRedirects: {
      type: 'number',
      minimum: 1,
      maximum: 20,
      default: 5
    },
    responseHandling: {
      type: 'string',
      enum: ['json', 'text', 'binary'],
      default: 'json'
    },
    successCodes: {
      type: 'array',
      items: { type: 'number' },
      default: [200, 201, 202, 204]
    },
    errorHandling: {
      type: 'string',
      enum: ['fail', 'continue', 'retry'],
      default: 'fail'
    }
  },
  required: ['url'],
  allOf: [
    {
      if: {
        properties: { authentication: { const: 'basic' } }
      },
      then: {
        required: ['username', 'password']
      }
    },
    {
      if: {
        properties: { authentication: { const: 'bearer' } }
      },
      then: {
        required: ['bearerToken']
      }
    },
    {
      if: {
        properties: { authentication: { const: 'apikey' } }
      },
      then: {
        required: ['apiKey', 'apiKeyHeader']
      }
    }
  ]
};
