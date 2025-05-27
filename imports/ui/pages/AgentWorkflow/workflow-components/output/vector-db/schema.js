export default {
  type: 'object',
  properties: {
    provider: {
      type: 'string',
      enum: ['pinecone', 'weaviate', 'qdrant', 'chroma', 'milvus'],
      description: 'The vector database provider to use'
    },
    apiKey: {
      type: 'string',
      minLength: 1,
      description: 'API key for authentication with the vector database'
    },
    indexName: {
      type: 'string',
      pattern: '^[a-zA-Z0-9][a-zA-Z0-9-_]*$',
      minLength: 1,
      maxLength: 255,
      description: 'Name of the index or collection to store vectors'
    },
    namespace: {
      type: 'string',
      pattern: '^[a-zA-Z0-9-_]*$',
      maxLength: 255,
      description: 'Optional namespace for data partitioning (Pinecone/Milvus only)'
    },
    textField: {
      type: 'string',
      minLength: 1,
      description: 'The field name in input data that contains text to embed'
    },
    metadataFields: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1
      },
      description: 'Additional fields to store as metadata'
    },
    embeddingModel: {
      type: 'string',
      enum: [
        'text-embedding-ada-002',
        'text-embedding-3-small',
        'text-embedding-3-large',
        'voyage-2',
        'voyage-large-2',
        'embed-english-v3.0',
        'embed-multilingual-v3.0'
      ],
      description: 'The embedding model to use for text vectorization'
    },
    upsertMode: {
      type: 'string',
      enum: ['create', 'update', 'replace'],
      default: 'create',
      description: 'How to handle existing vectors with the same ID'
    },
    batchSize: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      default: 100,
      description: 'Number of vectors to process in each batch'
    },
    includeTimestamp: {
      type: 'boolean',
      default: true,
      description: 'Whether to include timestamp in vector metadata'
    }
  },
  required: ['provider', 'apiKey', 'indexName', 'textField', 'embeddingModel'],
  additionalProperties: false
};
