// imports/ui/pages/AgentWorkflow/workflow-components/data/storage/executor.js

export default async function executeStorage(context) {
  const { node, input, services } = context;
  const {
    operation,
    key,
    value,
    namespace,
    ttl,
    options = {}
  } = node.data;

  // Get storage service (this would be provided by the workflow engine)
  const storage = services.storage || services.getStorage(namespace);

  try {
    let result;
    let metadata = {
      operation,
      namespace,
      timestamp: new Date()
    };

    switch (operation) {
      case 'get':
        const storedValue = await storage.get(namespace, key);

        if (storedValue === null && options.createIfNotExists) {
          // Return a default value or the input if key doesn't exist
          result = input || null;
          metadata.keyExists = false;
        } else {
          result = storedValue;
          metadata.keyExists = storedValue !== null;
        }
        metadata.key = key;
        break;

      case 'set':
        // Parse value if it's JSON
        let valueToStore = value;
        try {
          // Try to parse as JSON
          valueToStore = JSON.parse(value);
        } catch {
          // If not JSON, store as string
          valueToStore = value;
        }

        // Check if we should overwrite
        if (!options.overwrite) {
          const existing = await storage.get(namespace, key);
          if (existing !== null) {
            throw new Error(`Key "${key}" already exists and overwrite is disabled`);
          }
        }

        // Get previous value if requested
        let previousValue = null;
        if (options.returnPrevious) {
          previousValue = await storage.get(namespace, key);
        }

        // Set the value with optional TTL
        await storage.set(namespace, key, valueToStore, ttl);

        result = options.returnPrevious ? previousValue : valueToStore;
        metadata.key = key;
        metadata.ttl = ttl;
        metadata.previousValue = options.returnPrevious ? previousValue : undefined;
        break;

      case 'delete':
        // Get value before deletion if requested
        let deletedValue = null;
        if (options.returnPrevious) {
          deletedValue = await storage.get(namespace, key);
        }

        const deleted = await storage.delete(namespace, key);

        result = options.returnPrevious ? deletedValue : deleted;
        metadata.key = key;
        metadata.deleted = deleted;
        metadata.previousValue = options.returnPrevious ? deletedValue : undefined;
        break;

      case 'list':
        // List all keys in the namespace
        const keys = await storage.listKeys(namespace);
        result = keys;
        metadata.count = keys.length;
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
      metadata: {
        operation,
        namespace,
        key,
        timestamp: new Date()
      }
    };
  }
}
