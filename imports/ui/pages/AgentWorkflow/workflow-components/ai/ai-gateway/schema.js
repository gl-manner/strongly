// imports/ui/pages/AgentWorkflow/workflow-components/ai/ai-gateway/schema.js

export default {
  type: 'object',
  properties: {
    modelId: {
      type: 'string',
      minLength: 1
    },
    modelName: {
      type: 'string'
    },
    provider: {
      type: 'string'
    },
    prompt: {
      type: 'string'
    },
    systemPrompt: {
      type: 'string'
    },
    temperature: {
      type: 'number',
      minimum: 0,
      maximum: 2,
      default: 0.7
    },
    maxTokens: {
      type: 'number',
      minimum: 1,
      maximum: 32000,
      default: 1000
    },
    topP: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      default: 1.0
    },
    frequencyPenalty: {
      type: 'number',
      minimum: -2,
      maximum: 2,
      default: 0
    },
    presencePenalty: {
      type: 'number',
      minimum: -2,
      maximum: 2,
      default: 0
    },
    stopSequences: {
      type: 'array',
      items: {
        type: 'string'
      },
      default: []
    },
    responseFormat: {
      type: 'string',
      enum: ['text', 'json', 'markdown'],
      default: 'text'
    },
    stream: {
      type: 'boolean',
      default: false
    }
  },
  required: ['modelId'],
  anyOf: [
    { required: ['prompt'] },
    { required: ['systemPrompt'] }
  ]
};
