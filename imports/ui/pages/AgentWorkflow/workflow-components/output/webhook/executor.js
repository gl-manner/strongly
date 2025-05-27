// imports/ui/pages/AgentWorkflow/workflow-components/output/webhook/executor.js

import { HTTP } from 'meteor/http';

export default async function executeWebhook(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Process template variables
    const processedUrl = processTemplate(data.url, input);
    const processedBody = processBodyTemplate(data.body, data.bodyType, input);
    const processedHeaders = processHeaders(data.headers, input);
    const processedQueryParams = processQueryParams(data.queryParams, input);

    // Build request options
    const options = {
      headers: processedHeaders,
      params: processedQueryParams,
      timeout: data.timeout || 30000,
      followRedirects: data.followRedirects ?? true,
      npmRequestOptions: {
        rejectUnauthorized: data.validateSSL ?? true,
        maxRedirects: data.maxRedirects || 5
      }
    };

    // Add authentication
    addAuthentication(options, data);

    // Add body for appropriate methods
    if (['POST', 'PUT', 'PATCH'].includes(data.method)) {
      if (data.bodyType === 'json') {
        options.data = processedBody;
        options.headers['Content-Type'] = 'application/json';
      } else if (data.bodyType === 'form') {
        options.data = processedBody;
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else {
        options.content = processedBody;
      }
    }

    // Make the request with retries
    let lastError;
    let response;

    for (let attempt = 0; attempt <= (data.retryCount || 0); attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry with exponential backoff
          const delay = data.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        response = await HTTP.call(data.method, processedUrl, options);

        // Check if status code is considered success
        if (data.successCodes && !data.successCodes.includes(response.statusCode)) {
          throw new Error(`Unexpected status code: ${response.statusCode}`);
        }

        break; // Success, exit retry loop

      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) unless specified
        if (error.response && error.response.statusCode >= 400 && error.response.statusCode < 500) {
          if (data.errorHandling !== 'retry') {
            throw error;
          }
        }

        // If this was the last attempt, throw the error
        if (attempt === data.retryCount) {
          throw error;
        }
      }
    }

    // Process response based on handling type
    let responseData;
    if (response) {
      if (data.responseHandling === 'json') {
        responseData = response.data || response.content;
        if (typeof responseData === 'string') {
          try {
            responseData = JSON.parse(responseData);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
      } else if (data.responseHandling === 'text') {
        responseData = response.content;
      } else {
        responseData = response.content; // Binary handled as string in Meteor
      }
    }

    return {
      success: true,
      data: responseData,
      metadata: {
        statusCode: response?.statusCode,
        headers: response?.headers,
        url: processedUrl,
        method: data.method,
        executedAt: new Date()
      }
    };

  } catch (error) {
    console.error('Webhook execution error:', error);

    // Handle error based on configuration
    if (data.errorHandling === 'continue') {
      return {
        success: false,
        error: error.message,
        data: null,
        metadata: {
          statusCode: error.response?.statusCode,
          url: data.url,
          method: data.method,
          executedAt: new Date()
        }
      };
    }

    // Default: fail the workflow
    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.name,
        statusCode: error.response?.statusCode,
        response: error.response?.content,
        url: data.url,
        method: data.method
      }
    };
  }
}

function processTemplate(template, data) {
  if (!template || typeof template !== 'string') return template;

  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], data);
    return value !== undefined ? String(value) : match;
  });
}

function processBodyTemplate(bodyTemplate, bodyType, data) {
  if (!bodyTemplate) return {};

  // Handle special case where body is just {{input}}
  if (bodyTemplate.trim() === '{{input}}') {
    return data;
  }

  // Process template variables
  const processedBody = processTemplate(bodyTemplate, data);

  if (bodyType === 'json') {
    try {
      // Try to parse as JSON template
      return JSON.parse(processedBody);
    } catch (e) {
      // If not valid JSON, try to inject data directly
      if (bodyTemplate.includes('{{input}}')) {
        const jsonStr = bodyTemplate.replace('{{input}}', JSON.stringify(data));
        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          // Return as object with data
          return { data: data };
        }
      }
      return { data: processedBody };
    }
  } else if (bodyType === 'form') {
    // Convert to form data format
    if (typeof data === 'object' && data !== null) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      return params.toString();
    }
    return processedBody;
  }

  return processedBody;
}

function processHeaders(headers, data) {
  const processed = {};

  Object.entries(headers || {}).forEach(([key, value]) => {
    processed[key] = processTemplate(value, data);
  });

  return processed;
}

function processQueryParams(params, data) {
  const processed = {};

  Object.entries(params || {}).forEach(([key, value]) => {
    const processedValue = processTemplate(value, data);
    if (processedValue) { // Only include non-empty params
      processed[key] = processedValue;
    }
  });

  return processed;
}

function addAuthentication(options, data) {
  switch (data.authentication) {
    case 'basic':
      const auth = Buffer.from(`${data.username}:${data.password}`).toString('base64');
      options.headers['Authorization'] = `Basic ${auth}`;
      break;

    case 'bearer':
      options.headers['Authorization'] = `Bearer ${data.bearerToken}`;
      break;

    case 'apikey':
      options.headers[data.apiKeyHeader || 'X-API-Key'] = data.apiKey;
      break;
  }
}
