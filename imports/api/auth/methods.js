// /imports/api/auth/methods.js
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
  /**
   * Register a new user account
   * @param {Object} userData - User registration data
   * @returns {String} userId - ID of the created user
   */
  'auth.register': async function(userData) {
    check(userData, {
      email: String,
      password: String,
      profile: {
        name: String,
        acceptTerms: Boolean
      }
    });

    const { email, password, profile } = userData;

    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Meteor.Error('invalid-email', 'Please enter a valid email address');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Meteor.Error('weak-password', 'Password must be at least 8 characters long');
    }

    // Check if terms and conditions are accepted
    if (!profile.acceptTerms) {
      throw new Meteor.Error('terms-not-accepted', 'You must accept the terms and conditions');
    }

    try {
      // Create the user
      const userId = await Accounts.createUserAsync({
        email,
        password,
        profile: {
          ...profile,
          approved: false, // Users need admin approval by default
          createdAt: new Date()
        }
      });

      // Assign the 'user' role by default
      // In Meteor 3, this should still work synchronously
      Roles.addUsersToRoles(userId, ['user']);

      // Send verification email
      if (userId) {
        Accounts.sendVerificationEmail(userId);
      }

      return userId;
    } catch (error) {
      if (error.reason === 'Email already exists.') {
        throw new Meteor.Error('email-exists', 'An account with this email already exists');
      }

      throw new Meteor.Error('registration-failed', error.reason || 'Registration failed');
    }
  },

  /**
   * Send password reset email
   * @param {String} email - User's email address
   */
  'auth.forgotPassword': async function(email) {
    check(email, String);

    // Find user by email
    const user = await Meteor.users.findOneAsync({ 'emails.address': email });

    if (!user) {
      // Don't notify the caller to prevent email enumeration
      // But log the error internally
      console.log(`Password reset attempted for non-existent email: ${email}`);
      return;
    }

    try {
      await Accounts.sendResetPasswordEmailAsync(user._id, email);
    } catch (error) {
      throw new Meteor.Error('reset-email-failed', 'Failed to send password reset email');
    }
  },

  /**
   * Reset password with token
   * @param {String} token - Password reset token
   * @param {String} newPassword - New password
   */
  'auth.resetPassword': async function(token, newPassword) {
    check(token, String);
    check(newPassword, String);

    // Validate password strength
    if (newPassword.length < 8) {
      throw new Meteor.Error('weak-password', 'Password must be at least 8 characters long');
    }

    try {
      await Accounts.resetPasswordAsync(token, newPassword);
    } catch (error) {
      throw new Meteor.Error(
        'reset-password-failed',
        error.reason || 'Failed to reset password'
      );
    }
  },

  /**
   * Change password
   * @param {Object} passwords - Old and new passwords
   */
  'auth.changePassword': async function(passwords) {
    check(passwords, {
      oldPassword: String,
      newPassword: String
    });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const { oldPassword, newPassword } = passwords;

    // Validate password strength
    if (newPassword.length < 8) {
      throw new Meteor.Error('weak-password', 'Password must be at least 8 characters long');
    }

    try {
      await Accounts.changePasswordAsync(oldPassword, newPassword);
    } catch (error) {
      throw new Meteor.Error(
        'change-password-failed',
        error.reason || 'Failed to change password'
      );
    }
  },

  /**
   * Resend verification email
   */
  'auth.resendVerificationEmail': async function() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    const user = await Meteor.users.findOneAsync(this.userId);

    if (!user) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }

    // Find the unverified email
    const unverifiedEmail = user.emails.find(email => !email.verified);

    if (!unverifiedEmail) {
      throw new Meteor.Error('already-verified', 'Email is already verified');
    }

    try {
      Accounts.sendVerificationEmail(this.userId, unverifiedEmail.address);
    } catch (error) {
      throw new Meteor.Error(
        'verification-email-failed',
        'Failed to send verification email'
      );
    }
  }
});
