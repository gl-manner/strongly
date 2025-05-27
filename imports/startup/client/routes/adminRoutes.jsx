// /imports/startup/client/routes/adminRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { UsersPage } from '/imports/ui/pages/admin/UsersPage/UsersPage';

export const adminRoutes = [
  {
    element: <ProtectedRouteElement requiredRoles={['admin']} />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "admin/users",
            element: <UsersPage />
          },
          {
            path: "admin/governance",
            element: <div className="page-content">
              <div className="container-fluid px-4">
                <div className="row">
                  <div className="col-12">
                    <h2>Governance</h2>
                    <p className="text-muted">Governance management tools coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          },
          {
            path: "admin/finops",
            element: <div className="page-content">
              <div className="container-fluid px-4">
                <div className="row">
                  <div className="col-12">
                    <h2>FinOps</h2>
                    <p className="text-muted">Financial operations dashboard coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          },
          {
            path: "admin/faq",
            element: <div className="page-content">
              <div className="container-fluid px-4">
                <div className="row">
                  <div className="col-12">
                    <h2>FAQ Management</h2>
                    <p className="text-muted">FAQ content management system coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          }
        ]
      }
    ]
  }
];
