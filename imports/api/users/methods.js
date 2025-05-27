// /imports/api/users/methods.js
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

Meteor.methods({
  /**
   * List users with pagination and search
   * @param {Object} options - Query options
   */
  'users.list': async function(options = {}) {
    check(options, {
      page: Match.Maybe(Number),
      limit: Match.Maybe(Number),
      search: Match.Maybe(String)
    });

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to list users');
    }

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10)); // Max 50 users per page
    const skip = (page - 1) * limit;
    const search = options.search || '';

    // Build search query
    const query = {};
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'profile.name': searchRegex },
        { 'username': searchRegex },
        { 'emails.address': searchRegex }
      ];
    }

    // Get total count for pagination using async method
    const totalUsers = await Meteor.users.find(query).countAsync();
    const totalPages = Math.ceil(totalUsers / limit);

    // Get users with limited fields for security
    const users = await Meteor.users.find(query, {
      skip,
      limit,
      sort: { 'profile.name': 1, 'username': 1 },
      fields: {
        _id: 1,
        username: 1,
        emails: 1,
        profile: 1,
        roles: 1,
        status: 1,
        createdAt: 1
      }
    }).fetchAsync();

    return {
      users,
      currentPage: page,
      totalPages,
      totalUsers,
      usersPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  },

  /**
   * Update the current user's profile
   * @param {Object} profileData - User profile data to update
   */
  'users.updateProfile': async function(profileData) {
    check(profileData, {
      name: String,
      phone: Match.Maybe(String),
      organization: Match.Maybe(String),
      role: Match.Maybe(String),
      location: Match.Maybe(String)
    });

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update your profile');
    }

    // Get the current user's profile
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    // Update the user's profile
    return Meteor.users.updateAsync(
      { _id: this.userId },
      {
        $set: {
          profile: {
            ...user.profile,
            ...profileData,
            updatedAt: new Date()
          }
        }
      }
    );
  },

  /**
   * Update user avatar image
   * @param {String} base64Image - Base64 encoded image data
   */
  'users.updateAvatar': async function(base64Image) {
    check(base64Image, String);

    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update your avatar.');
    }

    // Validate base64 image format
    if (!base64Image.startsWith('data:image/')) {
      throw new Meteor.Error('invalid-image', 'Invalid image format.');
    }

    // Check image size (base64 is about 33% larger than original)
    // Limiting to ~3.75MB base64 (which is ~2.8MB original)
    if (base64Image.length > 3750000) {
      throw new Meteor.Error('image-too-large', 'Image size is too large. Please choose a smaller image.');
    }

    // Get the current user's profile
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    try {
      // Update the user's avatar
      return Meteor.users.updateAsync(
        { _id: this.userId },
        {
          $set: {
            profile: {
              ...user.profile,
              avatar: base64Image,
              avatarUpdatedAt: new Date()
            }
          }
        }
      );
    } catch (error) {
      throw new Meteor.Error('avatar-update-failed', 'Failed to update avatar. Please try again.');
    }
  },

  /**
   * Remove user avatar
   */
  'users.removeAvatar': async function() {
    // Make sure the user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove your avatar.');
    }

    // Get the current user's profile
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    try {
      // Remove the user's avatar by creating a new profile object without avatar fields
      const updatedProfile = { ...user.profile };
      delete updatedProfile.avatar;
      delete updatedProfile.avatarUpdatedAt;

      return Meteor.users.updateAsync(
        { _id: this.userId },
        {
          $set: {
            profile: updatedProfile
          }
        }
      );
    } catch (error) {
      throw new Meteor.Error('avatar-removal-failed', 'Failed to remove avatar. Please try again.');
    }
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
  },

  /**
   * Get user details by ID (for admins or own profile)
   * @param {String} userId - ID of the user to get
   */
  'users.getById': async function(userId) {
    check(userId, String);

    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Users can get their own data, or admins can get any user's data
    const isOwnProfile = this.userId === userId;
    const isAdmin = Roles.userIsInRole(this.userId, 'admin');

    if (!isOwnProfile && !isAdmin) {
      throw new Meteor.Error('not-authorized', 'You can only access your own profile or must be an admin');
    }

    const user = await Meteor.users.findOneAsync(userId, {
      fields: {
        _id: 1,
        username: 1,
        emails: 1,
        profile: 1,
        roles: 1,
        status: 1,
        createdAt: 1
      }
    });

    if (!user) {
      throw new Meteor.Error('not-found', 'User not found');
    }

    return user;
  }
});
