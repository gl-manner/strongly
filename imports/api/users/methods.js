// /imports/api/users/methods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
  /**
   * Update the current user's profile
   * @param {Object} profileData - User profile data to update
   */
  'users.updateProfile': function(profileData) {
    check(profileData, {
      name: String,
      phone: Match.Maybe(String),
      bio: Match.Maybe(String),
      location: Match.Maybe(String),
      website: Match.Maybe(String)
    });

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update your profile');
    }

    // Get the current user's profile
    const user = Meteor.users.findOne(this.userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    // Update the user's profile
    return Meteor.users.update(
      { _id: this.userId },
      {
        $set: {
          profile: {
            ...user.profile,
            ...profileData
          }
        }
      }
    );
  },

  /**
   * Update a user by admin
   * @param {String} userId - ID of the user to update
   * @param {Object} userData - User data to update
   */
  'users.updateByAdmin': function(userId, userData) {
    check(userId, String);
    check(userData, {
      name: String,
      active: Boolean,
      isAdmin: Boolean
    });

    // Check if user is logged in and is an admin
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a user');
    }

    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to update a user');
    }

    // Get the user to update
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    // Update user profile
    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          profile: {
            ...user.profile,
            name: userData.name,
            active: userData.active
          }
        }
      }
    );

    // Update user role
    if (userData.isAdmin) {
      Roles.addUsersToRoles(userId, 'admin');
    } else {
      Roles.removeUsersFromRoles(userId, 'admin');
    }

    return true;
  },

  /**
   * Set a user's active status
   * @param {String} userId - ID of the user to update
   * @param {Boolean} active - Whether the user should be active
   */
  'users.setActive': function(userId, active) {
    check(userId, String);
    check(active, Boolean);

    // Check if user is logged in and is an admin
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a user');
    }

    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to activate/deactivate a user');
    }

    // Get the user to update
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    // Update user active status
    return Meteor.users.update(
      { _id: userId },
      {
        $set: {
          'profile.active': active
        }
      }
    );
  },

  /**
   * Set a user's admin role
   * @param {String} userId - ID of the user to update
   * @param {Boolean} isAdmin - Whether the user should be an admin
   */
  'users.setAdmin': function(userId, isAdmin) {
    check(userId, String);
    check(isAdmin, Boolean);

    // Check if user is logged in and is an admin
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a user');
    }

    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'You must be an admin to change user roles');
    }

    // Get the user to update
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    // Update user role
    if (isAdmin) {
      Roles.addUsersToRoles(userId, 'admin');
    } else {
      Roles.removeUsersFromRoles(userId, 'admin');
    }

    return true;
  }
});
