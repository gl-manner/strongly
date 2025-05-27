// imports/ui/pages/AgentWorkflow/workflow-components/data/file/schema.js

export default {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      enum: ['upload', 'path', 'url'],
      default: 'upload'
    },
    filePath: {
      type: 'string'
    },
    fileUrl: {
      type: 'string',
      format: 'uri'
    },
    fileType: {
      type: 'string',
      enum: ['auto', 'text', 'json', 'csv', 'xml', 'binary'],
      default: 'auto'
    },
    encoding: {
      type: 'string',
      enum: ['utf-8', 'utf-16', 'ascii', 'latin1'],
      default: 'utf-8'
    },
    parseOptions: {
      type: 'object',
      properties: {
        csv: {
          type: 'object',
          properties: {
            delimiter: {
              type: 'string',
              maxLength: 1,
              default: ','
            },
            hasHeaders: {
              type: 'boolean',
              default: true
            },
            skipEmptyLines: {
              type: 'boolean',
              default: true
            }
          }
        },
        json: {
          type: 'object',
          properties: {
            strict: {
              type: 'boolean',
              default: false
            }
          }
        }
      }
    }
  },
  required: ['source', 'fileType']
};
