// /imports/api/workflowVersions/methods.js

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { WorkflowVersions, WorkflowSharing } from './collection';
import { Agents } from '/imports/api/agents/collection';

if (Meteor.isServer) {
  Meteor.methods({
    /**
     * Create a new version of a workflow
     */
    async 'workflows.versions.create'(workflowId, versionData) {
      check(workflowId, String);
      check(versionData, {
        name: String,
        description: Match.Optional(String),
        type: Match.Where(t => ['minor', 'major'].includes(t)),
        tag: Match.Optional(String)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to create versions');
      }

      // Get the workflow
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!workflow) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      // Check permissions
      const hasPermission = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({
          workflowId,
          userId: this.userId,
          permission: { $in: ['edit', 'admin'] }
        }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasPermission) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to create versions');
      }

      // Get the latest version number
      const lastVersion = await WorkflowVersions.find(
        { workflowId },
        { sort: { versionNumber: -1 }, limit: 1 }
      ).fetchAsync().then(results => results[0]);

      const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

      // Get user info
      const user = await Meteor.users.find({ _id: this.userId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      const userName = user?.profile?.name || user?.username || 'Unknown';

      // Create snapshot of current workflow state
      const snapshot = {
        name: workflow.name,
        description: workflow.description,
        nodes: workflow.nodes || [],
        connections: workflow.connections || [],
        settings: workflow.settings || {},
        tags: workflow.tags || []
      };

      // Set current version to false for all existing versions
      await WorkflowVersions.updateAsync(
        { workflowId, isCurrent: true },
        { $set: { isCurrent: false } },
        { multi: true }
      );

      // Create new version
      const versionId = await WorkflowVersions.insertAsync({
        workflowId,
        versionNumber: nextVersionNumber,
        name: versionData.name,
        description: versionData.description,
        type: versionData.type,
        tag: versionData.tag,
        snapshot,
        isCurrent: true,
        createdBy: this.userId,
        createdByName: userName
      });

      // Update workflow with current version
      await Agents.updateAsync(workflowId, {
        $set: {
          currentVersion: nextVersionNumber,
          lastVersionedAt: new Date()
        }
      });

      return versionId;
    },

    /**
     * Get versions for a workflow
     */
    async 'workflows.versions.list'(workflowId, options = {}) {
      check(workflowId, String);
      check(options, {
        page: Match.Optional(Number),
        limit: Match.Optional(Number),
        search: Match.Optional(String)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Check permissions
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!workflow) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      const hasAccess = workflow.ownerId === this.userId ||
        workflow.isPublic ||
        await WorkflowSharing.find({ workflowId, userId: this.userId }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasAccess) {
        throw new Meteor.Error('not-authorized', 'Access denied');
      }

      const { page = 1, limit = 10, search = '' } = options;
      const skip = (page - 1) * limit;

      const query = { workflowId };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { tag: { $regex: search, $options: 'i' } }
        ];
      }

      const [versions, total] = await Promise.all([
        WorkflowVersions.find(query, {
          sort: { versionNumber: -1 },
          skip,
          limit
        }).fetchAsync(),
        WorkflowVersions.find(query).countAsync()
      ]);

      return {
        versions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    },

    /**
     * Restore a specific version
     */
    async 'workflows.versions.restore'(workflowId, versionId) {
      check(workflowId, String);
      check(versionId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Get the version
      const version = await WorkflowVersions.find({ _id: versionId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!version || version.workflowId !== workflowId) {
        throw new Meteor.Error('not-found', 'Version not found');
      }

      // Check permissions
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      const hasPermission = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({
          workflowId,
          userId: this.userId,
          permission: { $in: ['edit', 'admin'] }
        }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasPermission) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to restore versions');
      }

      // Update all versions to not current
      await WorkflowVersions.updateAsync(
        { workflowId },
        { $set: { isCurrent: false } },
        { multi: true }
      );

      // Set this version as current
      await WorkflowVersions.updateAsync(versionId, {
        $set: { isCurrent: true }
      });

      // Restore workflow to this version's snapshot
      await Agents.updateAsync(workflowId, {
        $set: {
          name: version.snapshot.name,
          description: version.snapshot.description,
          nodes: version.snapshot.nodes,
          connections: version.snapshot.connections,
          settings: version.snapshot.settings,
          tags: version.snapshot.tags,
          currentVersion: version.versionNumber,
          lastUpdated: new Date()
        }
      });

      return true;
    },

    /**
     * Add user to workflow sharing
     */
    async 'workflows.sharing.add'(workflowId, shareData) {
      check(workflowId, String);
      check(shareData, {
        userId: String,
        permission: Match.Where(p => ['view', 'edit', 'admin'].includes(p))
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Check if user owns the workflow or has admin permission
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!workflow) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      const hasPermission = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({
          workflowId,
          userId: this.userId,
          permission: 'admin'
        }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasPermission) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to share this workflow');
      }

      // Check if already shared
      const existing = await WorkflowSharing.find({
        workflowId,
        userId: shareData.userId
      }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (existing) {
        throw new Meteor.Error('already-shared', 'Workflow is already shared with this user');
      }

      // Get user info
      const user = await Meteor.users.find({ _id: shareData.userId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!user) {
        throw new Meteor.Error('user-not-found', 'User not found');
      }

      const userName = user.profile?.name || user.username || 'Unknown';
      const userEmail = user.emails?.[0]?.address;

      // Create sharing record
      await WorkflowSharing.insertAsync({
        workflowId,
        userId: shareData.userId,
        userName,
        userEmail,
        permission: shareData.permission
      });

      // Also update the Agents collection for backward compatibility
      await Agents.updateAsync(workflowId, {
        $addToSet: {
          sharedWith: shareData.userId,
          sharedUsers: {
            userId: shareData.userId,
            permission: shareData.permission
          }
        }
      });

      return true;
    },

    /**
     * Update sharing permission
     */
    async 'workflows.sharing.update'(workflowId, userId, newPermission) {
      check(workflowId, String);
      check(userId, String);
      check(newPermission, Match.Where(p => ['view', 'edit', 'admin'].includes(p)));

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Check permissions
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      const hasPermission = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({
          workflowId,
          userId: this.userId,
          permission: 'admin'
        }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasPermission) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to update sharing');
      }

      await WorkflowSharing.updateAsync(
        { workflowId, userId },
        { $set: { permission: newPermission } }
      );

      // Update Agents collection
      await Agents.updateAsync(workflowId, {
        $set: {
          'sharedUsers.$[user].permission': newPermission
        }
      }, {
        arrayFilters: [{ 'user.userId': userId }]
      });

      return true;
    },

    /**
     * Remove user from workflow sharing
     */
    async 'workflows.sharing.remove'(workflowId, userId) {
      check(workflowId, String);
      check(userId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Check permissions
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      const hasPermission = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({
          workflowId,
          userId: this.userId,
          permission: 'admin'
        }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasPermission) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to remove sharing');
      }

      await WorkflowSharing.removeAsync({ workflowId, userId });

      // Update Agents collection
      await Agents.updateAsync(workflowId, {
        $pull: {
          sharedWith: userId,
          sharedUsers: { userId }
        }
      });

      return true;
    },

    /**
     * Get shared users for a workflow
     */
    async 'workflows.sharing.list'(workflowId) {
      check(workflowId, String);

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      // Check if user has access
      const workflow = await Agents.find({ _id: workflowId }, { limit: 1 }).fetchAsync().then(results => results[0]);
      if (!workflow) {
        throw new Meteor.Error('not-found', 'Workflow not found');
      }

      const hasAccess = workflow.ownerId === this.userId ||
        await WorkflowSharing.find({ workflowId, userId: this.userId }, { limit: 1 }).fetchAsync().then(results => results[0]);

      if (!hasAccess) {
        throw new Meteor.Error('not-authorized', 'Access denied');
      }

      return await WorkflowSharing.find({ workflowId }).fetchAsync();
    },

    /**
     * Search users for sharing
     */
    async 'users.search'(options) {
      check(options, {
        search: String,
        exclude: Match.Optional(Array),
        page: Match.Optional(Number),
        limit: Match.Optional(Number)
      });

      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const { search, exclude = [], page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const query = {
        _id: { $nin: [...exclude, this.userId] },
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { 'profile.name': { $regex: search, $options: 'i' } },
          { 'emails.address': { $regex: search, $options: 'i' } }
        ]
      };

      const [users, total] = await Promise.all([
        Meteor.users.find(query, {
          fields: {
            username: 1,
            'profile.name': 1,
            'emails.address': 1
          },
          skip,
          limit
        }).fetchAsync(),
        Meteor.users.find(query).countAsync()
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    }
  });
}
