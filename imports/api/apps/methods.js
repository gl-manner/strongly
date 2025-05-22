// /imports/api/apps/methods.js

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { AppsCollection } from './AppsCollection';

Meteor.methods({
  // Create a new app
  async 'apps.create'(appData) {
    check(appData, {
      name: String,
      description: Match.Optional(String),
      repository: Match.Optional(String),
      branch: Match.Optional(String),
      buildpack: Match.Optional(String),
      instances: Match.Optional(Number),
      memory: Match.Optional(String),
      disk: Match.Optional(String),
      hardwareTier: Match.Optional(String),
      environmentVariables: Match.Optional(Object),
      space: Match.Optional(String),
      organization: Match.Optional(String),
      tags: Match.Optional([String])
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to create an app');
    }

    // Check if app name already exists for this user
    const existingApp = await AppsCollection.findOneAsync({
      name: appData.name,
      owner: this.userId
    });

    if (existingApp) {
      throw new Meteor.Error('duplicate-name', 'An app with this name already exists');
    }

    const appId = await AppsCollection.insertAsync({
      ...appData,
      status: 'stopped',
      instances: appData.instances || 1,
      memory: appData.memory || '512M',
      disk: appData.disk || '1G',
      hardwareTier: appData.hardwareTier || 'small',
      environmentVariables: appData.environmentVariables || {},
      services: [],
      routes: [],
      tags: appData.tags || [],
      owner: this.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      healthCheck: {
        enabled: false,
        path: '/health',
        timeout: 30
      },
      metrics: {
        cpu: 0,
        memory: 0,
        requests: 0
      }
    });

    return appId;
  },

  // Update an existing app
  async 'apps.update'(appId, updateData) {
    check(appId, String);
    check(updateData, Object);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    await AppsCollection.updateAsync(appId, {
      $set: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return true;
  },

  // Delete an app
  async 'apps.delete'(appId) {
    check(appId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    await AppsCollection.removeAsync(appId);
    return true;
  },

  // Start an app
  async 'apps.start'(appId) {
    check(appId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    await AppsCollection.updateAsync(appId, {
      $set: {
        status: 'running',
        updatedAt: new Date(),
        lastDeployment: new Date()
      }
    });

    return true;
  },

  // Stop an app
  async 'apps.stop'(appId) {
    check(appId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    await AppsCollection.updateAsync(appId, {
      $set: {
        status: 'stopped',
        updatedAt: new Date()
      }
    });

    return true;
  },

  // Restart an app
  async 'apps.restart'(appId) {
    check(appId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    // Set to deploying first, then to running
    await AppsCollection.updateAsync(appId, {
      $set: {
        status: 'deploying',
        updatedAt: new Date()
      }
    });

    // Simulate deployment time
    Meteor.setTimeout(async () => {
      await AppsCollection.updateAsync(appId, {
        $set: {
          status: 'running',
          lastDeployment: new Date(),
          updatedAt: new Date()
        }
      });
    }, 3000);

    return true;
  },

  // Get app summary statistics
  async 'apps.getSummary'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const totalApps = await AppsCollection.find({ owner: this.userId }).countAsync();
    const runningApps = await AppsCollection.find({
      owner: this.userId,
      status: 'running'
    }).countAsync();
    const stoppedApps = await AppsCollection.find({
      owner: this.userId,
      status: 'stopped'
    }).countAsync();
    const errorApps = await AppsCollection.find({
      owner: this.userId,
      status: 'error'
    }).countAsync();
    const deployingApps = await AppsCollection.find({
      owner: this.userId,
      status: 'deploying'
    }).countAsync();

    // Get unique spaces
    const apps = await AppsCollection.find({ owner: this.userId }).fetchAsync();
    const spaces = [...new Set(apps.map(app => app.space).filter(Boolean))];

    return {
      totalApps,
      runningApps,
      stoppedApps,
      errorApps,
      deployingApps,
      spaces: spaces.length,
      recentApps: apps.slice(0, 5).map(app => ({
        _id: app._id,
        name: app.name,
        status: app.status,
        updatedAt: app.updatedAt
      }))
    };
  },

  // Add environment variable
  async 'apps.addEnvVar'(appId, key, value) {
    check(appId, String);
    check(key, String);
    check(value, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    const envVars = app.environmentVariables || {};
    envVars[key] = value;

    await AppsCollection.updateAsync(appId, {
      $set: {
        environmentVariables: envVars,
        updatedAt: new Date()
      }
    });

    return true;
  },

  // Remove environment variable
  async 'apps.removeEnvVar'(appId, key) {
    check(appId, String);
    check(key, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const app = await AppsCollection.findOneAsync({
      _id: appId,
      owner: this.userId
    });

    if (!app) {
      throw new Meteor.Error('not-found', 'App not found');
    }

    const envVars = app.environmentVariables || {};
    delete envVars[key];

    await AppsCollection.updateAsync(appId, {
      $set: {
        environmentVariables: envVars,
        updatedAt: new Date()
      }
    });

    return true;
  }
});
