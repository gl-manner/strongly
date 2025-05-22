// /server/main.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import '/imports/api/apps';
import '/imports/api/marketplace';
import '/imports/api/ai-gateway';
import '/imports/api/users';

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

  console.log('Server started successfully with LLM collections loaded');
});
