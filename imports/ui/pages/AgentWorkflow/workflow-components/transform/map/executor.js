// imports/ui/pages/AgentWorkflow/workflow-components/transform/map/executor.js

export default function executeMap(context) {
  const { node, input, services } = context;
  const { mapType, template, fieldMappings, customFunction, options = {} } = node.data;

  try {
    // Handle null or undefined input
    if (input === null || input === undefined) {
      return {
        success: true,
        data: input,
        metadata: {
          mapType,
          inputType: 'null/undefined',
          timestamp: new Date()
        }
      };
    }

    // Helper function to get nested value
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((current, key) => {
        // Handle array notation like items[0]
        const match = key.match(/^(.+)\[(\d+)\]$/);
        if (match) {
          const arrayKey = match[1];
          const index = parseInt(match[2]);
          return current?.[arrayKey]?.[index];
        }
        return current?.[key];
      }, obj);
    };

    // Helper function to set nested value
    const setNestedValue = (obj, path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
      }, obj);
      target[lastKey] = value;
    };

    // Apply transformations
    const applyTransform = (value, transform) => {
      if (value === null || value === undefined) return value;

      switch (transform) {
        case 'uppercase':
          return String(value).toUpperCase();
        case 'lowercase':
          return String(value).toLowerCase();
        case 'capitalize':
          return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
        case 'trim':
          return String(value).trim();
        case 'number':
          return Number(value);
        case 'boolean':
          return Boolean(value);
        case 'string':
          return String(value);
        case 'date':
          return new Date(value);
        case 'json':
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        case 'stringify':
          return JSON.stringify(value);
        case 'base64':
          return Buffer.from(String(value)).toString('base64');
        case 'base64decode':
          try {
            return Buffer.from(String(value), 'base64').toString('utf-8');
          } catch {
            return value;
          }
        default:
          return value;
      }
    };

    // Template-based mapping
    const applyTemplate = (item, template) => {
      const processValue = (value) => {
        if (typeof value === 'string') {
          // Replace placeholders in string
          return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
            const fieldValue = getNestedValue(item, path.trim());
            return fieldValue !== undefined ? fieldValue : match;
          });
        } else if (Array.isArray(value)) {
          return value.map(processValue);
        } else if (typeof value === 'object' && value !== null) {
          const result = {};
          for (const [key, val] of Object.entries(value)) {
            result[key] = processValue(val);
          }
          return result;
        }
        return value;
      };

      return processValue(template);
    };

    // Field-based mapping
    const applyFieldMapping = (item) => {
      const result = options.preserveOriginal ? { ...item } : {};

      for (const mapping of fieldMappings) {
        const { source, target, transform, defaultValue } = mapping;
        let value = getNestedValue(item, source);

        // Use default value if source is null/undefined
        if (value === null || value === undefined) {
          value = defaultValue || null;
        }

        // Apply transformation
        value = applyTransform(value, transform);

        // Skip null values if option is set
        if (options.skipNull && (value === null || value === undefined)) {
          continue;
        }

        // Set the value in result
        setNestedValue(result, target, value);
      }

      return result;
    };

    // Custom function mapping
    const applyCustomFunction = (item, index, array) => {
      try {
        const func = new Function('item', 'index', 'array', customFunction);
        return func(item, index, array);
      } catch (error) {
        console.error('Custom map function error:', error);
        return item;
      }
    };

    // Determine which mapping to use
    let mapFunction;
    switch (mapType) {
      case 'template':
        mapFunction = (item) => applyTemplate(item, template);
        break;
      case 'fields':
        mapFunction = applyFieldMapping;
        break;
      case 'custom':
        mapFunction = applyCustomFunction;
        break;
      default:
        mapFunction = (item) => item;
    }

    // Apply mapping based on input type
    let result;
    let processedCount = 0;

    if (Array.isArray(input)) {
      // Map array
      result = input.map(mapFunction);
      processedCount = result.length;

      // Flatten result if option is set
      if (options.flattenResult) {
        result = result.flat();
      }
    } else if (typeof input === 'object') {
      // Map single object
      result = mapFunction(input, 0, [input]);
      processedCount = 1;
    } else {
      // For primitive values, return as is
      result = input;
      processedCount = 1;
    }

    return {
      success: true,
      data: result,
      metadata: {
        mapType,
        inputType: Array.isArray(input) ? 'array' : typeof input,
        inputCount: Array.isArray(input) ? input.length : 1,
        outputCount: Array.isArray(result) ? result.length : 1,
        processedCount,
        timestamp: new Date()
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        mapType,
        timestamp: new Date()
      }
    };
  }
}
