// /imports/api/users/publications.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

// Publish current user data
Meteor.publish('userData', function() {
  if (!this.userId) {
    return this.ready();
  }

  return Meteor.users.find(
    { _id: this.userId },
    {
      fields: {
        profile: 1,
        emails: 1,
        roles: 1
      }
    }
  );
});

// Publish all users (admin only)
Meteor.publish('users.all', function() {
  if (!this.userId) {
    return this.ready();
  }

  if (!Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  return Meteor.users.find(
    {},
    {
      fields: {
        profile: 1,
        emails: 1,
        roles: 1,
        createdAt: 1
      }
    }
  );
});

// Publish single user by ID (admin only)
Meteor.publish('users.single', function(userId) {
  if (!this.userId) {
    return this.ready();
  }

  // Allow users to see their own data
  if (this.userId === userId) {
    return Meteor.users.find(
      { _id: userId },
      {
        fields: {
          profile: 1,
          emails: 1,
          roles: 1,
          createdAt: 1
        }
      }
    );
  }

  // Only admins can see other users' data
  if (!Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  return Meteor.users.find(
    { _id: userId },
    {
      fields: {
        profile: 1,
        emails: 1,
        roles: 1,
        createdAt: 1
      }
    }
  );
});

// Publish users pending approval (admin only)
Meteor.publish('users.pending', function() {
  if (!this.userId) {
    return this.ready();
  }

  if (!Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  return Meteor.users.find(
    { 'profile.active': false },
    {
      fields: {
        profile: 1,
        emails: 1,
        roles: 1,
        createdAt: 1
      }
    }
  );
});

// Publish active users only
Meteor.publish('users.active', function() {
  if (!this.userId) {
    return this.ready();
  }

  return Meteor.users.find(
    { 'profile.active': true },
    {
      fields: {
        profile: 1,
        emails: 1,
        roles: 1
      }
    }
  );
});
