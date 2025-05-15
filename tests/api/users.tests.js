// /tests/api/users.tests.js
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
import { resetDatabase } from 'meteor/xolvio:cleaner';

if (Meteor.isServer) {
  describe('Users API', function() {
    let userId;
    let adminId;

    beforeEach(function() {
      // Reset database before each test
      resetDatabase();

      // Create a test user
      userId = Accounts.createUser({
        email: 'test@example.com',
        password: 'password123',
        profile: {
          name: 'Test User',
          approved: true,
          active: true
        }
      });

      // Create an admin user
      adminId = Accounts.createUser({
        email: 'admin@example.com',
        password: 'password123',
        profile: {
          name: 'Admin User',
          approved: true,
          active: true
        }
      });

      // Add admin role to admin user
      Roles.addUsersToRoles(adminId, ['admin']);

      // Add user role to test user
      Roles.addUsersToRoles(userId, ['user']);
    });

    describe('users.updateProfile', function() {
      it('should update a user\'s profile when called by the user', function() {
        // Set up method arguments
        const newProfileData = {
          name: 'Updated Name',
          bio: 'This is my bio',
          avatar: 'https://example.com/avatar.jpg'
        };

        // Call the method as the test user
        const updateProfile = Meteor.server.method_handlers['users.updateProfile'];
        const invocation = { userId };

        updateProfile.apply(invocation, [userId, newProfileData]);

        // Verify that the profile was updated
        const user = Meteor.users.findOne(userId);
        assert.equal(user.profile.name, 'Updated Name');
        assert.equal(user.profile.bio, 'This is my bio');
        assert.equal(user.profile.avatar, 'https://example.com/avatar.jpg');
      });

      it('should not allow a user to update another user\'s profile', function() {
        // Set up method arguments
        const newProfileData = {
          name: 'Updated Name',
          bio: 'This is my bio',
          avatar: 'https://example.com/avatar.jpg'
        };

        // Call the method as the test user trying to update admin's profile
        const updateProfile = Meteor.server.method_handlers['users.updateProfile'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            updateProfile.apply(invocation, [adminId, newProfileData]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to update any user\'s profile', function() {
        // Set up method arguments
        const newProfileData = {
          name: 'Admin Updated Name',
          bio: 'Updated by admin',
          avatar: 'https://example.com/avatar2.jpg'
        };

        // Call the method as the admin user
        const updateProfile = Meteor.server.method_handlers['users.updateProfile'];
        const invocation = { userId: adminId };

        updateProfile.apply(invocation, [userId, newProfileData]);

        // Verify that the profile was updated
        const user = Meteor.users.findOne(userId);
        assert.equal(user.profile.name, 'Admin Updated Name');
        assert.equal(user.profile.bio, 'Updated by admin');
        assert.equal(user.profile.avatar, 'https://example.com/avatar2.jpg');
      });
    });

    describe('users.updateRoles', function() {
      it('should not allow a regular user to update roles', function() {
        // Call the method as a regular user
        const updateRoles = Meteor.server.method_handlers['users.updateRoles'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            updateRoles.apply(invocation, [adminId, ['user']]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to update user roles', function() {
        // Call the method as the admin user
        const updateRoles = Meteor.server.method_handlers['users.updateRoles'];
        const invocation = { userId: adminId };

        updateRoles.apply(invocation, [userId, ['admin', 'user']]);

        // Verify that the roles were updated
        assert.isTrue(Roles.userIsInRole(userId, 'admin'));
        assert.isTrue(Roles.userIsInRole(userId, 'user'));
      });
    });

    describe('users.approve', function() {
      it('should not allow a regular user to approve users', function() {
        // Create a pending user
        const pendingUserId = Accounts.createUser({
          email: 'pending@example.com',
          password: 'password123',
          profile: {
            name: 'Pending User',
            approved: false
          }
        });

        // Call the method as a regular user
        const approveUser = Meteor.server.method_handlers['users.approve'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            approveUser.apply(invocation, [pendingUserId]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to approve a user', function() {
        // Create a pending user
        const pendingUserId = Accounts.createUser({
          email: 'pending@example.com',
          password: 'password123',
          profile: {
            name: 'Pending User',
            approved: false
          }
        });

        // Call the method as the admin user
        const approveUser = Meteor.server.method_handlers['users.approve'];
        const invocation = { userId: adminId };

        approveUser.apply(invocation, [pendingUserId]);

        // Verify that the user was approved
        const user = Meteor.users.findOne(pendingUserId);
        assert.isTrue(user.profile.approved);
        assert.instanceOf(user.profile.approvedAt, Date);
        assert.equal(user.profile.approvedBy, adminId);
      });
    });

    describe('users.deactivate', function() {
      it('should not allow a regular user to deactivate users', function() {
        // Call the method as a regular user
        const deactivateUser = Meteor.server.method_handlers['users.deactivate'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            deactivateUser.apply(invocation, [adminId]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to deactivate a user', function() {
        // Call the method as the admin user
        const deactivateUser = Meteor.server.method_handlers['users.deactivate'];
        const invocation = { userId: adminId };

        deactivateUser.apply(invocation, [userId]);

        // Verify that the user was deactivated
        const user = Meteor.users.findOne(userId);
        assert.isFalse(user.profile.active);
        assert.instanceOf(user.profile.deactivatedAt, Date);
        assert.equal(user.profile.deactivatedBy, adminId);
      });

      it('should prevent deactivating the last admin', function() {
        // Call the method as the admin user trying to deactivate themselves
        const deactivateUser = Meteor.server.method_handlers['users.deactivate'];
        const invocation = { userId: adminId };

        // Should throw an error
        assert.throws(
          () => {
            deactivateUser.apply(invocation, [adminId]);
          },
          Meteor.Error,
          'last-admin'
        );
      });
    });

    describe('users.reactivate', function() {
      it('should not allow a regular user to reactivate users', function() {
        // Deactivate a user first
        Meteor.users.update(userId, {
          $set: {
            'profile.active': false
          }
        });

        // Call the method as a regular user
        const reactivateUser = Meteor.server.method_handlers['users.reactivate'];
        const invocation = { userId };

        // Should throw an error
        assert.throws(
          () => {
            reactivateUser.apply(invocation, [adminId]);
          },
          Meteor.Error,
          'not-authorized'
        );
      });

      it('should allow an admin to reactivate a user', function() {
        // Deactivate a user first
        Meteor.users.update(userId, {
          $set: {
            'profile.active': false
          }
        });

        // Call the method as the admin user
        const reactivateUser = Meteor.server.method_handlers['users.reactivate'];
        const invocation = { userId: adminId };

        reactivateUser.apply(invocation, [userId]);

        // Verify that the user was reactivated
        const user = Meteor.users.findOne(userId);
        assert.isTrue(user.profile.active);
        assert.instanceOf(user.profile.reactivatedAt, Date);
        assert.equal(user.profile.reactivatedBy, adminId);
      });
    });
  });
}
