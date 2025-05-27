// imports/ui/pages/AgentWorkflow/workflow-components/data/s3/executor.js

import AWS from 'aws-sdk';

export default async function executeS3Operation(context) {
  const { node, input, services } = context;
  const {
    operation,
    bucket,
    key,
    region,
    endpoint,
    credentials,
    options = {}
  } = node.data;

  // Validate credentials
  if (!credentials?.accessKeyId || !credentials?.secretAccessKey) {
    throw new Error('AWS credentials are required');
  }

  // Configure S3 client
  const s3Config = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: region || 'us-east-1'
  };

  // Add custom endpoint if specified
  if (endpoint) {
    s3Config.endpoint = endpoint;
    s3Config.s3ForcePathStyle = true; // Required for S3-compatible services
  }

  const s3 = new AWS.S3(s3Config);

  try {
    let result;
    let metadata = {
      operation,
      bucket,
      timestamp: new Date()
    };

    switch (operation) {
      case 'get':
        if (!key) {
          throw new Error('Object key is required for get operation');
        }

        const getParams = {
          Bucket: bucket,
          Key: key
        };

        if (options.versionId) {
          getParams.VersionId = options.versionId;
        }

        const getResponse = await s3.getObject(getParams).promise();

        // Convert Buffer to appropriate format
        let objectData;
        const contentType = getResponse.ContentType;

        if (contentType && contentType.includes('json')) {
          objectData = JSON.parse(getResponse.Body.toString('utf-8'));
        } else if (contentType && (contentType.includes('text') || contentType.includes('xml'))) {
          objectData = getResponse.Body.toString('utf-8');
        } else {
          // Return base64 for binary data
          objectData = getResponse.Body.toString('base64');
        }

        result = objectData;
        metadata = {
          ...metadata,
          key,
          contentType: getResponse.ContentType,
          contentLength: getResponse.ContentLength,
          lastModified: getResponse.LastModified,
          etag: getResponse.ETag,
          versionId: getResponse.VersionId,
          metadata: getResponse.Metadata
        };
        break;

      case 'put':
        if (!key) {
          throw new Error('Object key is required for put operation');
        }

        let bodyContent = input;
        let bodyContentType = options.contentType || 'auto';

        // Prepare the body content
        if (typeof input === 'object') {
          bodyContent = JSON.stringify(input);
          if (bodyContentType === 'auto') {
            bodyContentType = 'application/json';
          }
        } else {
          if (bodyContentType === 'auto') {
            bodyContentType = 'text/plain';
          }
        }

        const putParams = {
          Bucket: bucket,
          Key: key,
          Body: bodyContent,
          ContentType: bodyContentType
        };

        // Add ACL if specified
        if (options.acl) {
          putParams.ACL = options.acl;
        }

        // Add custom metadata
        if (options.metadata && Object.keys(options.metadata).length > 0) {
          putParams.Metadata = options.metadata;
        }

        const putResponse = await s3.putObject(putParams).promise();

        result = {
          success: true,
          key,
          etag: putResponse.ETag,
          versionId: putResponse.VersionId
        };

        metadata = {
          ...metadata,
          key,
          contentType: bodyContentType,
          etag: putResponse.ETag,
          versionId: putResponse.VersionId
        };
        break;

      case 'delete':
        if (!key) {
          throw new Error('Object key is required for delete operation');
        }

        const deleteParams = {
          Bucket: bucket,
          Key: key
        };

        const deleteResponse = await s3.deleteObject(deleteParams).promise();

        result = {
          success: true,
          key,
          deleted: true,
          versionId: deleteResponse.VersionId
        };

        metadata = {
          ...metadata,
          key,
          versionId: deleteResponse.VersionId,
          deleteMarker: deleteResponse.DeleteMarker
        };
        break;

      case 'list':
        const listParams = {
          Bucket: bucket,
          MaxKeys: options.maxKeys || 1000
        };

        if (options.prefix) {
          listParams.Prefix = options.prefix;
        }

        if (options.delimiter) {
          listParams.Delimiter = options.delimiter;
        }

        const listResponse = await s3.listObjectsV2(listParams).promise();

        result = {
          objects: listResponse.Contents?.map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            etag: obj.ETag,
            storageClass: obj.StorageClass
          })) || [],
          commonPrefixes: listResponse.CommonPrefixes?.map(prefix => prefix.Prefix) || [],
          isTruncated: listResponse.IsTruncated,
          keyCount: listResponse.KeyCount
        };

        metadata = {
          ...metadata,
          prefix: options.prefix,
          delimiter: options.delimiter,
          maxKeys: options.maxKeys,
          keyCount: listResponse.KeyCount,
          isTruncated: listResponse.IsTruncated
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return {
      success: true,
      data: result,
      metadata
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      metadata: {
        operation,
        bucket,
        key,
        timestamp: new Date()
      }
    };
  }
}
