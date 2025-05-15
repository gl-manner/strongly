// /imports/utils/server/permissions.js
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

/**
 * Check if user is logged in
 * @param {Object} userId - User ID (usually this.userId in Meteor methods)
 * @returns {boolean} True if logged in, false otherwise
 * @throws {Meteor.Error} If not logged in
 */
export const requireLogin = (userId) => {
  if (!userId) {
    throw new Meteor.Error(
      'not-authorized',
      'You must be logged in to perform this action'
    );
  }
  return true;
};

/**
 * Check if user has required roles
 * @param {string} userId - User ID
 * @param {Array|string} roles - Required roles
 * @param {boolean} requireAll - If true, user must have all roles, otherwise any role is sufficient
 * @returns {boolean} True if user has required roles, false otherwise
 * @throws {Meteor.Error} If user doesn't have required roles
 */
export const requireRoles = (userId, roles, requireAll = false) => {
  // First check if user is logged in
  requireLogin(userId);

  // Convert single role to array
  const roleArray = Array.isArray(roles) ? roles : [roles];

  let hasRoles;
  if (requireAll) {
    // Check if user has all required roles
    hasRoles = roleArray.every(role => Roles.userIsInRole(userId, role));
  } else {
    // Check if user has any of the required roles
    hasRoles = Roles.userIsInRole(userId, roleArray);
  }

  if (!hasRoles) {
    throw new Meteor.Error(
      'not-authorized',
      'You do not have permission to perform this action'
    );
  }

  return true;
};

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {boolean} True if user is admin, false otherwise
 * @throws {Meteor.Error} If user is not admin
 */
export const requireAdmin = (userId) => {
  return requireRoles(userId, 'admin');
};

/**
 * Check if user is authorized to modify another user
 * @param {string} userId - Current user ID
 * @param {string} targetUserId - Target user ID
 * @returns {boolean} True if authorized, false otherwise
 * @throws {Meteor.Error} If not authorized
 */
export const canModifyUser = (userId, targetUserId) => {
  // First check if user is logged in
  requireLogin(userId);

  // Allow if user is modifying themselves
  if (userId === targetUserId) {
    return true;
  }

  // Allow if user is admin
  if (Roles.userIsInRole(userId, 'admin')) {
    return true;
  }

  throw new Meteor.Error(
    'not-authorized',
    'You do not have permission to modify this user'
  );
};

/**
 * Check if user owns document
 * @param {string} userId - User ID
 * @param {Object} doc - Document to check
 * @param {string} ownerField - Field in document that identifies owner
 * @returns {boolean} True if user owns document, false otherwise
 * @throws {Meteor.Error} If user doesn't own document
 */
export const requireOwner = (userId, doc, ownerField = 'userId') => {
  // First check if user is logged in
  requireLogin(userId);

  if (!doc) {
    throw new Meteor.Error('not-found', 'Document not found');
  }

  // Check if user owns document
  if (doc[ownerField] !== userId) {
    throw new Meteor.Error(
      'not-authorized',
      'You do not have permission to modify this document'
    );
  }

  return true;
};

/**
 * Check if document can be modified by user
 * @param {string} userId - User ID
 * @param {Object} doc - Document to check
 * @param {string} ownerField - Field in document that identifies owner
 * @returns {boolean} True if user can modify document, false otherwise
 * @throws {Meteor.Error} If user can't modify document
 */
export const canModifyDocument = (userId, doc, ownerField = 'userId') => {
  // First check if user is logged in
  requireLogin(userId);

  if (!doc) {
    throw new Meteor.Error('not-found', 'Document not found');
  }

  // Allow if user is owner
  if (doc[ownerField] === userId) {
    return true;
  }

  // Allow if user is admin
  if (Roles.userIsInRole(userId, 'admin')) {
    return true;
  }

  throw new Meteor.Error(
    'not-authorized',
    'You do not have permission to modify this document'
  );
};

/**
 * Check if user is authorized to access area or perform action
 * @param {string} userId - User ID
 * @param {Object} options - Authorization options
 * @returns {boolean} True if authorized, false otherwise
 * @throws {Meteor.Error} If not authorized
 */
export const authorize = (userId, options = {}) => {
  const {
    requireAuthentication = true,
    requiredRoles = null,
    requireAllRoles = false,
    adminOverride = true
  } = options;

  // Check authentication
  if (requireAuthentication) {
    requireLogin(userId);
  }

  // Admin override
  if (adminOverride && Roles.userIsInRole(userId, 'admin')) {
    return true;
  }

  // Check roles if required
  if (requiredRoles) {
    requireRoles(userId, requiredRoles, requireAllRoles);
  }

  return true;
};

/**
 * Create a method rule
 * @param {Function} ruleFunction - Function to check rule
 * @param {Object} options - Rule options
 * @returns {Function} Rule function
 */
export const createRule = (ruleFunction, options = {}) => {
  const {
    errorMessage = 'Not authorized',
    errorCode = 'not-authorized'
  } = options;

  return async (...args) => {
    const isAuthorized = await ruleFunction(...args);

    if (!isAuthorized) {
      throw new Meteor.Error(errorCode, errorMessage);
    }

    return true;
  };
};
