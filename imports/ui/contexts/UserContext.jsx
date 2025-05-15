// /imports/ui/contexts/UserContext.jsx
import React, { createContext } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { users, isLoading } = useTracker(() => {
    // Only subscribe if user is admin
    const user = Meteor.user();
    const isAdmin = user && user.roles && user.roles.includes('admin');

    if (isAdmin) {
      const subscription = Meteor.subscribe('users.all');
      return {
        users: Meteor.users.find({}).fetch(),
        isLoading: !subscription.ready()
      };
    }

    return { users: [], isLoading: false };
  });

  // Function to update user profile
  const updateProfile = async (userId, profileData) => {
    return await Meteor.callAsync('users.updateProfile', userId, profileData);
  };

  // Function to update user roles (admin only)
  const updateUserRoles = async (userId, roles) => {
    return await Meteor.callAsync('users.updateRoles', userId, roles);
  };

  // Function to approve a user (admin only)
  const approveUser = async (userId) => {
    return await Meteor.callAsync('users.approve', userId);
  };

  const value = {
    users,
    isLoading,
    updateProfile,
    updateUserRoles,
    approveUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
