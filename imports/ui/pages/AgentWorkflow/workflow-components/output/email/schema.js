// imports/ui/pages/AgentWorkflow/workflow-components/output/email/schema.js

export default {
  type: 'object',
  properties: {
    provider: {
      type: 'string',
      enum: ['smtp', 'sendgrid', 'aws-ses', 'mailgun'],
      default: 'smtp'
    },
    smtpHost: {
      type: 'string'
    },
    smtpPort: {
      type: 'number',
      minimum: 1,
      maximum: 65535,
      default: 587
    },
    smtpSecure: {
      type: 'boolean',
      default: false
    },
    smtpUser: {
      type: 'string'
    },
    smtpPassword: {
      type: 'string'
    },
    useEnvCredentials: {
      type: 'boolean',
      default: true
    },
    envPrefix: {
      type: 'string',
      default: 'EMAIL_'
    },
    apiKey: {
      type: 'string'
    },
    apiKeyEnvVar: {
      type: 'string',
      default: 'EMAIL_API_KEY'
    },
    from: {
      type: 'string',
      format: 'email'
    },
    fromName: {
      type: 'string'
    },
    to: {
      type: 'string',
      minLength: 1
    },
    cc: {
      type: 'string'
    },
    bcc: {
      type: 'string'
    },
    subject: {
      type: 'string',
      minLength: 1
    },
    bodyType: {
      type: 'string',
      enum: ['html', 'text', 'both'],
      default: 'html'
    },
    body: {
      type: 'string',
      minLength: 1
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          content: { type: 'string' },
          contentType: { type: 'string' }
        }
      },
      default: []
    },
    replyTo: {
      type: 'string'
    },
    headers: {
      type: 'object',
      additionalProperties: { type: 'string' },
      default: {}
    },
    trackOpens: {
      type: 'boolean',
      default: false
    },
    trackClicks: {
      type: 'boolean',
      default: false
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      default: []
    },
    metadata: {
      type: 'object',
      default: {}
    }
  },
  required: ['from', 'to', 'subject', 'body'],
  allOf: [
    {
      if: {
        properties: {
          provider: { const: 'smtp' },
          useEnvCredentials: { const: false }
        }
      },
      then: {
        required: ['smtpHost', 'smtpUser', 'smtpPassword']
      }
    },
    {
      if: {
        properties: {
          provider: { not: { const: 'smtp' } },
          useEnvCredentials: { const: false }
        }
      },
      then: {
        required: ['apiKey']
      }
    }
  ]
};
