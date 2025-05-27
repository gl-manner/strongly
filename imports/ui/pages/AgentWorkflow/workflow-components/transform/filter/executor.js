// imports/ui/pages/AgentWorkflow/workflow-components/transform/filter/executor.js

export default function executeFilter(context) {
  const { node, input, services } = context;
  const { filterType, conditions, logic, advancedExpression, customFunction, options = {} } = node.data;

  try {
    // Handle null or undefined input
    if (input === null || input === undefined) {
      return {
        success: true,
        data: options.keepEmpty ? input : null,
        metadata: {
          filterType,
          inputType: 'null/undefined',
          timestamp: new Date()
        }
      };
    }

    // Get value at nested path
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

    // Evaluate a single condition
    const evaluateCondition = (item, condition) => {
      const { field, operator, value, caseSensitive } = condition;
      let fieldValue = getNestedValue(item, field);
      let compareValue = value;

      // Handle case sensitivity for string comparisons
      if (!caseSensitive && typeof fieldValue === 'string' && typeof compareValue === 'string') {
        fieldValue = fieldValue.toLowerCase();
        compareValue = compareValue.toLowerCase();
      }

      switch (operator) {
        case 'equals':
          return fieldValue === compareValue;
        case 'not_equals':
          return fieldValue !== compareValue;
        case 'contains':
          return String(fieldValue).includes(compareValue);
        case 'not_contains':
          return !String(fieldValue).includes(compareValue);
        case 'starts_with':
          return String(fieldValue).startsWith(compareValue);
        case 'ends_with':
          return String(fieldValue).endsWith(compareValue);
        case 'greater_than':
          return Number(fieldValue) > Number(compareValue);
        case 'less_than':
          return Number(fieldValue) < Number(compareValue);
        case 'greater_equal':
          return Number(fieldValue) >= Number(compareValue);
        case 'less_equal':
          return Number(fieldValue) <= Number(compareValue);
        case 'in':
          const list = compareValue.split(',').map(v => v.trim());
          return list.includes(String(fieldValue));
        case 'not_in':
          const notList = compareValue.split(',').map(v => v.trim());
          return !notList.includes(String(fieldValue));
        case 'is_empty':
          return fieldValue === '' || fieldValue === null || fieldValue === undefined;
        case 'is_not_empty':
          return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
        case 'is_null':
          return fieldValue === null;
        case 'is_not_null':
          return fieldValue !== null;
        case 'regex':
          try {
            const regex = new RegExp(compareValue, caseSensitive ? '' : 'i');
            return regex.test(String(fieldValue));
          } catch {
            return false;
          }
        default:
          return true;
      }
    };

    // Simple filter logic
    const simpleFilter = (item) => {
      if (!conditions || conditions.length === 0) return true;

      if (logic === 'or') {
        return conditions.some(condition => evaluateCondition(item, condition));
      } else {
        return conditions.every(condition => evaluateCondition(item, condition));
      }
    };

    // Advanced filter logic
    const advancedFilter = (item) => {
      try {
        // Create a safe evaluation context
        const func = new Function('item', `return ${advancedExpression}`);
        return func(item);
      } catch (error) {
        console.error('Advanced filter error:', error);
        return false;
      }
    };

    // Custom filter logic
    const customFilter = (item, index, array) => {
      try {
        const func = new Function('item', 'index', 'array', customFunction);
        return func(item, index, array);
      } catch (error) {
        console.error('Custom filter error:', error);
        return false;
      }
    };

    // Determine which filter to use
    let filterFunction;
    switch (filterType) {
      case 'advanced':
        filterFunction = advancedFilter;
        break;
      case 'custom':
        filterFunction = customFilter;
        break;
      default:
        filterFunction = simpleFilter;
    }

    // Apply filter based on input type
    let result;
    let filtered = 0;
    let kept = 0;

    if (Array.isArray(input)) {
      // Filter array
      if (options.returnFirst) {
        result = input.find(filterFunction);
        kept = result !== undefined ? 1 : 0;
        filtered = input.length - kept;
      } else {
        result = input.filter(filterFunction);
        kept = result.length;
        filtered = input.length - kept;
      }
    } else if (typeof input === 'object') {
      // Filter object (return object if it passes, null if not)
      const passes = filterFunction(input, 0, [input]);
      result = passes ? input : null;
      kept = passes ? 1 : 0;
      filtered = passes ? 0 : 1;
    } else {
      // For primitive values, just pass through
      result = input;
      kept = 1;
      filtered = 0;
    }

    return {
      success: true,
      data: result,
      metadata: {
        filterType,
        inputType: Array.isArray(input) ? 'array' : typeof input,
        inputCount: Array.isArray(input) ? input.length : 1,
        outputCount: Array.isArray(result) ? result.length : (result !== null ? 1 : 0),
        filtered,
        kept,
        logic: filterType === 'simple' ? logic : filterType,
        timestamp: new Date()
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      metadata: {
        filterType,
        timestamp: new Date()
      }
    };
  }
}
