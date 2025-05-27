import { v4 as uuidv4 } from 'uuid';

// Helper function to create embedding using various providers
async function createEmbedding(text, model, apiKey) {
  let url, headers, body;

  if (model.startsWith('text-embedding')) {
    // OpenAI models
    url = 'https://api.openai.com/v1/embeddings';
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    body = {
      input: text,
      model: model
    };
  } else if (model.startsWith('voyage')) {
    // Voyage AI models
    url = 'https://api.voyageai.com/v1/embeddings';
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    body = {
      input: text,
      model: model
    };
  } else if (model.startsWith('embed')) {
    // Cohere models
    url = 'https://api.cohere.ai/v1/embed';
    headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    body = {
      texts: [text],
      model: model,
      input_type: 'search_document'
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Extract embedding based on provider response format
  if (model.startsWith('text-embedding') || model.startsWith('voyage')) {
    return data.data[0].embedding;
  } else if (model.startsWith('embed')) {
    return data.embeddings[0];
  }
}

// Provider-specific upsert functions
async function upsertToPinecone(config, vectors) {
  const { apiKey, indexName, namespace } = config;
  const url = `https://${indexName}.pinecone.io/vectors/upsert`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors,
      namespace
    })
  });

  if (!response.ok) {
    throw new Error(`Pinecone upsert error: ${response.statusText}`);
  }

  return response.json();
}

async function upsertToWeaviate(config, vectors) {
  const { apiKey, indexName } = config;
  // Note: Weaviate URL would need to be configured
  const url = `https://your-weaviate-instance.com/v1/objects`;

  const objects = vectors.map(v => ({
    class: indexName,
    id: v.id,
    properties: {
      ...v.metadata,
      _embedding: v.values
    }
  }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(objects)
  });

  if (!response.ok) {
    throw new Error(`Weaviate upsert error: ${response.statusText}`);
  }

  return response.json();
}

async function upsertToQdrant(config, vectors) {
  const { apiKey, indexName } = config;
  // Note: Qdrant URL would need to be configured
  const url = `https://your-qdrant-instance.com/collections/${indexName}/points`;

  const points = vectors.map(v => ({
    id: v.id,
    vector: v.values,
    payload: v.metadata
  }));

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ points })
  });

  if (!response.ok) {
    throw new Error(`Qdrant upsert error: ${response.statusText}`);
  }

  return response.json();
}

// Main executor function
export default async function executeVectorDB(context) {
  const { node, input, services } = context;
  const {
    provider,
    apiKey,
    indexName,
    namespace,
    textField,
    metadataFields,
    embeddingModel,
    upsertMode,
    batchSize,
    includeTimestamp
  } = node.data;

  try {
    // Validate input
    if (!input || !Array.isArray(input)) {
      throw new Error('Input must be an array of objects');
    }

    // Process data in batches
    const results = [];
    const errors = [];

    for (let i = 0; i < input.length; i += batchSize) {
      const batch = input.slice(i, i + batchSize);
      const vectors = [];

      for (const item of batch) {
        try {
          // Extract text to embed
          const text = item[textField];
          if (!text) {
            throw new Error(`Missing text field '${textField}' in item`);
          }

          // Create embedding
          const embedding = await createEmbedding(text, embeddingModel, apiKey);

          // Prepare metadata
          const metadata = {};

          // Add specified metadata fields
          for (const field of metadataFields) {
            if (item[field] !== undefined) {
              metadata[field] = item[field];
            }
          }

          // Add timestamp if enabled
          if (includeTimestamp) {
            metadata.timestamp = new Date().toISOString();
          }

          // Add source text for reference
          metadata._source_text = text.substring(0, 1000); // Limit to 1000 chars

          // Create vector object
          const vector = {
            id: item.id || uuidv4(),
            values: embedding,
            metadata
          };

          vectors.push(vector);
        } catch (error) {
          errors.push({
            item,
            error: error.message
          });
        }
      }

      // Upsert vectors to the database
      if (vectors.length > 0) {
        let result;

        switch (provider) {
          case 'pinecone':
            result = await upsertToPinecone(node.data, vectors);
            break;
          case 'weaviate':
            result = await upsertToWeaviate(node.data, vectors);
            break;
          case 'qdrant':
            result = await upsertToQdrant(node.data, vectors);
            break;
          case 'chroma':
            // Chroma implementation would go here
            throw new Error('Chroma provider not yet implemented');
          case 'milvus':
            // Milvus implementation would go here
            throw new Error('Milvus provider not yet implemented');
          default:
            throw new Error(`Unknown provider: ${provider}`);
        }

        results.push({
          batch: i / batchSize + 1,
          vectorsUpserted: vectors.length,
          result
        });
      }
    }

    // Return summary
    return {
      success: true,
      data: {
        totalProcessed: input.length,
        totalUpserted: results.reduce((sum, r) => sum + r.vectorsUpserted, 0),
        totalErrors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      },
      metadata: {
        provider,
        indexName,
        namespace,
        embeddingModel,
        processedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}
