// imports/ui/pages/AgentWorkflow/workflow-components/output/file/executor.js

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import zlib from 'zlib';
import archiver from 'archiver';
import ftp from 'basic-ftp';
import { Client as SSHClient } from 'ssh2';
import csv from 'csv-stringify';
import { create as xmlbuilder } from 'xmlbuilder2';

export default async function executeFileOutput(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Process filename template
    const fileName = processFileNameTemplate(data.fileName, data.timestamp);

    // Process data template
    const processedData = processDataTemplate(data.dataTemplate, input, data.fileFormat);

    // Format data based on file format
    const formattedContent = await formatContent(processedData, data, input);

    // Write file based on type
    let result;
    switch (data.fileType) {
      case 'local':
        result = await writeLocalFile(fileName, formattedContent, data);
        break;
      case 'ftp':
        result = await writeFTPFile(fileName, formattedContent, data);
        break;
      case 'sftp':
        result = await writeSFTPFile(fileName, formattedContent, data);
        break;
      default:
        throw new Error(`Unsupported file type: ${data.fileType}`);
    }

    return {
      success: true,
      data: {
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
        recordsWritten: result.recordsWritten
      },
      metadata: {
        fileType: data.fileType,
        fileFormat: data.fileFormat,
        compression: data.compression,
        writtenAt: new Date()
      }
    };

  } catch (error) {
    console.error('File output error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        fileName: data.fileName,
        fileType: data.fileType
      }
    };
  }
}

function processFileNameTemplate(template, addTimestamp) {
  let fileName = template;

  // Replace template variables
  const now = new Date();
  const replacements = {
    timestamp: now.getTime(),
    date: now.toISOString().split('T')[0],
    datetime: now.toISOString().replace(/[:.]/g, '-'),
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
    day: String(now.getDate()).padStart(2, '0'),
    hour: String(now.getHours()).padStart(2, '0'),
    minute: String(now.getMinutes()).padStart(2, '0'),
    second: String(now.getSeconds()).padStart(2, '0')
  };

  Object.entries(replacements).forEach(([key, value]) => {
    fileName = fileName.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  // Add timestamp if enabled and not already in filename
  if (addTimestamp && !fileName.includes(String(replacements.timestamp))) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    fileName = `${base}-${replacements.timestamp}${ext}`;
  }

  return fileName;
}

function processDataTemplate(template, data, format) {
  if (!template || template.trim() === '{{input}}') {
    return data;
  }

  // Replace template variables
  let processed = template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    if (value !== undefined) {
      // For non-JSON formats, stringify objects/arrays
      if (format !== 'json' && typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value;
    }
    return match;
  });

  // For JSON format, try to parse the template result
  if (format === 'json' && typeof processed === 'string') {
    try {
      return JSON.parse(processed);
    } catch (e) {
      // If not valid JSON, return as is
    }
  }

  return processed;
}

async function formatContent(data, config, originalInput) {
  switch (config.fileFormat) {
    case 'json':
      return formatJSON(data, config);

    case 'csv':
      return formatCSV(data, config, originalInput);

    case 'txt':
      return formatText(data, config, originalInput);

    case 'xml':
      return formatXML(data, config);

    default:
      return String(data);
  }
}

function formatJSON(data, config) {
  if (config.jsonPretty) {
    return JSON.stringify(data, null, config.jsonSpacing || 2);
  }
  return JSON.stringify(data);
}

