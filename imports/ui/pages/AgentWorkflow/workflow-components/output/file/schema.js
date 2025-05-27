// imports/ui/pages/AgentWorkflow/workflow-components/output/file/schema.js

export default {
  type: 'object',
  properties: {
    fileType: {
      type: 'string',
      enum: ['local', 'ftp', 'sftp'],
      default: 'local'
    },
    filePath: {
      type: 'string'
    },
    fileName: {
      type: 'string',
      minLength: 1,
      default: 'output-{{timestamp}}.json'
    },
    fileFormat: {
      type: 'string',
      enum: ['json', 'csv', 'txt', 'xml'],
      default: 'json'
    },
    encoding: {
      type: 'string',
      enum: ['utf8', 'utf16le', 'latin1', 'ascii'],
      default: 'utf8'
    },
    writeMode: {
      type: 'string',
      enum: ['overwrite', 'append', 'create'],
      default: 'overwrite'
    },
    createDirectories: {
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
    csvQuote: {
      type: 'string',
      maxLength: 1,
      default: '"'
    },
    jsonPretty: {
      type: 'boolean',
      default: true
    },
    jsonSpacing: {
      type: 'number',
      minimum: 0,
      maximum: 8,
      default: 2
    },
    ftpHost: {
      type: 'string'
    },
    ftpPort: {
      type: 'number',
      minimum: 1,
      maximum: 65535,
      default: 21
    },
    ftpUser: {
      type: 'string'
    },
    ftpPassword: {
      type: 'string'
    },
    ftpSecure: {
      type: 'boolean',
      default: false
    },
    sftpPort: {
      type: 'number',
      minimum: 1,
      maximum: 65535,
      default: 22
    },
    sftpPrivateKey: {
      type: 'string'
    },
    filePermissions: {
      type: 'string',
      pattern: '^[0-7]{3}$',
      default: '644'
    },
    dataTemplate: {
      type: 'string',
      default: '{{input}}'
    },
    lineTemplate: {
      type: 'string'
    },
    batchSize: {
      type: 'number',
      minimum: 1,
      maximum: 100000,
      default: 1000
    },
    compression: {
      type: 'string',
      enum: ['none', 'gzip', 'zip'],
      default: 'none'
    },
    timestamp: {
      type: 'boolean',
      default: true
    }
  },
  required: ['fileName'],
  allOf: [
    {
      // Local file requirements
      if: {
        properties: { fileType: { const: 'local' } }
      },
      then: {
        required: ['filePath']
      }
    },
    {
      // FTP requirements
      if: {
        properties: { fileType: { const: 'ftp' } }
      },
      then: {
        required: ['ftpHost', 'ftpUser', 'ftpPassword']
      }
    },
    {
      // SFTP requirements
      if: {
        properties: { fileType: { const: 'sftp' } }
      },
      then: {
        required: ['ftpHost', 'ftpUser'],
        // Either password or private key required
        anyOf: [
          { required: ['ftpPassword'] },
          { required: ['sftpPrivateKey'] }
        ]
      }
    },
    {
      // CSV specific requirements
      if: {
        properties: { fileFormat: { const: 'csv' } }
      },
      then: {
        required: ['csvDelimiter']
      }
    }
  ]
};
