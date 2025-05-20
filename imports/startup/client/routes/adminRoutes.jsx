// /imports/startup/client/routes/adminRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { UserManagement } from '/imports/ui/pages/users/UserManagement/UserManagement';

export const adminRoutes = [
  {
    element: <ProtectedRouteElement requiredRoles={['admin']} />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "admin/users",
            element: <UserManagement />
          },
          {
            path: "admin/governance",
            element: <div className="page-content">Governance</div>
          },
          {
            path: "admin/finops",
            element: <div className="page-content">FinOps</div>
          },
          {
            path: "admin/faq",
            element: <div className="page-content">FAQ Management</div>
          }
        ]
      }
    ]
  }
];
