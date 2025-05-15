// /imports/api/auth/hooks/onCreateUser.js
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

/**
 * Custom user creation hook
 * This runs whenever a new user is created
 */
Accounts.onCreateUser((options, user) => {
  // Check if we have any users in the system
  const userCount = Meteor.users.find().count();

  // Transfer profile from options to the new user object
  user.profile = options.profile || {};

  // Set default profile fields if not provided
  user.profile.name = user.profile.name || '';
  user.profile.bio = user.profile.bio || '';
  user.profile.avatar = user.profile.avatar || '';
  user.profile.active = true;
  user.profile.createdAt = new Date();

  // The first user becomes an admin and is automatically approved
  if (userCount === 0) {
    user.profile.approved = true;
    user.profile.approvedAt = new Date();

    // Add admin role once the user is created
    // This is done in Meteor.startup to ensure the role is added
    Meteor.setTimeout(() => {
      Roles.addUsersToRoles(user._id, ['admin']);
    }, 1000);
  } else {
    // All other users need approval by default
    user.profile.approved = false;
  }

  // Initialize roles array (will be populated after user creation)
  user.roles = [];

  return user;
});

/**
 * After user creation hook
 * This runs after the user has been inserted into the database
 */
Accounts.onCreateUserAsync = async (options, user) => {
  // Perform any async operations needed after user creation
  console.log(`New user created: ${user._id}`);

  // Notify admins about new user registration
  if (user.profile && !user.profile.approved) {
    try {
      // Find all admin users
      const adminUsers = await Meteor.users.find({ roles: 'admin' }).fetchAsync();

      // Send notification email to each admin
      adminUsers.forEach(admin => {
        if (admin.emails && admin.emails[0]) {
          Email.send({
            to: admin.emails[0].address,
            from: 'noreply@strongly.ai',
            subject: 'New User Registration - Approval Required',
            html: `
              <h1>New User Registration</h1>
              <p>A new user has registered and requires your approval:</p>
              <ul>
                <li>Name: ${user.profile.name}</li>
                <li>Email: ${user.emails[0].address}</li>
                <li>Registered: ${user.profile.createdAt.toLocaleString()}</li>
              </ul>
              <p><a href="${Meteor.absoluteUrl('admin/users')}">Click here to manage users</a></p>
            `
          });
        }
      });
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  }

  return user;
};

// Validate username, if used
Accounts.validateNewUser((user) => {
  if (user.username) {
    // Username validation rules
    if (user.username.length < 3) {
      throw new Meteor.Error('username-too-short', 'Username must be at least 3 characters long');
    }

    if (user.username.length > 20) {
      throw new Meteor.Error('username-too-long', 'Username cannot exceed 20 characters');
    }

    if (!user.username.match(/^[a-zA-Z0-9_]+$/)) {
      throw new Meteor.Error(
        'invalid-username',
        'Username can only contain letters, numbers, and underscores'
      );
    }
  }

  return true;
});
