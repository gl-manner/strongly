// /imports/api/agents/collection.js
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

// Main collections
export const Agents = new Mongo.Collection('agents');
export const AgentStatus = new Mongo.Collection('agentStatus');
export const AgentLogs = new Mongo.Collection('agentLogs');

// Schema definitions for documentation purposes
export const NodeSchema = {
  id: String,
  type: String,
  category: String,
  label: String,
  icon: String,
  position: {
    x: Number,
    y: Number
  },
  data: Object,
  status: String
};

export const ConnectionSchema = {
  id: String,
  source: String,
  target: String,
  sourcePort: String,
  targetPort: String
};

export const AgentSchema = {
  name: String,
  description: String,
  status: String,
  nodes: [NodeSchema],
  connections: [ConnectionSchema],
  tags: [String],
  settings: {
    autoSave: Boolean,
    timeout: Number,
    retryAttempts: Number,
    enableLogging: Boolean,
    logLevel: String
  },
  ownerId: String,
  ownerName: String,
  sharedWith: [String],
  isTemplate: Boolean,
  isPublic: Boolean,
  templateId: String,
  version: Number,
  createdAt: Date,
  lastUpdated: Date
};

if (Meteor.isServer) {
  // Create indexes using Meteor 3.x async API
  Meteor.startup(async () => {
    try {
      console.log('Creating Agent collection indexes...');

      // IMPORTANT: Create unique compound index for name + ownerId
      // This ensures each user can't have duplicate workflow names
      await Agents.createIndexAsync(
        { name: 1, ownerId: 1 },
        { unique: true }
      );

      // Other indexes
      await Agents.createIndexAsync({ ownerId: 1 });
      await Agents.createIndexAsync({ status: 1 });
      await Agents.createIndexAsync({ name: 'text', description: 'text' });
      await Agents.createIndexAsync({ tags: 1 });
      await Agents.createIndexAsync({ sharedWith: 1 });
      await Agents.createIndexAsync({ lastUpdated: -1 });
      await Agents.createIndexAsync({ createdAt: -1 });
      await Agents.createIndexAsync({ isTemplate: 1, isPublic: 1 });

      // Compound indexes for common queries
      await Agents.createIndexAsync({ ownerId: 1, status: 1 });
      await Agents.createIndexAsync({ status: 1, lastUpdated: -1 });

      console.log('Creating AgentStatus collection indexes...');

      // AgentStatus collection indexes
      await AgentStatus.createIndexAsync({ agentId: 1, nodeId: 1 });
      await AgentStatus.createIndexAsync({ agentId: 1, executionId: 1 });
      await AgentStatus.createIndexAsync({ status: 1 });
      await AgentStatus.createIndexAsync({ updatedAt: -1 });
      await AgentStatus.createIndexAsync({ agentId: 1, status: 1, updatedAt: -1 });

      console.log('Creating AgentLogs collection indexes...');

      // AgentLogs collection indexes
      await AgentLogs.createIndexAsync({ agentId: 1, createdAt: -1 });
      await AgentLogs.createIndexAsync({ executionId: 1 });
      await AgentLogs.createIndexAsync({ level: 1 });
      await AgentLogs.createIndexAsync({ userId: 1 });

      // TTL index to automatically remove old logs after 30 days
      await AgentLogs.createIndexAsync(
        { createdAt: 1 },
        { expireAfterSeconds: 2592000 }
      );

      console.log('All Agent collection indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  });
}

// Export helper functions
export const AgentHelpers = {
  // Check if user has access to agent
  async canUserAccessAgent(userId, agentId) {
    const agent = await Agents.findOneAsync({
      _id: agentId,
      $or: [
        { ownerId: userId },
        { sharedWith: userId },
        { isPublic: true }
      ]
    });
    return !!agent;
  },

  // Check if user can edit agent
  async canUserEditAgent(userId, agentId) {
    const agent = await Agents.findOneAsync({
      _id: agentId,
      $or: [
        { ownerId: userId },
        { sharedWith: userId }
      ]
    });
    return !!agent;
  },

  // Get agent statistics
  async getAgentStats(userId) {
    const query = {
      $or: [
        { ownerId: userId },
        { sharedWith: userId }
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

  // Validate agent data
  validateAgent(agent) {
    const errors = [];

    if (!agent.name || agent.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    }

    if (agent.name && agent.name.length > 200) {
      errors.push({ field: 'name', message: 'Name must be less than 200 characters' });
    }

    if (agent.description && agent.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    if (agent.status && !['draft', 'active', 'paused', 'archived'].includes(agent.status)) {
      errors.push({ field: 'status', message: 'Invalid status value' });
    }

    if (agent.nodes) {
      agent.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push({ field: `nodes[${index}].id`, message: 'Node ID is required' });
        }
        if (!node.type) {
          errors.push({ field: `nodes[${index}].type`, message: 'Node type is required' });
        }
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          errors.push({ field: `nodes[${index}].position`, message: 'Valid node position is required' });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
