// imports/ui/pages/AgentWorkflow/workflow-components/data/file/executor.js

import { Meteor } from 'meteor/meteor';
import Papa from 'papaparse';

export default async function executeFileRead(context) {
  const { node, input, services } = context;
  const {
    source,
    filePath,
    fileUrl,
    fileType,
    encoding,
    parseOptions,
    uploadedFile
  } = node.data;

  try {
    let fileContent;
    let detectedType = fileType;

    // Get file content based on source
    if (source === 'upload') {
      if (!uploadedFile) {
        throw new Error('No file uploaded');
      }
      // In a real implementation, you'd retrieve the uploaded file content
      // This would typically be stored in GridFS or similar
      fileContent = await services.getUploadedFile(uploadedFile);
    } else if (source === 'path') {
      if (!filePath) {
        throw new Error('File path is required');
      }
      // Read file from server file system
      fileContent = await services.readFile(filePath, encoding);
    } else if (source === 'url') {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }
      // Fetch file from URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      fileContent = await response.text();
    }

    // Auto-detect file type if needed
    if (detectedType === 'auto') {
      if (source === 'upload' && uploadedFile?.type) {
        // Use MIME type from uploaded file
        if (uploadedFile.type.includes('json')) {
          detectedType = 'json';
        } else if (uploadedFile.type.includes('csv')) {
          detectedType = 'csv';
        } else if (uploadedFile.type.includes('xml')) {
          detectedType = 'xml';
        } else {
          detectedType = 'text';
        }
      } else {
        // Try to detect from content or extension
        const extension = (filePath || fileUrl || '').split('.').pop().toLowerCase();
        if (extension === 'json') {
          detectedType = 'json';
        } else if (extension === 'csv') {
          detectedType = 'csv';
        } else if (extension === 'xml') {
          detectedType = 'xml';
        } else {
          // Try to parse as JSON
          try {
            JSON.parse(fileContent);
            detectedType = 'json';
          } catch {
            // Check if it looks like CSV
            if (fileContent.includes(',') && fileContent.includes('\n')) {
              detectedType = 'csv';
            } else {
              detectedType = 'text';
            }
          }
        }
      }
    }

    // Parse content based on type
    let parsedData;
    switch (detectedType) {
      case 'json':
        try {
          parsedData = JSON.parse(fileContent);
        } catch (error) {
          if (parseOptions?.json?.strict) {
            throw new Error(`Invalid JSON: ${error.message}`);
          }
          // Try to clean and parse
          const cleaned = fileContent.replace(/^\uFEFF/, '').trim();
          parsedData = JSON.parse(cleaned);
        }
        break;

      case 'csv':
        const csvOptions = {
          delimiter: parseOptions?.csv?.delimiter || ',',
          header: parseOptions?.csv?.hasHeaders ?? true,
          skipEmptyLines: parseOptions?.csv?.skipEmptyLines ?? true,
          dynamicTyping: true
        };

        const parseResult = Papa.parse(fileContent, csvOptions);
        if (parseResult.errors.length > 0 && parseOptions?.csv?.strict) {
          throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
        }
        parsedData = parseResult.data;
        break;

      case 'xml':
        // Basic XML to JSON conversion
        // In production, you'd use a proper XML parser
        parsedData = {
          type: 'xml',
          content: fileContent,
          message: 'XML parsing not fully implemented. Raw content provided.'
        };
        break;

      case 'binary':
        parsedData = {
          type: 'binary',
          size: fileContent.length,
          encoding: encoding,
          message: 'Binary data loaded'
        };
        break;

      default:
        parsedData = fileContent;
    }

    return {
      success: true,
      data: parsedData,
      metadata: {
        source,
        fileType: detectedType,
        encoding,
        size: fileContent.length,
        timestamp: new Date(),
        ...(uploadedFile && { fileName: uploadedFile.name })
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        source,
        fileType,
        timestamp: new Date()
      }
    };
  }
}
