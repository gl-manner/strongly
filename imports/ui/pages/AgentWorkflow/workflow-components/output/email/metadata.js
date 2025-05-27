// imports/ui/pages/AgentWorkflow/workflow-components/output/email/metadata.js

export default {
  // Display Information
  label: 'Send Email',
  description: 'Send emails via SMTP or email service providers',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    provider: 'smtp', // smtp, sendgrid, aws-ses, mailgun
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    useEnvCredentials: true,
    envPrefix: 'EMAIL_', // EMAIL_HOST, EMAIL_USER, etc.
    apiKey: '',
    apiKeyEnvVar: 'EMAIL_API_KEY',
    from: '',
    fromName: '',
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    bodyType: 'html', // html, text, both
    body: '',
    attachments: [],
    replyTo: '',
    headers: {},
    trackOpens: false,
    trackClicks: false,
    tags: [],
    metadata: {}
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['email', 'notification', 'smtp', 'sendgrid', 'aws-ses', 'mailgun'],

  // Behavior Flags
  isAsync: true, // Email sending is async
  requiresAuth: true, // Needs email credentials
  isBeta: false
};
