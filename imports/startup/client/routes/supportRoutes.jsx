// /imports/startup/client/routes/supportRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { FaqPage } from '/imports/ui/pages/faq/FaqPage/FaqPage';

export const supportRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "support/faq",
            element: <FaqPage />
          },
          {
            path: "support/contact",
            element: <div className="page-content">Contact Support</div>
          }
        ]
      }
    ]
  }
];
