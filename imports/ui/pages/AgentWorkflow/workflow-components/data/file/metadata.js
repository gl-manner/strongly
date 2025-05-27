// imports/ui/pages/AgentWorkflow/workflow-components/data/file/metadata.js

export default {
  // Display Information
  label: 'Read File',
  description: 'Read data from local files or uploaded documents',
  color: '#3b82f6', // Emerald green

  // Default Configuration
  defaultData: {
    source: 'upload', // upload, path, url
    filePath: '',
    fileUrl: '',
    fileType: 'auto', // auto, text, json, csv, xml, binary
    encoding: 'utf-8',
    parseOptions: {
      csv: {
        delimiter: ',',
        hasHeaders: true,
        skipEmptyLines: true
      },
      json: {
        strict: false
      }
    }
  },

  // Connection Rules
  allowedInputs: ['triggers', 'data', 'transform', 'ai'],
  allowedOutputs: ['*'],
  maxInputs: -1,
  maxOutputs: -1,

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['file', 'read', 'upload', 'csv', 'json', 'text', 'document'],

  // Behavior Flags
  isAsync: true,
  requiresAuth: false,
  isBeta: false
};
