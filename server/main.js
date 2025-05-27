// /server/main.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import '/imports/api/admin';
import '/imports/api/agents';
import '/imports/api/apps';
import '/imports/api/marketplace';
import '/imports/api/ai-gateway';
import '/imports/api/users';
import '/imports/api/contact';
import '/imports/api/faq';
import '/imports/startup/server';
import '/imports/api/workflowVersions';

Meteor.startup(async function() {
  console.log('🚀 Starting server...');

  // Initialize roles
  const rolesCount = await Roles.getAllRoles().countAsync();
  if (!rolesCount) {
    // Create basic roles
    await Roles.createRoleAsync('admin');
    await Roles.createRoleAsync('user');
    console.log('✅ Roles created: admin, user');
  }

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@strongly.ai';
  let adminUser = await Meteor.users.findOneAsync({ 'emails.address': adminEmail });

  if (!adminUser) {
    console.log('👤 Creating admin user...');
    const adminId = Accounts.createUser({
      email: adminEmail,
      password: 'Changeme123!@',
      profile: {
        name: 'Admin User',
        active: true
      }
    });
    // Add admin role
    await Roles.addUsersToRolesAsync(adminId, 'admin');
    console.log('✅ Admin user created successfully');
    adminUser = await Meteor.users.findOneAsync(adminId);
  } else {
    console.log('👤 Admin user already exists, checking roles...');

    // Check if admin user has admin role
    const isAdmin = await Roles.userIsInRoleAsync(adminUser._id, 'admin');

    if (!isAdmin) {
      console.log('⚠️  Admin user missing admin role, adding it...');
      await Roles.addUsersToRolesAsync(adminUser._id, 'admin');
      console.log('✅ Admin role assigned to existing user');
    } else {
      console.log('✅ Admin user already has admin role');
    }
  }

  // Verify admin setup
  if (adminUser) {
    const adminRoles = await Roles.getRolesForUserAsync(adminUser._id);
    const isAdminVerified = await Roles.userIsInRoleAsync(adminUser._id, 'admin');
    console.log('🔍 Admin verification:');
    console.log('  Email:', adminUser.emails?.[0]?.address);
    console.log('  Roles:', adminRoles);
    console.log('  Is Admin:', isAdminVerified);
  }

  // Configure accounts
  Accounts.config({
    sendVerificationEmail: false,
    forbidClientAccountCreation: false
  });

  // User creation hook
  Accounts.onCreateUser((options, user) => {
    user.profile = options.profile || {};
    user.profile.active = true;
    return user;
  });

  console.log('✅ Server started successfully');
});

// Publish user roles to client (this is crucial!)
Meteor.publish(null, function() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  } else {
    this.ready();
  }
});

// Enhanced user data publication
Meteor.publish('userData', function() {
  if (!this.userId) {
    return this.ready();
  }

  return [
    Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          profile: 1,
          emails: 1,
          roles: 1
        }
      }
    ),
    Meteor.roleAssignment.find({ 'user._id': this.userId })
  ];
});
