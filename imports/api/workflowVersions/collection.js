// /imports/api/workflowVersions/collection.js

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const WorkflowVersions = new Mongo.Collection('workflowVersions');
export const WorkflowSharing = new Mongo.Collection('workflowSharing');

// Schema for workflow versions (for documentation and validation in methods)
export const WorkflowVersionSchema = new SimpleSchema({
  workflowId: {
    type: String,
    label: 'Workflow ID'
  },
  versionNumber: {
    type: Number,
    label: 'Version Number',
    min: 1
  },
  name: {
    type: String,
    label: 'Version Name',
    max: 100
  },
  description: {
    type: String,
    label: 'Version Description',
    optional: true,
    max: 500
  },
  type: {
    type: String,
    label: 'Version Type',
    allowedValues: ['minor', 'major'],
    defaultValue: 'minor'
  },
  tag: {
    type: String,
    label: 'Version Tag',
    optional: true,
    max: 50
  },
  snapshot: {
    type: Object,
    label: 'Workflow Snapshot',
    blackbox: true // Contains the complete workflow state
  },
  'snapshot.name': String,
  'snapshot.description': {
    type: String,
    optional: true
  },
  'snapshot.nodes': {
    type: Array,
    defaultValue: []
  },
  'snapshot.nodes.$': {
    type: Object,
    blackbox: true // Node configuration can vary
  },
  'snapshot.connections': {
    type: Array,
    defaultValue: []
  },
  'snapshot.connections.$': {
    type: Object,
    blackbox: true
  },
  'snapshot.settings': {
    type: Object,
    blackbox: true,
    optional: true
  },
  'snapshot.tags': {
    type: Array,
    optional: true
  },
  'snapshot.tags.$': String,
  isCurrent: {
    type: Boolean,
    label: 'Is Current Version',
    defaultValue: false
  },
  createdAt: {
    type: Date,
    label: 'Created At',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  createdBy: {
    type: String,
    label: 'Created By User ID',
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      }
    }
  },
  createdByName: {
    type: String,
    label: 'Created By User Name'
  }
});

// Schema for workflow sharing (for documentation and validation in methods)
export const WorkflowSharingSchema = new SimpleSchema({
  workflowId: {
    type: String,
    label: 'Workflow ID'
  },
  userId: {
    type: String,
    label: 'User ID'
  },
  userName: {
    type: String,
    label: 'User Name'
  },
  userEmail: {
    type: String,
    label: 'User Email',
    optional: true
  },
  permission: {
    type: String,
    label: 'Permission Level',
    allowedValues: ['view', 'edit', 'admin'],
    defaultValue: 'view'
  },
  sharedAt: {
    type: Date,
    label: 'Shared At',
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  sharedBy: {
    type: String,
    label: 'Shared By User ID',
    autoValue: function() {
      if (this.isInsert) {
        return this.userId;
      }
    }
  }
});

// If Collection2 is installed, attach schemas
if (typeof WorkflowVersions.attachSchema === 'function') {
  WorkflowVersions.attachSchema(WorkflowVersionSchema);
}

if (typeof WorkflowSharing.attachSchema === 'function') {
  WorkflowSharing.attachSchema(WorkflowSharingSchema);
}

// Deny all client-side updates
WorkflowVersions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

WorkflowSharing.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});
