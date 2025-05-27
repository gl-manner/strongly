// imports/ui/pages/AgentWorkflow/workflow-components/transform/code/executor.js

import { VM } from 'vm2'; // For sandboxed execution
import _ from 'lodash';
import moment from 'moment';
import crypto from 'crypto';

export default async function executeCode(context) {
  const { node, input, services } = context;
  const {
    code,
    timeout = 5000,
    libraries = {},
    errorHandling = 'throw',
    options = {}
  } = node.data;

  // Console output capture
  const consoleOutput = [];
  const customConsole = {
    log: (...args) => {
      consoleOutput.push({ type: 'log', message: args.join(' '), timestamp: new Date() });
      console.log(...args); // Also log to real console
    },
    error: (...args) => {
      consoleOutput.push({ type: 'error', message: args.join(' '), timestamp: new Date() });
      console.error(...args);
    },
    warn: (...args) => {
      consoleOutput.push({ type: 'warn', message: args.join(' '), timestamp: new Date() });
      console.warn(...args);
    },
    info: (...args) => {
      consoleOutput.push({ type: 'info', message: args.join(' '), timestamp: new Date() });
      console.info(...args);
    }
  };

  // Build execution context
  const executionContext = {
    workflow: {
      id: context.workflowId,
      name: context.workflowName,
      version: context.workflowVersion
    },
    node: {
      id: node.id,
      type: node.type,
      label: node.label
    },
    execution: {
      id: context.executionId,
      timestamp: new Date(),
      environment: context.environment || 'production'
    }
  };

  try {
    let result;

    if (options.sandboxed && VM) {
      // Sandboxed execution using vm2
      const sandbox = {
        input,
        context: executionContext,
        console: customConsole,
        JSON,
        Math,
        Date,
        Array,
        Object,
        Buffer,
        Promise
      };

      // Add optional libraries
      if (libraries.lodash) sandbox._ = _;
      if (libraries.moment) sandbox.moment = moment;
      if (libraries.crypto) sandbox.crypto = crypto;

      const vm = new VM({
        timeout,
        sandbox,
        wasm: false,
        fixAsync: options.asyncAllowed
      });

      // Execute code
      if (options.asyncAllowed && code.includes('await')) {
        // Wrap in async function if using await
        const asyncCode = `(async () => { ${code} })()`;
        result = await vm.run(asyncCode);
      } else {
        result = vm.run(code);
      }
    } else {
      // Non-sandboxed execution (less secure)
      const globals = ['input', 'context', 'console'];
      const globalValues = [input, executionContext, customConsole];

      // Add standard globals
      globals.push('JSON', 'Math', 'Date', 'Array', 'Object', 'Buffer');
      globalValues.push(JSON, Math, Date, Array, Object, Buffer);

      // Add optional libraries
      if (libraries.lodash) {
        globals.push('_');
        globalValues.push(_);
      }
      if (libraries.moment) {
        globals.push('moment');
        globalValues.push(moment);
      }
      if (libraries.crypto) {
        globals.push('crypto');
        globalValues.push(crypto);
      }

      // Create function
      const func = options.asyncAllowed
        ? new Function(...globals, `return (async () => { ${code} })()`)
        : new Function(...globals, code);

      // Execute with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Code execution timeout')), timeout);
      });

      const executionPromise = func(...globalValues);

      result = await Promise.race([executionPromise, timeoutPromise]);
    }

    return {
      success: true,
      data: result,
      metadata: {
        executionTime: Date.now() - executionContext.execution.timestamp.getTime(),
        sandboxed: options.sandboxed,
        asyncExecution: options.asyncAllowed,
        consoleOutput: options.preserveConsoleOutput ? consoleOutput : undefined,
        timestamp: new Date()
      }
    };

  } catch (error) {
    // Handle errors based on errorHandling setting
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      type: error.name,
      consoleOutput: options.preserveConsoleOutput ? consoleOutput : undefined
    };

    switch (errorHandling) {
      case 'returnError':
        return {
          success: false,
          data: {
            error: errorInfo,
            input: input
          },
          metadata: {
            errorHandling: 'returnError',
            timestamp: new Date()
          }
        };

      case 'returnNull':
        return {
          success: true,
          data: null,
          metadata: {
            errorHandling: 'returnNull',
            error: errorInfo,
            timestamp: new Date()
          }
        };

      default: // throw
        return {
          success: false,
          error: error.message,
          metadata: {
            errorHandling: 'throw',
            errorDetails: errorInfo,
            timestamp: new Date()
          }
        };
    }
  }
}
