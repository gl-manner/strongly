// /imports/hooks/useAuth.js
import { useContext, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { AuthContext } from '/imports/ui/contexts/AuthContext';

/**
 * Custom hook for authentication-related functionality
 */
export const useAuth = () => {
  // Use the AuthContext if available (if wrapped in AuthProvider)
  const authContext = useContext(AuthContext);
  if (authContext) {
    return authContext;
  }

  // Otherwise, provide direct functionality (for use outside AuthProvider)
  // This is useful for components that are not descendants of AuthProvider

  // Use Meteor's reactive data to track user login state
  const { user, userId, isLoggedIn, userRoles, isReady } = useTracker(() => {
    // Subscribe to user data
    const subscription = Meteor.subscribe('userData');
    const user = Meteor.user();
    const userId = Meteor.userId();

    // Get user roles if available
    let userRoles = [];
    if (user && user.roles) {
      userRoles = user.roles;
    }

    return {
      user,
      userId,
      isLoggedIn: !!userId,
      userRoles,
      isReady: subscription.ready()
    };
  });

  // Login function using async/await
  const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      Meteor.loginWithPassword(email, password, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // Logout function using async/await
  const logout = async () => {
    return new Promise((resolve, reject) => {
      Meteor.logout((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // Register function
  const register = async (userData) => {
    try {
      return await Meteor.callAsync('auth.register', userData);
    } catch (error) {
      throw error;
    }
  };

  // Password reset request
  const forgotPassword = async (email) => {
    try {
      return await Meteor.callAsync('auth.forgotPassword', email);
    } catch (error) {
      throw error;
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      return await Meteor.callAsync('auth.resetPassword', token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      return await Meteor.callAsync('auth.changePassword', {
        oldPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  return {
    user,
    userId,
    isLoggedIn,
    isLoading: !isReady,
    userRoles,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    hasRole
  };
};
