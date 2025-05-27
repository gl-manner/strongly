// imports/ui/pages/AgentWorkflow/workflow-components/ai/ai-gateway/executor.js

import { Meteor } from 'meteor/meteor';

export default async function executeAIGateway(context) {
  const { node, input, services, env } = context;
  const { data } = node;

  try {
    // Build the prompt with input data
    let finalPrompt = data.prompt || '';

    // Replace {{input}} with the actual input
    if (typeof input === 'string') {
      finalPrompt = finalPrompt.replace(/\{\{input\}\}/g, input);
    } else if (typeof input === 'object' && input !== null) {
      // Handle object input
      finalPrompt = finalPrompt.replace(/\{\{input\}\}/g, JSON.stringify(input));

      // Also replace specific field references like {{field.name}}
      finalPrompt = finalPrompt.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const value = path.split('.').reduce((obj, key) => obj?.[key], input);
        return value !== undefined ? String(value) : match;
      });
    }

    // Build messages array for chat completion
    const messages = [];

    // Add system prompt if provided
    if (data.systemPrompt) {
      messages.push({
        role: 'system',
        content: data.systemPrompt
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: finalPrompt
    });

    // Prepare request options
    const requestOptions = {
      model: data.modelId,
      messages: messages,
      temperature: data.temperature || 0.7,
      max_tokens: data.maxTokens || 1000,
      top_p: data.topP || 1.0,
      frequency_penalty: data.frequencyPenalty || 0,
      presence_penalty: data.presencePenalty || 0,
      stream: data.stream || false
    };

    // Add stop sequences if provided
    if (data.stopSequences && data.stopSequences.length > 0) {
      requestOptions.stop = data.stopSequences;
    }

    // Add response format hint if JSON is requested
    if (data.responseFormat === 'json') {
      requestOptions.response_format = { type: 'json_object' };
      // Also add a hint in the prompt if not already there
      if (!finalPrompt.includes('JSON') && !finalPrompt.includes('json')) {
        messages[messages.length - 1].content += '\n\nPlease respond with valid JSON.';
      }
    }

    // Call the AI Gateway
    const response = await Meteor.callAsync('aiGateway.generateChatCompletion', requestOptions);

    // Extract the response content
    let responseContent = response.choices?.[0]?.message?.content || '';

    // Parse JSON if requested and possible
    if (data.responseFormat === 'json') {
      try {
        responseContent = JSON.parse(responseContent);
      } catch (e) {
        // If parsing fails, try to extract JSON from the response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            responseContent = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.warn('Failed to parse JSON response:', e2);
            // Keep as string if parsing fails
          }
        }
      }
    }

    return {
      success: true,
      data: responseContent,
      metadata: {
        model: data.modelId,
        provider: data.provider,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
        totalTokens: response.usage?.total_tokens,
        finishReason: response.choices?.[0]?.finish_reason,
        responseFormat: data.responseFormat,
        executedAt: new Date()
      }
    };

  } catch (error) {
    console.error('AI Gateway execution error:', error);

    // Check for specific error types
    if (error.error === 'no-api-key') {
      throw new Error('No AI Gateway API key configured. Please ensure the user has access to the AI Gateway.');
    }

    if (error.error === 'model-not-found') {
      throw new Error(`Model ${data.modelId} not found or not accessible.`);
    }

    if (error.error === 'rate-limit-exceeded') {
      throw new Error('AI Gateway rate limit exceeded. Please try again later.');
    }

    return {
      success: false,
      error: error.message,
      errorDetails: {
        type: error.error || error.name,
        modelId: data.modelId,
        provider: data.provider
      }
    };
  }
}

// Helper method that could be called from the server
Meteor.methods({
  async 'aiGateway.generateChatCompletion'(options) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Ensure user has AI Gateway access
    await Meteor.callAsync('aiGateway.ensureGatewayApiKey');

    // Forward the request to the AI Gateway
    // This would use the gatewayRequest helper from the AI Gateway methods
    // For now, we'll use the existing chat completions method

    try {
      const response = await Meteor.callAsync('aiGateway.generateCompletion',
        options.model,
        options.messages,
        {
          maxTokens: options.max_tokens,
          temperature: options.temperature,
          topP: options.top_p,
          frequencyPenalty: options.frequency_penalty,
          presencePenalty: options.presence_penalty,
          stop: options.stop,
          stream: options.stream,
          responseFormat: options.response_format
        }
      );

      return response;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw error;
    }
  }
});
