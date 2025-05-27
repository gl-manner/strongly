// /imports/api/workflowVersions/publications.js

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { WorkflowVersions, WorkflowSharing } from './collection';
import { Agents } from '../agents';

if (Meteor.isServer) {
  /**
   * Publish workflow versions for a specific workflow
   */
  Meteor.publish('workflowVersions.byWorkflow', async function(workflowId, options = {}) {
    check(workflowId, String);
    check(options, {
      limit: Match.Optional(Number),
      skip: Match.Optional(Number),
      search: Match.Optional(String)
    });

    if (!this.userId) {
      return this.ready();
    }

    // Check if user has access to the workflow
    const workflow = await Agents.findOneAsync({
      _id: workflowId,
      $or: [
        { ownerId: this.userId },
        { 'sharedUsers.userId': this.userId }
      ]
    });

    if (!workflow) {
      return this.ready();
    }

    const query = { workflowId };

    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { tag: { $regex: options.search, $options: 'i' } }
      ];
    }

    return WorkflowVersions.find(query, {
      sort: { versionNumber: -1 },
      limit: options.limit || 50,
      skip: options.skip || 0
    });
  });

  /**
   * Publish current version for a workflow
   */
  Meteor.publish('workflowVersions.current', async function(workflowId) {
    check(workflowId, String);

    if (!this.userId) {
      return this.ready();
    }

    // Check if user has access to the workflow
    const workflow = await Agents.findOneAsync({
      _id: workflowId,
      $or: [
        { ownerId: this.userId },
        { 'sharedUsers.userId': this.userId }
      ]
    });

    if (!workflow) {
      return this.ready();
    }

    return WorkflowVersions.find({
      workflowId,
      isCurrent: true
    }, {
      limit: 1
    });
  });

  /**
   * Publish all versions for workflows owned by or shared with the user
   */
  Meteor.publish('workflowVersions.myWorkflows', function(options = {}) {
    check(options, {
      limit: Match.Optional(Number),
      skip: Match.Optional(Number)
    });

    if (!this.userId) {
      return this.ready();
    }

    // Get all workflows the user has access to
    const workflows = Agents.find({
      $or: [
        { ownerId: this.userId },
        { 'sharedUsers.userId': this.userId }
      ]
    }, {
      fields: { _id: 1 }
    }).fetch();

    const workflowIds = workflows.map(w => w._id);

    if (workflowIds.length === 0) {
      return this.ready();
    }

    return WorkflowVersions.find(
      {
        workflowId: { $in: workflowIds },
        isCurrent: true
      },
      {
        sort: { createdAt: -1 },
        limit: options.limit || 100,
        skip: options.skip || 0
      }
    );
  });

  /**
   * Publish workflow sharing records for a specific workflow
   */
  Meteor.publish('workflowSharing.byWorkflow', async function(workflowId) {
    check(workflowId, String);

    if (!this.userId) {
      return this.ready();
    }

    // Check if user has access
    const workflow = await Agents.findOneAsync({
      _id: workflowId,
      $or: [
        { ownerId: this.userId },
        { 'sharedUsers.userId': this.userId }
      ]
    });

    if (!workflow) {
      return this.ready();
    }

    return WorkflowSharing.find({ workflowId });
  });

  /**
   * Publish all workflows shared with the current user
   */
  Meteor.publish('workflowSharing.mySharedWorkflows', function(options = {}) {
    check(options, {
      limit: Match.Optional(Number),
      skip: Match.Optional(Number)
    });

    if (!this.userId) {
      return this.ready();
    }

    return WorkflowSharing.find(
      { userId: this.userId },
      {
        sort: { sharedAt: -1 },
        limit: options.limit || 50,
        skip: options.skip || 0
      }
    );
  });

  /**
   * Publish workflow sharing statistics for the current user
   */
  Meteor.publish('workflowSharing.stats', function() {
    if (!this.userId) {
      return this.ready();
    }

    const self = this;
    let initializing = true;

    // Count workflows shared with the user
    const sharedWithMeCount = WorkflowSharing.find({ userId: this.userId }).count();

    // Count workflows the user has shared
    const myWorkflows = Agents.find({ ownerId: this.userId }, { fields: { _id: 1 } }).fetch();
    const myWorkflowIds = myWorkflows.map(w => w._id);
    const sharedByMeCount = WorkflowSharing.find({ workflowId: { $in: myWorkflowIds } }).count();

    self.added('workflowSharingStats', this.userId, {
      sharedWithMe: sharedWithMeCount,
      sharedByMe: sharedByMeCount
    });

    self.ready();
  });
}
