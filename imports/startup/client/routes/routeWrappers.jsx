// /imports/startup/client/routes/routeWrappers.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import LoadingState from '/imports/ui/components/common/LoadingState/LoadingState';
import MainLayout from '/imports/ui/layouts/MainLayout/MainLayout';
import AuthLayout from '/imports/ui/layouts/AuthLayout/AuthLayout';

// Protected route wrapper element - moved to separate file for reuse
export const ProtectedRouteElement = ({ requiredRoles = [] }) => {
  const { isLoggedIn, userRoles, isLoading, user } = useTracker(() => {
    const userSub = Meteor.subscribe('userData');
    const user = Meteor.user();

    // Check if user has admin role using Roles package
    const userRoles = user ? (user.roles || []) : [];

    return {
      isLoading: !userSub.ready(),
      isLoggedIn: !!user,
      userRoles,
      user
    };
  });

  // If still loading auth state, show loading
  if (isLoading) return <LoadingState fullPage={true} message="Loading your account..." />;

  // If not logged in, redirect to login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // If roles are required, check if user has at least one of them
  const hasRequiredRole = requiredRoles.length === 0 ||
    requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user account is approved
  if (user?.profile && user.profile.approved === false) {
    return <Navigate to="/pending-approval" replace />;
  }

  // If all checks pass, render the outlet (children)
  return <Outlet />;
};

// Public layout (for auth pages)
export const PublicLayout = () => {
  const { isLoggedIn, isLoading } = useTracker(() => {
    return {
      isLoading: Meteor.loggingIn(),
      isLoggedIn: !!Meteor.userId()
    };
  });

  // If still checking login state, show loading
  if (isLoading) return <LoadingState fullPage={true} message="Please wait..." />;

  // If logged in, redirect to dashboard from public pages
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Layouts with outlets for reuse
export const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

export const AuthLayoutWrapper = () => (
  <AuthLayout>
    <Outlet />
  </AuthLayout>
);
