// /imports/api/agents/publications.js
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Agents, AgentStatus, AgentLogs } from '/imports/api/agents/collection';

if (Meteor.isServer) {
  /**
   * Publish user's agents with pagination and filters
   * Meteor 3.x async publication
   */
  Meteor.publish('agents', async function(options = {}) {
    if (!this.userId) {
      return this.ready();
    }

    const {
      limit = 50,
      sort = { lastUpdated: -1 },
      filter = {}
    } = options;

    try {
      // Build query
      const query = {
        ...filter,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      // Return cursor
      return Agents.find(query, { limit, sort });
    } catch (error) {
      console.error('Error in agents publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agents');
    }
  });

  /**
   * Publish a single agent with permission check
   * Meteor 3.x async publication
   */
  Meteor.publish('agent.single', async function(agentId) {
    check(agentId, String);

    if (!this.userId || !agentId) {
      return this.ready();
    }

    try {
      // Check if user has access to this agent
      const agent = await Agents.findOneAsync({
        _id: agentId,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        return this.ready();
      }

      // Return cursor for reactive updates
      return Agents.find({
        _id: agentId,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });
    } catch (error) {
      console.error('Error in agent.single publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agent');
    }
  });

  /**
   * Publish agent statuses
   * Meteor 3.x async publication
   */
  Meteor.publish('agentStatuses', async function(agentId) {
    check(agentId, String);

    if (!this.userId || !agentId) {
      return this.ready();
    }

    try {
      // Verify user has access to the agent
      const agent = await Agents.findOneAsync({
        _id: agentId,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        return this.ready();
      }

      return AgentStatus.find({ agentId });
    } catch (error) {
      console.error('Error in agentStatuses publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agent statuses');
    }
  });

  /**
   * Publish agent logs with pagination
   * Meteor 3.x async publication
   */
  Meteor.publish('agentLogs', async function(agentId, options = {}) {
    check(agentId, String);
    check(options, Object);

    if (!this.userId || !agentId) {
      return this.ready();
    }

    const { limit = 100 } = options;

    try {
      // Verify user has access to the agent
      const agent = await Agents.findOneAsync({
        _id: agentId,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        return this.ready();
      }

      return AgentLogs.find(
        { agentId },
        { sort: { createdAt: -1 }, limit }
      );
    } catch (error) {
      console.error('Error in agentLogs publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agent logs');
    }
  });

  /**
   * Publish agents by status
   * Meteor 3.x async publication
   */
  Meteor.publish('agents.byStatus', async function(status) {
    check(status, String);

    if (!this.userId) {
      return this.ready();
    }

    try {
      const query = {
        status,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      return Agents.find(query, {
        sort: { lastUpdated: -1 }
      });
    } catch (error) {
      console.error('Error in agents.byStatus publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agents by status');
    }
  });

  /**
   * Publish agent statistics for dashboard
   * Meteor 3.x async publication
   */
  Meteor.publish('agents.stats', async function() {
    if (!this.userId) {
      return this.ready();
    }

    try {
      const query = {
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      // Return minimal fields for statistics
      return Agents.find(query, {
        fields: {
          status: 1,
          ownerId: 1,
          createdAt: 1,
          lastUpdated: 1,
          nodes: 1
        }
      });
    } catch (error) {
      console.error('Error in agents.stats publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load agent statistics');
    }
  });

  /**
   * Publish shared agents
   * Meteor 3.x async publication
   */
  Meteor.publish('agents.shared', async function() {
    if (!this.userId) {
      return this.ready();
    }

    try {
      return Agents.find({
        sharedWith: this.userId,
        ownerId: { $ne: this.userId }
      });
    } catch (error) {
      console.error('Error in agents.shared publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load shared agents');
    }
  });

  /**
   * Publish agent templates
   * Meteor 3.x async publication
   */
  Meteor.publish('agents.templates', async function() {
    try {
      return Agents.find({
        isTemplate: true,
        $or: [
          { isPublic: true },
          { ownerId: this.userId }
        ]
      }, {
        fields: {
          name: 1,
          description: 1,
          tags: 1,
          ownerName: 1,
          nodes: 1,
          connections: 1,
          createdAt: 1,
          isTemplate: 1,
          isPublic: 1
        }
      });
    } catch (error) {
      console.error('Error in agents.templates publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load templates');
    }
  });

  /**
   * Search agents
   * Meteor 3.x async publication
   */
  Meteor.publish('agents.search', async function(searchTerm, options = {}) {
    check(searchTerm, String);
    check(options, Object);

    if (!this.userId) {
      return this.ready();
    }

    const {
      limit = 50,
      status,
      tags
    } = options;

    try {
      // Build search query
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

      // Add filters
      if (status) {
        query.$and.push({ status });
      }

      if (tags && tags.length > 0) {
        query.$and.push({ tags: { $in: tags } });
      }

      return Agents.find(query, {
        limit,
        sort: { lastUpdated: -1 }
      });
    } catch (error) {
      console.error('Error in agents.search publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to search agents');
    }
  });

  /**
   * Publish recent activity
   * Meteor 3.x async publication with multiple cursors
   */
  Meteor.publish('agents.recentActivity', async function(limit = 20) {
    check(limit, Number);

    if (!this.userId) {
      return this.ready();
    }

    try {
      const query = {
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      };

      // Return array of cursors for multiple collections
      return [
        Agents.find(query, {
          sort: { lastUpdated: -1 },
          limit: Math.floor(limit / 2),
          fields: {
            name: 1,
            status: 1,
            ownerName: 1,
            lastUpdated: 1
          }
        }),
        AgentLogs.find(
          { userId: this.userId },
          {
            sort: { createdAt: -1 },
            limit: Math.floor(limit / 2),
            fields: {
              agentId: 1,
              action: 1,
              createdAt: 1
            }
          }
        )
      ];
    } catch (error) {
      console.error('Error in agents.recentActivity publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load recent activity');
    }
  });

  /**
   * Publish user data for agent access
   * Meteor 3.x async publication
   */
  Meteor.publish('userData', async function() {
    if (!this.userId) {
      return this.ready();
    }

    try {
      return Meteor.users.find(
        { _id: this.userId },
        {
          fields: {
            username: 1,
            emails: 1,
            profile: 1,
            roles: 1
          }
        }
      );
    } catch (error) {
      console.error('Error in userData publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load user data');
    }
  });

  /**
   * Publish workflow execution status
   * Meteor 3.x async publication with reactive aggregation
   */
  Meteor.publish('agents.executionStatus', async function(agentId) {
    check(agentId, String);

    if (!this.userId || !agentId) {
      return this.ready();
    }

    try {
      // Verify access
      const agent = await Agents.findOneAsync({
        _id: agentId,
        $or: [
          { ownerId: this.userId },
          { sharedWith: this.userId }
        ]
      });

      if (!agent) {
        return this.ready();
      }

      // Return execution status
      return AgentStatus.find(
        { agentId },
        {
          sort: { updatedAt: -1 },
          limit: 1
        }
      );
    } catch (error) {
      console.error('Error in agents.executionStatus publication:', error);
      throw new Meteor.Error('publication-error', 'Failed to load execution status');
    }
  });
}
