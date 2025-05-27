// imports/ui/pages/AgentWorkflow/workflow-components/output/file/metadata.js

export default {
  // Display Information
  label: 'Save to File',
  description: 'Write data to local or remote files',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    fileType: 'local', // local, ftp, sftp
    filePath: '',
    fileName: 'output-{{timestamp}}.json',
    fileFormat: 'json', // json, csv, txt, xml
    encoding: 'utf8',
    writeMode: 'overwrite', // overwrite, append, create
    createDirectories: true,
    // CSV specific options
    csvDelimiter: ',',
    csvHeaders: true,
    csvQuote: '"',
    // JSON specific options
    jsonPretty: true,
    jsonSpacing: 2,
    // FTP/SFTP options
    ftpHost: '',
    ftpPort: 21,
    ftpUser: '',
    ftpPassword: '',
    ftpSecure: false,
    sftpPort: 22,
    sftpPrivateKey: '',
    // File permissions
    filePermissions: '644',
    // Data processing
    dataTemplate: '{{input}}',
    lineTemplate: '', // For line-by-line writing
    batchSize: 1000, // For batch writing
    compression: 'none', // none, gzip, zip
    timestamp: true // Add timestamp to filename
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['file', 'storage', 'export', 'csv', 'json', 'ftp'],

  // Behavior Flags
  isAsync: true, // File operations are async
  requiresAuth: false, // Auth configured per file type
  isBeta: false
};
