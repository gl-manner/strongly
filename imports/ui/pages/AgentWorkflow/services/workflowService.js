import { Meteor } from 'meteor/meteor';

class WorkflowService {
  // Create a new workflow
  create(workflow) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.create', workflow, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Update existing workflow
  update(workflowId, updates) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.update', workflowId, updates, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get single workflow
  get(workflowId) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.get', workflowId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Delete workflow
  delete(workflowId) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.remove', workflowId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Duplicate workflow
  duplicate(workflowId) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.duplicate', workflowId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Deploy workflow
  deploy(workflowId) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.deploy', workflowId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Pause workflow
  pause(workflowId) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.pause', workflowId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Test workflow
  test(workflowId, testData = {}) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.test', workflowId, testData, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get workflow execution logs
  getLogs(workflowId, options = {}) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.getLogs', workflowId, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Validate workflow
  validate(workflow) {
    const errors = [];

    // Check if workflow has a name
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({ field: 'name', message: 'Workflow name is required' });
    }

    // Check if workflow has at least one node
    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push({ field: 'nodes', message: 'Workflow must have at least one node' });
    }

    // Check if all nodes have required data
    workflow.nodes?.forEach((node, index) => {
      if (!node.type) {
        errors.push({ field: `nodes[${index}].type`, message: 'Node type is required' });
      }
      if (!node.position) {
        errors.push({ field: `nodes[${index}].position`, message: 'Node position is required' });
      }
    });

    // Validate connections
    workflow.connections?.forEach((connection, index) => {
      if (!connection.source || !connection.target) {
        errors.push({ field: `connections[${index}]`, message: 'Connection must have source and target' });
      }

      // Check if source and target nodes exist
      const sourceExists = workflow.nodes?.some(n => n.id === connection.source);
      const targetExists = workflow.nodes?.some(n => n.id === connection.target);

      if (!sourceExists) {
        errors.push({ field: `connections[${index}].source`, message: 'Source node does not exist' });
      }
      if (!targetExists) {
        errors.push({ field: `connections[${index}].target`, message: 'Target node does not exist' });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Export workflow as JSON
  export(workflow) {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workflow: {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import workflow from JSON
  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (!data.workflow) {
            throw new Error('Invalid workflow file format');
          }

          // Validate imported workflow
          const validation = this.validate(data.workflow);
          if (!validation.isValid) {
            throw new Error(`Invalid workflow: ${validation.errors[0].message}`);
          }

          resolve(data.workflow);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }
}

export default new WorkflowService();
