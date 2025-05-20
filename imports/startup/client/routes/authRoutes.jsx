// /imports/startup/client/routes/authRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { PublicLayout, AuthLayoutWrapper } from './routeWrappers';
import { Login } from '/imports/ui/pages/auth/Login/Login';
import { Register } from '/imports/ui/pages/auth/Register/Register';
import { ForgotPassword } from '/imports/ui/pages/auth/ForgotPassword/ForgotPassword';
import { ResetPassword } from '/imports/ui/pages/auth/ResetPassword/ResetPassword';
import { PendingApproval } from '/imports/ui/pages/auth/PendingApproval/PendingApproval';
import { TermsAndConditions } from '/imports/ui/pages/legal/TermsAndConditions/TermsAndConditions';

export const authRoutes = [
  {
    element: <PublicLayout />,
    children: [
      {
        element: <AuthLayoutWrapper />,
        children: [
          {
            path: "login",
            element: <Login />
          },
          {
            path: "register",
            element: <Register />
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />
          },
          {
            path: "reset-password/:token",
            element: <ResetPassword />
          }
        ]
      },
      {
        path: "pending-approval",
        element: <PendingApproval />
      },
      // Legal pages (no auth layout)
      {
        path: "terms",
        element: <TermsAndConditions />
      }
    ]
  }
];
