import { Meteor } from 'meteor/meteor';

class AgentService {
  // Get all agents with pagination
  list(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { lastUpdated: -1 },
      filter = {}
    } = options;

    return new Promise((resolve, reject) => {
      Meteor.call('agents.list', { page, limit, sort, filter }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Search agents
  search(query, options = {}) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.search', query, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get agent statistics
  getStats() {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.getStats', (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get agent execution history
  getExecutionHistory(agentId, options = {}) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.getExecutionHistory', agentId, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Update agent status
  updateStatus(agentId, status) {
    return new Promise((resolve, reject) => {
      const validStatuses = ['draft', 'active', 'paused', 'archived'];

      if (!validStatuses.includes(status)) {
        reject(new Error(`Invalid status: ${status}`));
        return;
      }

      Meteor.call('agents.updateStatus', agentId, status, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Bulk operations
  bulkUpdate(agentIds, updates) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.bulkUpdate', agentIds, updates, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  bulkDelete(agentIds) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.bulkDelete', agentIds, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get agent templates
  getTemplates() {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.getTemplates', (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Create agent from template
  createFromTemplate(templateId, customizations = {}) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.createFromTemplate', templateId, customizations, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Share agent
  share(agentId, shareOptions) {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.share', agentId, shareOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Get shared agents
  getShared() {
    return new Promise((resolve, reject) => {
      Meteor.call('agents.getShared', (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default new AgentService();
