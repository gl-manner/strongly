// /imports/api/workflowVersions/index.js

import { Meteor } from 'meteor/meteor';
import { WorkflowVersions, WorkflowSharing } from './collection';
import './methods';
import './publications';

export { WorkflowVersions, WorkflowSharing };

// Create indexes on server startup
if (Meteor.isServer) {
  Meteor.startup(() => {
    // WorkflowVersions indexes
    WorkflowVersions.createIndex({ workflowId: 1, versionNumber: -1 });
    WorkflowVersions.createIndex({ workflowId: 1, isCurrent: 1 });
    WorkflowVersions.createIndex({ workflowId: 1, tag: 1 });
    WorkflowVersions.createIndex({ workflowId: 1, createdAt: -1 });

    // WorkflowSharing indexes
    WorkflowSharing.createIndex({ workflowId: 1, userId: 1 }, { unique: true });
    WorkflowSharing.createIndex({ userId: 1 });
    WorkflowSharing.createIndex({ workflowId: 1 });
  });
}
