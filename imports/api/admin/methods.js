// /imports/api/admin/userMethods.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';

Meteor.methods({
  /**
   * Create a new user (admin only)
   */
  'admin.createUser': async function(userData) {
    check(userData, {
      name: String,
      email: String,
      organization: Match.Optional(String),
      role: Match.Optional(String),
      sendEmail: Boolean
    });

    // Check if user is admin
    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only administrators can create users');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Meteor.Error('invalid-email', 'Please provide a valid email address');
    }

    // Check if user already exists
    const existingUser = await Meteor.users.findOneAsync({ 'emails.address': userData.email });
    if (existingUser) {
      throw new Meteor.Error('user-exists', 'A user with this email address already exists');
    }

    try {
      // Generate a temporary password
      const tempPassword = generateTempPassword();

      // Create the user
      const userId = Accounts.createUser({
        email: userData.email,
        password: tempPassword,
        profile: {
          name: userData.name,
          organization: userData.organization || '',
          role: userData.role || '',
          active: true,
          createdBy: this.userId,
          createdAt: new Date()
        }
      });

      // Add default user role
      await Roles.addUsersToRolesAsync(userId, 'user');

      // Send welcome email if requested
      if (userData.sendEmail) {
        await sendWelcomeEmail(userData.email, userData.name, tempPassword);
      }

      return {
        success: true,
        userId,
        tempPassword: userData.sendEmail ? null : tempPassword // Only return password if email not sent
      };

    } catch (error) {
      console.error('Error creating user:', error);
      throw new Meteor.Error('user-creation-failed', 'Failed to create user. Please try again.');
    }
  },

  /**
   * Update user information (admin only)
   */
  'admin.updateUser': async function(userData) {
    check(userData, {
      userId: String,
      profile: {
        name: String,
        organization: Match.Optional(String),
        role: Match.Optional(String),
        active: Boolean
      },
      isAdmin: Boolean
    });

    // Check if user is admin
    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only administrators can update users');
    }

    // Check if target user exists
    const targetUser = await Meteor.users.findOneAsync(userData.userId);
    if (!targetUser) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    try {
      // Update user profile
      await Meteor.users.updateAsync(userData.userId, {
        $set: {
          'profile.name': userData.profile.name,
          'profile.organization': userData.profile.organization || '',
          'profile.role': userData.profile.role || '',
          'profile.active': userData.profile.active,
          'profile.updatedBy': this.userId,
          'profile.updatedAt': new Date()
        }
      });

      // Handle admin role
      const currentlyAdmin = await Roles.userIsInRoleAsync(userData.userId, 'admin');

      if (userData.isAdmin && !currentlyAdmin) {
        await Roles.addUsersToRolesAsync(userData.userId, 'admin');
      } else if (!userData.isAdmin && currentlyAdmin) {
        await Roles.removeUsersFromRolesAsync(userData.userId, 'admin');
      }

      return { success: true };

    } catch (error) {
      console.error('Error updating user:', error);
      throw new Meteor.Error('user-update-failed', 'Failed to update user. Please try again.');
    }
  },

  /**
   * Toggle user active status (admin only)
   */
  'admin.toggleUserActive': async function(userId, active) {
    check(userId, String);
    check(active, Boolean);

    // Check if user is admin
    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only administrators can change user status');
    }

    // Check if target user exists
    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    try {
      await Meteor.users.updateAsync(userId, {
        $set: {
          'profile.active': active,
          'profile.updatedBy': this.userId,
          'profile.updatedAt': new Date()
        }
      });

      return { success: true };

    } catch (error) {
      console.error('Error updating user status:', error);
      throw new Meteor.Error('status-update-failed', 'Failed to update user status. Please try again.');
    }
  },

  /**
   * Toggle user admin status (admin only)
   */
  'admin.toggleUserAdmin': async function(userId, isAdmin) {
    check(userId, String);
    check(isAdmin, Boolean);

    // Check if user is admin
    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only administrators can change admin status');
    }

    // Check if target user exists
    const targetUser = await Meteor.users.findOneAsync(userId);
    if (!targetUser) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    // Prevent removing admin from yourself
    if (userId === this.userId && !isAdmin) {
      throw new Meteor.Error('cannot-remove-own-admin', 'You cannot remove admin privileges from yourself');
    }

    try {
      if (isAdmin) {
        await Roles.addUsersToRolesAsync(userId, 'admin');
      } else {
        await Roles.removeUsersFromRolesAsync(userId, 'admin');
      }

      return { success: true };

    } catch (error) {
      console.error('Error updating admin status:', error);
      throw new Meteor.Error('admin-update-failed', 'Failed to update admin status. Please try again.');
    }
  },

  /**
   * Get paginated list of users (admin only)
   */
  'admin.getUsersList': async function(options = {}) {
    check(options, {
      page: Match.Maybe(Number),
      limit: Match.Maybe(Number),
      search: Match.Maybe(String)
    });

    // Check if user is admin
    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized', 'Only administrators can list users');
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

    try {
      // Get total count
      const totalUsers = await Meteor.users.find(query).countAsync();
      const totalPages = Math.ceil(totalUsers / limit);

      // Get users with their roles
      const users = await Meteor.users.find(query, {
        skip,
        limit,
        sort: { 'profile.name': 1, 'emails.address': 1 },
        fields: {
          _id: 1,
          emails: 1,
          profile: 1,
          createdAt: 1
        }
      }).fetchAsync();

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const roles = await Roles.getRolesForUserAsync(user._id);
          return {
            ...user,
            roles
          };
        })
      );

      return {
        users: usersWithRoles,
        currentPage: page,
        totalPages,
        totalUsers,
        usersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };

    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch users. Please try again.');
    }
  }
});

// Helper function to generate temporary password
function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to send welcome email
async function sendWelcomeEmail(email, name, tempPassword) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to StronglyAI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to StronglyAI!</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>

          <p>Your account has been created successfully. You can now access the StronglyAI platform using the credentials below:</p>

          <div class="credentials">
            <strong>Login Details:</strong><br>
            <strong>Email:</strong> ${email}<br>
            <strong>Temporary Password:</strong> ${tempPassword}
          </div>

          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>

          <p style="text-align: center;">
            <a href="${Meteor.absoluteUrl()}" class="button">Login to StronglyAI</a>
          </p>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

          <p>Best regards,<br>
          The StronglyAI Team</p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} StronglyAI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to StronglyAI!

Hi ${name},

Your account has been created successfully. You can now access the StronglyAI platform using the credentials below:

Email: ${email}
Temporary Password: ${tempPassword}

Important: Please change your password after your first login for security purposes.

Login at: ${Meteor.absoluteUrl()}

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The StronglyAI Team

© ${new Date().getFullYear()} StronglyAI. All rights reserved.
  `;

  await Email.sendAsync({
    to: email,
    from: 'support@strongly.ai',
    subject: 'Welcome to StronglyAI - Your Account Details',
    html,
    text
  });
}
