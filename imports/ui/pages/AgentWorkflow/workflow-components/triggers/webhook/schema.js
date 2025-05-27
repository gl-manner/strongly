// Example: triggers/webhook/schema.js (Optional - for validation)
export default {
  type: 'object',
  properties: {
    method: {
      type: 'string',
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'POST'
    },
    path: {
      type: 'string',
      pattern: '^/.*',
      minLength: 1
    },
    authentication: {
      type: 'string',
      enum: ['none', 'basic', 'bearer', 'api-key'],
      default: 'none'
    },
    headers: {
      type: 'object',
      default: {}
    },
    responseCode: {
      type: 'number',
      minimum: 100,
      maximum: 599,
      default: 200
    },
    responseBody: {
      type: 'string',
      default: '{"success": true}'
    }
  },
  required: ['method', 'path']
};
