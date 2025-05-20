// /imports/startup/client/routes/dashboardRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { Home } from '/imports/ui/pages/dashboard/Home/Home';
import { UserProfile } from '/imports/ui/pages/users/UserProfile/UserProfile';

export const dashboardRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: "dashboard",
            element: <Home />
          },
          {
            path: "profile",
            element: <UserProfile />
          },
          // Apps section
          {
            path: "apps",
            element: <div className="page-content">Apps Page</div>
          },
          // Workflows section
          {
            path: "workflows/builder",
            element: <div className="page-content">Workflow Builder</div>
          },
          {
            path: "workflows/monitor",
            element: <div className="page-content">Workflow Monitor</div>
          },
          // Analytics section
          {
            path: "analytics/users",
            element: <div className="page-content">Users Analytics</div>
          },
          {
            path: "analytics/models",
            element: <div className="page-content">Models Analytics</div>
          }
        ]
      }
    ]
  }
];
