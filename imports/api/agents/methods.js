// /imports/api/agents/methods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Agents, AgentStatus, AgentLogs } from '/imports/api/agents/collection';

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Create a new agent workflow
     * @param {Object} agent - Agent data
     * @returns {string} - ID of created agent
     */
    async 'agents.create'(agent) {
      check(agent, {
        name: String,
        description: Match.Optional(String),
        status: Match.Optional(String),
        nodes: Match.Optional(Array),
        connections: Match.Optional(Array),
        tags: Match.Optional(Array),
        settings: Match.Optional(Object)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to create workflows');
      }

      // Get user for owner info
      const user = await Meteor.users.findOneAsync(this.userId);

      const newAgent = {
        ...agent,
        ownerId: this.userId,
        ownerName: user?.profile?.name || user?.username || 'Unknown',
        status: agent.status || 'draft',
        nodes: agent.nodes || [],
        connections: agent.connections || [],
        tags: agent.tags || [],
        settings: {
          autoSave: true,
          timeout: 300000,
          retryAttempts: 3,
          enableLogging: true,
          logLevel: 'info',
          ...agent.settings
        },
        sharedWith: [],
        isTemplate: false,
        isPublic: false,
        version: 1,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      // Check for duplicate name before inserting
      const existingAgent = await Agents.findOneAsync({
        name: newAgent.name,
        ownerId: this.userId
      });

      if (existingAgent) {
        throw new Meteor.Error('duplicate-name', 'You already have a workflow with this name. Please choose a different name.');
      }

      try {
        const agentId = await Agents.insertAsync(newAgent);

        // Log creation
        await AgentLogs.insertAsync({
          agentId,
          level: 'info',
          message: 'Workflow created',
          userId: this.userId,
          createdAt: new Date()
        });

        return agentId;
      } catch (error) {
        if (error.code === 11000) {
          throw new Meteor.Error('duplicate-name', 'A workflow with this name already exists');
        }
        throw error;
      }
    },

    /**
     * Update an existing agent workflow
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {Object} updates - Fields to update
     * @returns {number} - Number of documents updated
     */
    async 'agents.update'(agentId, updates) {
      // Convert agentId to string to handle both string and number inputs
      const agentIdStr = String(agentId);

      check(agentIdStr, String);
      check(updates, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update workflows');
      }

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.ownerId;
      delete updates.ownerName;
      delete updates.createdAt;
      delete updates.version;

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      // Check permissions
      if (agent.ownerId !== this.userId && !agent.sharedWith.includes(this.userId)) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to edit this workflow');
      }

      // Check for duplicate name if name is being updated
      if (updates.name && updates.name !== agent.name) {
        const existingAgent = await Agents.findOneAsync({
          name: updates.name,
          ownerId: agent.ownerId,
          _id: { $ne: agentIdStr } // Exclude current agent
        });

        if (existingAgent) {
          throw new Meteor.Error('duplicate-name', 'You already have a workflow with this name. Please choose a different name.');
        }
      }

      // Add lastUpdated timestamp
      updates.lastUpdated = new Date();

      try {
        const result = await Agents.updateAsync(agentIdStr, { $set: updates });

        // Log update
        await AgentLogs.insertAsync({
          agentId: agentIdStr,
          level: 'info',
          message: 'Workflow updated',
          data: { fields: Object.keys(updates) },
          userId: this.userId,
          createdAt: new Date()
        });

        return result;
      } catch (error) {
        if (error.code === 11000) {
          throw new Meteor.Error('duplicate-name', 'A workflow with this name already exists');
        }
        throw error;
      }
    },

    /**
     * Get a single agent by ID
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {Object} - Agent document
     */
    async 'agents.get'(agentId) {
      // Convert agentId to string to handle both string and number inputs
      const agentIdStr = String(agentId);

      check(agentIdStr, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to view workflows');
      }

      const agent = await Agents.findOneAsync({
        _id: agentIdStr,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId },
          { isPublic: true }
        ]
      });

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found or access denied');
      }

      return agent;
    },

    /**
     * Delete an agent workflow
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {number} - Number of documents removed
     */
    async 'agents.remove'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to delete workflows');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId) {
        throw new Meteor.Error('not-authorized', 'You can only delete your own workflows');
      }

      // Remove associated data
      await AgentStatus.removeAsync({ agentId: agentIdStr });
      await AgentLogs.removeAsync({ agentId: agentIdStr });

      return await Agents.removeAsync(agentIdStr);
    },

    /**
     * Duplicate an agent workflow
     * @param {string|number} agentId - Agent ID to duplicate (will be converted to string)
     * @returns {string} - ID of new agent
     */
    async 'agents.duplicate'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to duplicate workflows');
      }

      const agent = await Agents.findOneAsync({
        _id: agentIdStr,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId },
          { isPublic: true }
        ]
      });

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found or access denied');
      }

      const user = await Meteor.users.findOneAsync(this.userId);

      // Create new agent with copied data
      const newAgent = {
        ...agent,
        _id: undefined,
        name: `${agent.name} (Copy)`,
        status: 'draft',
        ownerId: this.userId,
        ownerName: user?.profile?.name || user?.username || 'Unknown',
        sharedWith: [],
        isTemplate: false,
        version: 1,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      delete newAgent._id;

      return await Agents.insertAsync(newAgent);
    },

    /**
     * Update agent status
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {string} status - New status
     * @returns {number} - Number of documents updated
     */
    async 'agents.updateStatus'(agentId, status) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);
      check(status, Match.Where(s => ['draft', 'active', 'paused', 'archived'].includes(s)));

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update workflow status');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId) {
        throw new Meteor.Error('not-authorized', 'You can only update status of your own workflows');
      }

      const result = await Agents.updateAsync(agentIdStr, {
        $set: {
          status,
          lastUpdated: new Date()
        }
      });

      // Log status change
      await AgentLogs.insertAsync({
        agentId: agentIdStr,
        level: 'info',
        message: `Workflow status changed to ${status}`,
        data: { oldStatus: agent.status, newStatus: status },
        userId: this.userId,
        createdAt: new Date()
      });

      // Update all node statuses if deploying
      if (status === 'active' && agent.nodes) {
        for (const node of agent.nodes) {
          await AgentStatus.upsertAsync(
            { agentId: agentIdStr, nodeId: node.id },
            {
              $set: {
                agentId: agentIdStr,
                nodeId: node.id,
                status: 'idle',
                updatedAt: new Date()
              }
            }
          );
        }
      }

      return result;
    },

    /**
     * Deploy an agent (change status to active)
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {number} - Number of documents updated
     */
    async 'agents.deploy'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (!agent.nodes || agent.nodes.length === 0) {
        throw new Meteor.Error('invalid-workflow', 'Cannot deploy empty workflow');
      }

      return await Meteor.callAsync('agents.updateStatus', agentIdStr, 'active');
    },

    /**
     * Pause an agent
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {number} - Number of documents updated
     */
    async 'agents.pause'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      return await Meteor.callAsync('agents.updateStatus', agentIdStr, 'paused');
    },

    /**
     * List agents with filters
     * @param {Object} options - Query options
     * @returns {Object} - Agents and pagination info
     */
    async 'agents.list'(options = {}) {
      check(options, {
        page: Match.Optional(Number),
        limit: Match.Optional(Number),
        sort: Match.Optional(Object),
        filter: Match.Optional(Object)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to list workflows');
      }

      const {
        page = 1,
        limit = 20,
        sort = { lastUpdated: -1 },
        filter = {}
      } = options;

      const skip = (page - 1) * limit;

      const query = {
        ...filter,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      const [agents, total] = await Promise.all([
        Agents.find(query, { sort, skip, limit }).fetchAsync(),
        Agents.find(query).countAsync()
      ]);

      return {
        agents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    },

    /**
     * Search agents
     * @param {string} searchTerm - Search term
     * @param {Object} options - Search options
     * @returns {Array} - Matching agents
     */
    async 'agents.search'(searchTerm, options = {}) {
      check(searchTerm, String);
      check(options, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to search workflows');
      }

      const query = {
        $and: [
          {
            $or: [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
              { tags: { $in: [searchTerm] } }
            ]
          },
          {
            $or: [
              { ownerId: this.userId },
              { sharedWith: this.userId }
            ]
          }
        ]
      };

      return await Agents.find(query, {
        limit: options.limit || 50,
        sort: options.sort || { lastUpdated: -1 }
      }).fetchAsync();
    },

    /**
     * Share workflow with another user
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {string} userId - User ID to share with
     * @returns {number} - Number of documents updated
     */
    async 'agents.share'(agentId, userId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);
      check(userId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to share workflows');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId) {
        throw new Meteor.Error('not-authorized', 'You can only share your own workflows');
      }

      if (agent.sharedWith.includes(userId)) {
        throw new Meteor.Error('already-shared', 'Workflow is already shared with this user');
      }

      const user = await Meteor.users.findOneAsync(userId);
      if (!user) {
        throw new Meteor.Error('user-not-found', 'User not found');
      }

      return await Agents.updateAsync(agentIdStr, {
        $addToSet: { sharedWith: userId },
        $set: { lastUpdated: new Date() }
      });
    },

    /**
     * Unshare workflow with a user
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {string} userId - User ID to unshare with
     * @returns {number} - Number of documents updated
     */
    async 'agents.unshare'(agentId, userId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);
      check(userId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to unshare workflows');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId) {
        throw new Meteor.Error('not-authorized', 'You can only unshare your own workflows');
      }

      return await Agents.updateAsync(agentIdStr, {
        $pull: { sharedWith: userId },
        $set: { lastUpdated: new Date() }
      });
    },

    /**
     * Get shared users for a workflow
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {Array} - Array of users
     */
    async 'agents.getSharedUsers'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId && !agent.sharedWith.includes(this.userId)) {
        throw new Meteor.Error('not-authorized', 'Access denied');
      }

      if (!agent.sharedWith || agent.sharedWith.length === 0) {
        return [];
      }

      return await Meteor.users.find(
        { _id: { $in: agent.sharedWith } },
        {
          fields: {
            username: 1,
            'profile.name': 1,
            'emails.address': 1
          }
        }
      ).fetchAsync();
    },

    /**
     * Get workflow statistics
     * @returns {Object} - Statistics
     */
    async 'agents.getStats'() {
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const query = {
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      const [total, active, paused, draft] = await Promise.all([
        Agents.find(query).countAsync(),
        Agents.find({ ...query, status: 'active' }).countAsync(),
        Agents.find({ ...query, status: 'paused' }).countAsync(),
        Agents.find({ ...query, status: 'draft' }).countAsync()
      ]);

      return {
        total,
        active,
        paused,
        draft,
        archived: total - active - paused - draft
      };
    },

    /**
     * Test workflow execution
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {Object} testData - Test input data
     * @returns {Object} - Test results
     */
    async 'agents.test'(agentId, testData = {}) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);
      check(testData, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to test workflows');
      }

      const agent = await Agents.findOneAsync({
        _id: agentIdStr,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found or access denied');
      }

      // Create execution ID
      const executionId = Random.id();

      // Log test start
      await AgentLogs.insertAsync({
        agentId: agentIdStr,
        executionId,
        level: 'info',
        message: 'Test execution started',
        data: testData,
        userId: this.userId,
        createdAt: new Date()
      });

      // Here you would implement actual workflow execution logic
      // For now, return mock results
      const results = {
        executionId,
        success: true,
        startTime: new Date(),
        endTime: new Date(),
        nodes: agent.nodes.map(node => ({
          nodeId: node.id,
          status: 'success',
          output: { message: `Node ${node.label} executed successfully` }
        }))
      };

      // Log test completion
      await AgentLogs.insertAsync({
        agentId: agentIdStr,
        executionId,
        level: 'info',
        message: 'Test execution completed',
        data: results,
        userId: this.userId,
        createdAt: new Date()
      });

      return results;
    },

    /**
     * Get execution logs
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @param {Object} options - Query options
     * @returns {Array} - Logs
     */
    async 'agents.getLogs'(agentId, options = {}) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);
      check(options, {
        limit: Match.Optional(Number),
        executionId: Match.Optional(String),
        level: Match.Optional(String)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const agent = await Agents.findOneAsync({
        _id: agentIdStr,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found or access denied');
      }

      const query = { agentId: agentIdStr };

      if (options.executionId) {
        query.executionId = options.executionId;
      }

      if (options.level) {
        query.level = options.level;
      }

      return await AgentLogs.find(query, {
        sort: { createdAt: -1 },
        limit: options.limit || 100
      }).fetchAsync();
    },

    /**
     * Create template from workflow
     * @param {string|number} agentId - Agent ID (will be converted to string)
     * @returns {string} - Template ID
     */
    async 'agents.createTemplate'(agentId) {
      const agentIdStr = String(agentId);
      check(agentIdStr, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const agent = await Agents.findOneAsync(agentIdStr);

      if (!agent) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      if (agent.ownerId !== this.userId) {
        throw new Meteor.Error('not-authorized', 'You can only create templates from your own workflows');
      }

      const user = await Meteor.users.findOneAsync(this.userId);

      const template = {
        ...agent,
        _id: undefined,
        name: `${agent.name} Template`,
        status: 'draft',
        isTemplate: true,
        isPublic: false,
        templateId: agentIdStr,
        ownerId: this.userId,
        ownerName: user?.profile?.name || user?.username || 'Unknown',
        sharedWith: [],
        version: 1,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      delete template._id;

      return await Agents.insertAsync(template);
    },

    /**
     * Get workflow templates
     * @returns {Array} - Available templates
     */
    async 'agents.getTemplates'() {
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      return await Agents.find({
        isTemplate: true,
        $or: [
          { ownerId: this.userId },
          { isPublic: true }
        ]
      }).fetchAsync();
    },

    /**
     * Create workflow from template
     * @param {string|number} templateId - Template ID (will be converted to string)
     * @param {Object} customizations - Custom values
     * @returns {string} - New workflow ID
     */
    async 'agents.createFromTemplate'(templateId, customizations = {}) {
      const templateIdStr = String(templateId);
      check(templateIdStr, String);
      check(customizations, Object);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const template = await Agents.findOneAsync({
        _id: templateIdStr,
        isTemplate: true,
        $or: [
          { ownerId: this.userId },
          { isPublic: true }
        ]
      });

      if (!template) {
        throw new Meteor.Error('not-found', 'Template not found or access denied');
      }

      const user = await Meteor.users.findOneAsync(this.userId);

      const newAgent = {
        ...template,
        ...customizations,
        _id: undefined,
        name: customizations.name || `New workflow from ${template.name}`,
        status: 'draft',
        isTemplate: false,
        templateId: templateIdStr,
        ownerId: this.userId,
        ownerName: user?.profile?.name || user?.username || 'Unknown',
        sharedWith: [],
        version: 1,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      delete newAgent._id;

      return await Agents.insertAsync(newAgent);
    }
  });
}
