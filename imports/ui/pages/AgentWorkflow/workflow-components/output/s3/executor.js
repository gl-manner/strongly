// imports/ui/pages/AgentWorkflow/workflow-components/output/s3/executor.js

import AWS from 'aws-sdk';
import { PassThrough } from 'stream';
import zlib from 'zlib';
import csv from 'csv-stringify';

export default async function executeS3Output(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Process object key template
    const objectKey = processObjectKeyTemplate(data.objectKey);

    // Format data based on configuration
    const formattedContent = await formatContent(input, data);

    // Prepare content buffer
    let contentBuffer = Buffer.from(formattedContent, 'utf8');

    // Apply compression if needed
    if (data.compression === 'gzip') {
      contentBuffer = await compressContent(contentBuffer);
    }

    // Configure S3 client
    const s3Config = getS3Config(data, env);
    const s3 = new AWS.S3(s3Config);

    // Prepare upload parameters
    const uploadParams = prepareUploadParams(data, objectKey, contentBuffer);

    // Perform upload
    let result;
    if (contentBuffer.length > data.partSize) {
      result = await performMultipartUpload(s3, uploadParams, contentBuffer, data);
    } else {
      result = await performSimpleUpload(s3, uploadParams, data);
    }

    // Handle versioning if enabled
    if (data.versioningEnabled && data.deleteOldVersions) {
      await deleteOldVersions(s3, data.bucketName, objectKey, data.maxVersions);
    }

    return {
      success: true,
      data: {
        bucket: data.bucketName,
        key: objectKey,
        location: result.Location,
        etag: result.ETag,
        versionId: result.VersionId,
        size: contentBuffer.length
      },
      metadata: {
        region: data.region,
        storageClass: data.storageClass,
        encryption: data.serverSideEncryption,
        compressed: data.compression === 'gzip',
        uploadedAt: new Date()
      }
    };

  } catch (error) {
    console.error('S3 output error:', error);
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        code: error.code,
        bucket: data.bucketName,
        key: data.objectKey
      }
    };
  }
}

function processObjectKeyTemplate(template) {
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
    second: String(now.getSeconds()).padStart(2, '0'),
    random: Math.random().toString(36).substring(7)
  };

  let processedKey = template;
  Object.entries(replacements).forEach(([key, value]) => {
    processedKey = processedKey.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });

  // Process any remaining template variables from input data
  processedKey = processedKey.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], context.input);
    return value !== undefined ? String(value) : match;
  });

  return processedKey;
}

async function formatContent(data, config) {
  switch (config.dataFormat) {
    case 'json':
      return formatJSON(data, config);

    case 'csv':
      return formatCSV(data, config);

    case 'text':
      return formatText(data);

    case 'binary':
      return formatBinary(data);

    default:
      return String(data);
  }
}

function formatJSON(data, config) {
  if (config.jsonPretty) {
    return JSON.stringify(data, null, 2);
  }
  return JSON.stringify(data);
}

