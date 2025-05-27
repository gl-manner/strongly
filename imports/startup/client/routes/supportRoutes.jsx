// /imports/startup/client/routes/supportRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { FaqPage } from '/imports/ui/pages/faq/FaqPage/FaqPage';
import { ContactPage } from '/imports/ui/pages/contact/ContactPage/ContactPage';

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
            element: <ContactPage />
          }
        ]
      }
    ]
  }
];
