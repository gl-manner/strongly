// /imports/api/auth/hooks/onCreateUser.js
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

/**
 * Custom user creation hook
 * This runs whenever a new user is created
 */
Accounts.onCreateUser((options, user) => {
  // Transfer profile from options to the new user object
  user.profile = options.profile || {};

  // Set default profile fields if not provided
  user.profile.name = user.profile.name || '';
  user.profile.bio = user.profile.bio || '';
  user.profile.avatar = user.profile.avatar || '';
  user.profile.active = true;
  user.profile.createdAt = new Date();

  // Initialize roles array (will be populated after user creation)
  user.roles = [];

  return user;
});

// After user creation hook for Meteor 3
Accounts.onCreateUserAsync = async (options, user) => {
  try {
    // Check if this is the first user
    const userCount = await Meteor.users.countDocumentsAsync();

    // If this is the first user, auto-approve them and make them an admin
    if (userCount <= 1) {
      user.profile = user.profile || {};
      user.profile.approved = true;
      user.profile.approvedAt = new Date();

      // The roles will be added after the user is created
      console.log(`First user created with ID: ${user._id}`);
    } else {
      // All other users need approval by default
      if (user.profile) {
        user.profile.approved = false;
      }
    }
  } catch (error) {
    console.error('Error in onCreateUserAsync:', error);
  }

  return user;
};
