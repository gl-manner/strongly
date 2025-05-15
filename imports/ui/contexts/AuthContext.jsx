// /imports/ui/contexts/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Use Meteor's reactive data to track user login state
  const { user, userId, isLoggedIn, userRoles, isReady } = useTracker(() => {
    // Subscribe to user roles
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

  // Update loading state based on subscription readiness
  useEffect(() => {
    if (isReady) {
      setIsLoading(false);
    }
  }, [isReady]);

  // Login function
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

  // Logout function
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
    return Meteor.callAsync('auth.register', userData);
  };

  // Password reset request
  const forgotPassword = async (email) => {
    return Meteor.callAsync('auth.forgotPassword', email);
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    return Meteor.callAsync('auth.resetPassword', token, newPassword);
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRoles.includes(role);
  };

  const value = {
    user,
    userId,
    isLoggedIn,
    isLoading,
    userRoles,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
