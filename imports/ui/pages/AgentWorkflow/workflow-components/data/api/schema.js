// imports/ui/pages/AgentWorkflow/workflow-components/data/api/schema.js

export default {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET'
    },
    url: {
      type: 'string',
      format: 'uri',
      minLength: 1
    },
    headers: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    },
    body: {
      type: 'string'
    },
    authentication: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['none', 'basic', 'bearer', 'apiKey'],
          default: 'none'
        },
        credentials: {
          type: 'object',
          additionalProperties: true
        }
      }
    },
    timeout: {
      type: 'number',
      minimum: 0,
      maximum: 300000, // 5 minutes
      default: 30000
    },
    retries: {
      type: 'number',
      minimum: 0,
      maximum: 5,
      default: 0
    },
    responseType: {
      type: 'string',
      enum: ['json', 'text', 'blob'],
      default: 'json'
    }
  },
  required: ['method', 'url']
};
