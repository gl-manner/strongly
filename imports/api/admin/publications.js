// /imports/api/admin/publications.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { check, Match } from 'meteor/check';

// Publish users list for admin
Meteor.publish('admin.users.list', function(options = {}) {
  check(options, {
    page: Match.Maybe(Number),
    limit: Match.Maybe(Number),
    search: Match.Maybe(String)
  });

  // Check if user is admin
  if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;
  const search = options.search || '';

  // Build search query
  const query = {};
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { 'profile.name': searchRegex },
      { 'emails.address': searchRegex },
      { 'profile.organization': searchRegex },
      { 'profile.role': searchRegex }
    ];
  }

  // Return both users and their role assignments
  return [
    Meteor.users.find(query, {
      skip,
      limit,
      sort: { 'profile.name': 1, 'emails.address': 1 },
      fields: {
        _id: 1,
        emails: 1,
        profile: 1,
        createdAt: 1
      }
    }),
    Meteor.roleAssignment.find({})
  ];
});

// Publish single user details for admin
Meteor.publish('admin.user.detail', function(userId) {
  check(userId, String);

  // Check if user is admin
  if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  return [
    Meteor.users.find({ _id: userId }, {
      fields: {
        _id: 1,
        emails: 1,
        profile: 1,
        createdAt: 1
      }
    }),
    Meteor.roleAssignment.find({ 'user._id': userId })
  ];
});

// Publish admin statistics
Meteor.publish('admin.stats', function() {
  // Check if user is admin
  if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
    return this.ready();
  }

  // This is a reactive computation that will re-run when data changes
  const self = this;
  let initializing = true;

  const handle = Meteor.users.find({}).observeChanges({
    added: function() {
      if (!initializing) {
        self.changed('adminStats', 'userCounts', getUserCounts());
      }
    },
    removed: function() {
      if (!initializing) {
        self.changed('adminStats', 'userCounts', getUserCounts());
      }
    },
    changed: function() {
      if (!initializing) {
        self.changed('adminStats', 'userCounts', getUserCounts());
      }
    }
  });

  // Send initial data
  self.added('adminStats', 'userCounts', getUserCounts());
  initializing = false;
  self.ready();

  // Clean up observer on client disconnect
  self.onStop(function() {
    handle.stop();
  });
});

// Helper function to get user counts
function getUserCounts() {
  const totalUsers = Meteor.users.find({}).count();
  const activeUsers = Meteor.users.find({ 'profile.active': { $ne: false } }).count();
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = Roles.getUsersInRole('admin').count();

  return {
    total: totalUsers,
    active: activeUsers,
    inactive: inactiveUsers,
    admins: adminUsers,
    lastUpdated: new Date()
  };
}
