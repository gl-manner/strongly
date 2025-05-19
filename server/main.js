// /server/main.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

// Import LLM collections to register publications and methods
import '/imports/api/llms/LLMsCollection';
import '/imports/api/llms/OpenSourceLLMsCollection';
import '/imports/methods/server/huggingface-methods';

// Import API files if they exist
// import '/imports/api/users/methods.js';
// import '/imports/api/users/publications.js';

Meteor.startup(async function() {
  // Initialize roles
  const rolesCount = await Roles.getAllRoles().countAsync();
  if (!rolesCount) {
    // Create basic roles
    await Roles.createRoleAsync('admin');
    await Roles.createRoleAsync('user');
    console.log('Roles created');
  }

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@example.com';
  const adminUser = await Meteor.users.findOneAsync({ 'emails.address': adminEmail });
  if (!adminUser) {
    console.log('Creating admin user...');
    const adminId = Accounts.createUser({
      email: adminEmail,
      password: 'admin123',
      profile: {
        name: 'Admin User',
        active: true  // Admin is active by default
      }
    });
    // Add admin role
    await Roles.addUsersToRolesAsync(adminId, 'admin');
    console.log('Admin user created successfully');
  }

  // Configure accounts
  Accounts.config({
    sendVerificationEmail: false,  // Set to false for easier testing
    forbidClientAccountCreation: false
  });

  // User creation hook (directly in this file for now)
  Accounts.onCreateUser((options, user) => {
    // Ensure the profile exists
    user.profile = options.profile || {};
    // For testing, make all users active by default
    user.profile.active = true;
    return user;
  });

  // Setup publications
  Meteor.publish('userData', function() {
    if (this.userId) {
      return Meteor.users.find(
        { _id: this.userId },
        { fields: { profile: 1, emails: 1, roles: 1 } }
      );
    }
    return this.ready();
  });

  // Setup methods
  Meteor.methods({
    'users.updateProfile': function(profileData) {
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to perform this action');
      }
      // Get current user profile
      const user = Meteor.users.findOneAsync(this.userId);
      if (!user) {
        throw new Meteor.Error('not-found', 'User not found');
      }
      // Update user profile
      return Meteor.users.update(
        { _id: this.userId },
        { $set: { profile: { ...user.profile, ...profileData } } }
      );
    },

    // Add a method to get LLMs for testing
    'getLLMs': function() {
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in');
      }

      const { LLMsCollection } = require('/imports/api/llms/LLMsCollection');
      return LLMsCollection.find({}).fetch();
    }
  });

  console.log('Server started successfully with LLM collections loaded');
});
