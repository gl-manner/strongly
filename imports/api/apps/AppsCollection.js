// /imports/api/apps/AppsCollection.js

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const AppsCollection = new Mongo.Collection('apps');

// Define the schema
AppsCollection.schema = {
  name: String,                    // App name
  description: String,             // App description
  status: String,                  // running, stopped, error, deploying
  url: String,                     // App URL/endpoint
  repository: String,              // Git repository URL
  branch: String,                  // Git branch
  buildpack: String,               // Buildpack used
  instances: Number,               // Number of instances
  memory: String,                  // Memory allocation (e.g., "512M", "1G")
  disk: String,                    // Disk allocation (e.g., "1G", "2G")
  hardwareTier: String,           // Hardware tier (e.g., "small", "medium", "large")
  environmentVariables: Object,    // Environment variables as key-value pairs
  services: [String],             // Bound services
  routes: [String],               // App routes/domains
  lastDeployment: Date,           // Last deployment time
  createdAt: Date,                // When the app was created
  updatedAt: Date,                // When the app was last updated
  owner: String,                  // User ID who owns this app
  space: String,                  // Space/namespace the app belongs to
  organization: String,           // Organization the app belongs to
  tags: [String],                 // Tags for categorization
  healthCheck: Object,            // Health check configuration
  buildInfo: Object,              // Build information
  logs: [Object],                 // Recent logs
  metrics: Object                 // App metrics (CPU, memory usage, etc.)
};

if (Meteor.isServer) {
  // Publications
  Meteor.publish('apps', function(filters = {}) {
    if (!this.userId) {
      return this.ready();
    }

    const query = { owner: this.userId };

    // Add search filter
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }

    // Add status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Add space filter
    if (filters.space) {
      query.space = filters.space;
    }

    return AppsCollection.find(query, {
      sort: { updatedAt: -1 },
      limit: filters.limit || 50
    });
  });

  Meteor.publish('app', function(appId) {
    if (!this.userId) {
      return this.ready();
    }

    return AppsCollection.find({
      _id: appId,
      owner: this.userId
    });
  });

  // Indexes for performance
  Meteor.startup(() => {
    try {
      AppsCollection.createIndex({ owner: 1 });
      AppsCollection.createIndex({ status: 1, owner: 1 });
      AppsCollection.createIndex({ space: 1, owner: 1 });
      AppsCollection.createIndex({ name: 1, owner: 1 });
      AppsCollection.createIndex({ updatedAt: -1 });
    } catch (error) {
      console.log('Indexes may already exist:', error.message);
    }
  });
}
