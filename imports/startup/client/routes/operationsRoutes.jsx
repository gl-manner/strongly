// /imports/startup/client/routes/operationsRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';

export const operationsRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "operations/platform",
            element: <div className="page-content">Platform Operations</div>
          }
        ]
      }
    ]
  }
];