async function formatCSV(data, config, originalInput) {
  // Ensure data is an array
  let records = Array.isArray(data) ? data : [data];

  // If lineTemplate is provided, use it to format each record
  if (config.lineTemplate) {
    records = records.map(record => {
      let line = config.lineTemplate;
      Object.entries(record).forEach(([key, value]) => {
        line = line.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
      });
      return line;
    });

    // Join with newlines for custom formatted CSV
    return records.join('\n');
  }

  // Use csv-stringify for standard CSV formatting
  return new Promise((resolve, reject) => {
    const options = {
      header: config.csvHeaders ?? true,
      delimiter: config.csvDelimiter || ',',
      quoted: true,
      quoted_string: true,
      quote: config.csvQuote || '"'
    };

    csv.stringify(records, options, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}

function formatText(data, config, originalInput) {
  // If lineTemplate is provided, format each item
  if (config.lineTemplate && Array.isArray(data)) {
    return data.map(item => {
      let line = config.lineTemplate;
      if (typeof item === 'object') {
        Object.entries(item).forEach(([key, value]) => {
          line = line.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
        });
      } else {
        line = line.replace(/\{\{input\}\}/g, item);
      }
      return line;
    }).join('\n');
  }

  // Default text formatting
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }

  return String(data);
}

function formatXML(data, config) {
  try {
    // If data is already XML string, return as is
    if (typeof data === 'string' && data.trim().startsWith('<')) {
      return data;
    }

    // Convert object to XML
    const doc = xmlbuilder({ root: data });
    return doc.end({ prettyPrint: true });
  } catch (e) {
    // Fallback to simple XML generation
    return `<?xml version="1.0" encoding="UTF-8"?>\n<root>${JSON.stringify(data)}</root>`;
  }
}

async function writeLocalFile(fileName, content, config) {
  const fullPath = path.join(config.filePath || '', fileName);
  const directory = path.dirname(fullPath);

  // Create directories if needed
  if (config.createDirectories) {
    await fs.mkdir(directory, { recursive: true });
  }

  // Check write mode
  if (config.writeMode === 'create') {
    // Check if file exists
    try {
      await fs.access(fullPath);
      throw new Error(`File already exists: ${fullPath}`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }

  // Prepare content buffer
  let contentBuffer = Buffer.from(content, config.encoding || 'utf8');

  // Apply compression if needed
  if (config.compression === 'gzip') {
    contentBuffer = await new Promise((resolve, reject) => {
      zlib.gzip(contentBuffer, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    fileName += '.gz';
  } else if (config.compression === 'zip') {
    // For zip, we need to use archiver
    const zipPath = fullPath + '.zip';
    await createZipFile(zipPath, fileName, contentBuffer);

    const stats = await fs.stat(zipPath);
    return {
      fileName: fileName + '.zip',
      filePath: zipPath,
      fileSize: stats.size,
      recordsWritten: Array.isArray(JSON.parse(content)) ? JSON.parse(content).length : 1
    };
  }

  // Write file
  if (config.writeMode === 'append') {
    await fs.appendFile(fullPath, contentBuffer);
  } else {
    await fs.writeFile(fullPath, contentBuffer);
  }

  // Set permissions if specified (Unix only)
  if (config.filePermissions && process.platform !== 'win32') {
    const mode = parseInt(config.filePermissions, 8);
    await fs.chmod(fullPath, mode);
  }

  // Get file stats
  const stats = await fs.stat(fullPath);

  return {
    fileName,
    filePath: fullPath,
    fileSize: stats.size,
    recordsWritten: Array.isArray(content) ? content.length : 1
  };
}

async function createZipFile(zipPath, fileName, content) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.append(content, { name: fileName });
    archive.finalize();
  });
}

async function writeFTPFile(fileName, content, config) {
  const client = new ftp.Client();

  try {
    await client.access({
      host: config.ftpHost,
      port: config.ftpPort || 21,
      user: config.ftpUser,
      password: config.ftpPassword,
      secure: config.ftpSecure || false
    });

    const remotePath = path.join(config.filePath || '', fileName);

    // Create directories if needed
    if (config.createDirectories && config.filePath) {
      await client.ensureDir(config.filePath);
    }

    // Upload file
    const buffer = Buffer.from(content, config.encoding || 'utf8');
    await client.uploadFrom(buffer, remotePath);

    // Get file info
    const fileInfo = await client.size(remotePath);

    return {
      fileName,
      filePath: remotePath,
      fileSize: fileInfo,
      recordsWritten: Array.isArray(content) ? content.length : 1
    };

  } finally {
    client.close();
  }
}

async function writeSFTPFile(fileName, content, config) {
  return new Promise((resolve, reject) => {
    const conn = new SSHClient();

    conn.on('ready', () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        const remotePath = path.join(config.filePath || '', fileName);
        const buffer = Buffer.from(content, config.encoding || 'utf8');

        // Write file
        sftp.writeFile(remotePath, buffer, (err) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          // Get file stats
          sftp.stat(remotePath, (err, stats) => {
            conn.end();

            if (err) return reject(err);

            resolve({
              fileName,
              filePath: remotePath,
              fileSize: stats.size,
              recordsWritten: Array.isArray(content) ? content.length : 1
            });
          });
        });
      });
    });

    conn.on('error', (err) => {
      reject(err);
    });

    // Connect with appropriate auth
    const connectConfig = {
      host: config.ftpHost,
      port: config.sftpPort || 22,
      username: config.ftpUser
    };

    if (config.sftpPrivateKey) {
      connectConfig.privateKey = config.sftpPrivateKey;
    } else {
      connectConfig.password = config.ftpPassword;
    }

    conn.connect(connectConfig);
  });
}
