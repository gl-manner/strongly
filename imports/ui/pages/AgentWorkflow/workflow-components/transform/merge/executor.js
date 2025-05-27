// imports/ui/pages/AgentWorkflow/workflow-components/transform/merge/executor.js

export default function executeMerge(context) {
  const { node, inputs, services } = context; // Note: uses 'inputs' array instead of single 'input'
  const {
    mergeType,
    mergeStrategy,
    arrayHandling,
    joinOptions,
    keyMapping,
    customFunction,
    options = {}
  } = node.data;

  try {
    // Filter inputs based on options
    let validInputs = inputs || [];

    if (options.skipNull) {
      validInputs = validInputs.filter(input => input !== null && input !== undefined);
    }

    if (options.skipEmpty) {
      validInputs = validInputs.filter(input => {
        if (Array.isArray(input)) return input.length > 0;
        if (typeof input === 'object' && input !== null) return Object.keys(input).length > 0;
        if (typeof input === 'string') return input.length > 0;
        return true;
      });
    }

    // Handle no valid inputs
    if (validInputs.length === 0) {
      return {
        success: true,
        data: null,
        metadata: {
          mergeType,
          inputCount: inputs.length,
          validInputCount: 0,
          timestamp: new Date()
        }
      };
    }

    // Deep merge helper
    const deepMerge = (target, source) => {
      const output = { ...target };

      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
              output[key] = deepMerge(target[key], source[key]);
            } else {
              output[key] = source[key];
            }
          } else {
            output[key] = source[key];
          }
        }
      }

      return output;
    };

    let result;
    let mergeDetails = {
      mergeType,
      inputCount: inputs.length,
      validInputCount: validInputs.length
    };

    switch (mergeType) {
      case 'object':
        // Merge objects based on strategy
        if (keyMapping && Object.keys(keyMapping).length > 0) {
          // Use key mapping
          result = {};
          for (const [index, key] of Object.entries(keyMapping)) {
            const inputIndex = parseInt(index);
            if (validInputs[inputIndex] !== undefined) {
              result[key] = validInputs[inputIndex];
            }
          }
        } else {
          // Standard object merge
          if (mergeStrategy === 'deep') {
            result = validInputs.reduce((acc, input) => deepMerge(acc, input), {});
          } else if (mergeStrategy === 'replace') {
            result = validInputs[validInputs.length - 1];
          } else {
            // Shallow merge
            result = Object.assign({}, ...validInputs);
          }
        }
        mergeDetails.strategy = mergeStrategy;
        break;

      case 'array':
      case 'concat':
        // Handle array merging
        const arrays = validInputs.map(input => {
          if (Array.isArray(input)) return input;
          return [input]; // Wrap non-arrays
        });

        switch (arrayHandling) {
          case 'merge':
            // Merge by index
            const maxLength = Math.max(...arrays.map(arr => arr.length));
            result = [];
            for (let i = 0; i < maxLength; i++) {
              const itemsAtIndex = arrays.map(arr => arr[i]).filter(item => item !== undefined);
              if (itemsAtIndex.length === 1) {
                result[i] = itemsAtIndex[0];
              } else if (itemsAtIndex.length > 1) {
                // Merge items at same index
                if (typeof itemsAtIndex[0] === 'object') {
                  result[i] = Object.assign({}, ...itemsAtIndex);
                } else {
                  result[i] = itemsAtIndex[itemsAtIndex.length - 1]; // Last wins
                }
              }
            }
            break;

          case 'replace':
            result = arrays[arrays.length - 1];
            break;

          case 'unique':
            result = [...new Set(arrays.flat())];
            break;

          default: // concat
            result = arrays.flat();
        }

        if (options.removeDuplicates && arrayHandling !== 'unique') {
          result = [...new Set(result)];
        }

        mergeDetails.arrayHandling = arrayHandling;
        mergeDetails.resultLength = result.length;
        break;

      case 'join':
        // Join strings
        const strings = validInputs.map(input => {
          if (typeof input === 'string') return input;
          if (typeof input === 'object') return JSON.stringify(input);
          return String(input);
        });

        result = joinOptions.prefix + strings.join(joinOptions.separator) + joinOptions.suffix;
        mergeDetails.joinedCount = strings.length;
        break;

      case 'custom':
        // Custom merge function
        try {
          const func = new Function('inputs', customFunction);
          result = func(validInputs);
        } catch (error) {
          throw new Error(`Custom merge function error: ${error.message}`);
        }
        break;

      default:
        // Fallback to simple array
        result = validInputs;
    }

    return {
      success: true,
      data: result,
      metadata: {
        ...mergeDetails,
        timestamp: new Date()
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        mergeType,
        inputCount: inputs ? inputs.length : 0,
        timestamp: new Date()
      }
    };
  }
}
