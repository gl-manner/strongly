// imports/ui/pages/AgentWorkflow/workflow-components/output/vector-db/metadata.js

export default {
  // Display Information
  label: 'Vector Database',
  description: 'Store embeddings in vector databases (Pinecone, Weaviate, Qdrant, Chroma)',
  color: '#f59e0b', // Amber color for output components

  // Default Configuration
  defaultData: {
    // Vector DB Provider
    provider: 'pinecone', // pinecone, weaviate, qdrant, chroma, milvus
    endpoint: '',
    apiKey: '',
    useEnvCredentials: true,
    envVariableName: 'VECTOR_DB_API_KEY',

    // Database/Collection config
    database: '', // or index/collection depending on provider
    namespace: '', // For providers that support namespacing
    collection: '',

    // Embedding configuration
    embeddingSource: 'provided', // provided, generate
    embeddingModel: '', // If generating embeddings
    embeddingField: 'embedding', // Field containing the embedding
    textField: 'text', // Field to generate embedding from

    // Vector operation
    operation: 'upsert', // upsert, insert, update, delete

    // Upsert/Insert data
    idField: 'id', // Field to use as vector ID
    metadataFields: [], // Fields to store as metadata

    // Delete configuration
    deleteIds: [], // IDs to delete
    deleteFilter: {}, // Filter for bulk delete

    // Search configuration (for update operations)
    topK: 10,
    includeMetadata: true,
    includeValues: false,

    // Batch configuration
    batchSize: 100,
    parallelRequests: 1,

    // Provider-specific options
    pinecone: {
      environment: 'us-west1-gcp',
      metric: 'cosine' // cosine, euclidean, dotproduct
    },
    weaviate: {
      scheme: 'https',
      className: '',
      consistency: 'ONE' // ONE, QUORUM, ALL
    },
    qdrant: {
      port: 6333,
      https: true,
      distance: 'Cosine' // Cosine, Euclid, Dot
    },
    chroma: {
      port: 8000,
      ssl: false,
      headers: {}
    },

    // Advanced options
    timeout: 30000,
    retries: 3,
    validateVectors: true,
    normalizeVectors: false
  },

  // Connection Rules
  allowedInputs: ['*'], // Can receive from any component
  allowedOutputs: [], // Terminal node - no outputs
  maxInputs: 1, // Only one input
  maxOutputs: 0, // No outputs allowed

  // Additional Metadata
  version: '1.0.0',
  author: 'Workflow System',
  tags: ['vector', 'database', 'embeddings', 'ai', 'search', 'similarity'],

  // Behavior Flags
  isAsync: true, // Vector operations are async
  requiresAuth: true, // Needs API credentials
  isBeta: false
};
