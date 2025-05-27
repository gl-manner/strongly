// imports/ui/pages/AgentWorkflow/workflow-components/data/api/executor.js

export default async function executeApiRequest(context) {
  const { node, input, services } = context;
  const {
    method,
    url,
    headers = {},
    body,
    authentication,
    timeout,
    retries,
    responseType
  } = node.data;

  // Validate URL
  if (!url) {
    throw new Error('API URL is required');
  }

  // Build request headers
  const requestHeaders = { ...headers };

  // Add authentication headers
  if (authentication?.type === 'basic') {
    const { username, password } = authentication.credentials;
    const encoded = Buffer.from(`${username}:${password}`).toString('base64');
    requestHeaders['Authorization'] = `Basic ${encoded}`;
  } else if (authentication?.type === 'bearer') {
    const { token } = authentication.credentials;
    requestHeaders['Authorization'] = `Bearer ${token}`;
  } else if (authentication?.type === 'apiKey') {
    const { headerName, apiKey } = authentication.credentials;
    requestHeaders[headerName || 'X-API-Key'] = apiKey;
  }

  // Build request options
  const requestOptions = {
    method,
    headers: requestHeaders,
    timeout: timeout || 30000
  };

  // Add body for appropriate methods
  if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
    requestOptions.body = body;
    // Set content-type if not already set
    if (!requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }
  }

  // Function to make request with retries
  const makeRequest = async (attemptsLeft) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse response based on type
      let data;
      if (responseType === 'json') {
        data = await response.json();
      } else if (responseType === 'text') {
        data = await response.text();
      } else if (responseType === 'blob') {
        data = await response.blob();
      }

      return {
        success: true,
        data,
        metadata: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
          method,
          timestamp: new Date()
        }
      };
    } catch (error) {
      if (attemptsLeft > 0) {
        console.log(`Request failed, retrying... (${attemptsLeft} attempts left)`);
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retries - attemptsLeft) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(attemptsLeft - 1);
      }

      throw error;
    }
  };

  try {
    return await makeRequest(retries || 0);
  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        url,
        method,
        timestamp: new Date()
      }
    };
  }
}