async function formatCSV(data, config) {
  // Ensure data is an array
  const records = Array.isArray(data) ? data : [data];

  return new Promise((resolve, reject) => {
    const options = {
      header: config.csvHeaders ?? true,
      delimiter: config.csvDelimiter || ',',
      quoted: true
    };

    csv.stringify(records, options, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
}

function formatText(data) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

function formatBinary(data) {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (typeof data === 'string') {
    return Buffer.from(data, 'base64');
  }
  return Buffer.from(JSON.stringify(data));
}

async function compressContent(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gzip(buffer, (err, compressed) => {
      if (err) reject(err);
      else resolve(compressed);
    });
  });
}

function getS3Config(data, env) {
  const config = {
    region: data.region || 'us-east-1',
    maxRetries: data.retries || 3,
    httpOptions: {
      timeout: data.timeout || 60000
    }
  };

  // Set credentials
  if (data.useEnvCredentials) {
    const prefix = data.envPrefix || 'AWS_';
    config.accessKeyId = env[`${prefix}ACCESS_KEY_ID`];
    config.secretAccessKey = env[`${prefix}SECRET_ACCESS_KEY`];

    // Optional session token for temporary credentials
    if (env[`${prefix}SESSION_TOKEN`]) {
      config.sessionToken = env[`${prefix}SESSION_TOKEN`];
    }
  } else {
    config.accessKeyId = data.accessKeyId;
    config.secretAccessKey = data.secretAccessKey;
  }

  // Set custom endpoint for S3-compatible services
  if (data.endpoint) {
    config.endpoint = data.endpoint;
    config.s3ForcePathStyle = true; // Required for S3-compatible services
  }

  return config;
}

function prepareUploadParams(data, objectKey, buffer) {
  const params = {
    Bucket: data.bucketName,
    Key: objectKey,
    Body: buffer,
    ContentType: data.contentType || 'application/octet-stream'
  };

  // Add optional parameters
  if (data.acl && data.acl !== 'private') {
    params.ACL = data.acl;
  }

  if (data.storageClass && data.storageClass !== 'STANDARD') {
    params.StorageClass = data.storageClass;
  }

  if (data.serverSideEncryption && data.serverSideEncryption !== 'none') {
    params.ServerSideEncryption = data.serverSideEncryption;

    if (data.serverSideEncryption === 'aws:kms' && data.kmsKeyId) {
      params.SSEKMSKeyId = data.kmsKeyId;
    }
  }

  if (data.contentEncoding) {
    params.ContentEncoding = data.contentEncoding;
  }

  if (data.cacheControl) {
    params.CacheControl = data.cacheControl;
  }

  // Add metadata
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    params.Metadata = {};
    Object.entries(data.metadata).forEach(([key, value]) => {
      // S3 metadata keys must be prefixed with x-amz-meta-
      params.Metadata[key] = String(value);
    });
  }

  // Add tags (requires separate API call after upload)
  if (data.tags && Object.keys(data.tags).length > 0) {
    const tagSet = Object.entries(data.tags).map(([key, value]) => ({
      Key: key,
      Value: String(value)
    }));
    params.Tagging = tagSet.map(tag => `${tag.Key}=${tag.Value}`).join('&');
  }

  return params;
}

async function performSimpleUpload(s3, params, config) {
  const maxRetries = config.retries || 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }

      const result = await s3.putObject(params).promise();
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`S3 upload attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on certain errors
      if (error.code === 'NoSuchBucket' || error.code === 'AccessDenied') {
        throw error;
      }
    }
  }

  throw lastError;
}

async function performMultipartUpload(s3, params, buffer, config) {
  const partSize = config.partSize || 5 * 1024 * 1024; // 5MB default
  const queueSize = config.queueSize || 4;

  // Initialize multipart upload
  const multipartParams = { ...params };
  delete multipartParams.Body;

  const { UploadId } = await s3.createMultipartUpload(multipartParams).promise();

  try {
    const parts = [];
    const numParts = Math.ceil(buffer.length / partSize);

    // Upload parts in parallel with queue limit
    for (let i = 0; i < numParts; i += queueSize) {
      const promises = [];

      for (let j = i; j < Math.min(i + queueSize, numParts); j++) {
        const start = j * partSize;
        const end = Math.min(start + partSize, buffer.length);
        const partNumber = j + 1;

        const uploadPromise = s3.uploadPart({
          Bucket: params.Bucket,
          Key: params.Key,
          PartNumber: partNumber,
          UploadId,
          Body: buffer.slice(start, end)
        }).promise().then(data => ({
          ETag: data.ETag,
          PartNumber: partNumber
        }));

        promises.push(uploadPromise);
      }

      const uploadedParts = await Promise.all(promises);
      parts.push(...uploadedParts);
    }

    // Complete multipart upload
    const result = await s3.completeMultipartUpload({
      Bucket: params.Bucket,
      Key: params.Key,
      UploadId,
      MultipartUpload: { Parts: parts }
    }).promise();

    return result;

  } catch (error) {
    // Abort multipart upload on error
    await s3.abortMultipartUpload({
      Bucket: params.Bucket,
      Key: params.Key,
      UploadId
    }).promise();

    throw error;
  }
}

async function deleteOldVersions(s3, bucket, key, maxVersions) {
  try {
    // List all versions of the object
    const versions = await s3.listObjectVersions({
      Bucket: bucket,
      Prefix: key,
      MaxKeys: 1000
    }).promise();

    // Filter to only this specific key
    const objectVersions = versions.Versions
      .filter(v => v.Key === key)
      .sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));

    // Delete old versions if exceeding max
    if (objectVersions.length > maxVersions) {
      const versionsToDelete = objectVersions.slice(maxVersions);

      if (versionsToDelete.length > 0) {
        await s3.deleteObjects({
          Bucket: bucket,
          Delete: {
            Objects: versionsToDelete.map(v => ({
              Key: v.Key,
              VersionId: v.VersionId
            }))
          }
        }).promise();
      }
    }
  } catch (error) {
    console.warn('Failed to delete old versions:', error.message);
    // Don't fail the upload if version deletion fails
  }
}
