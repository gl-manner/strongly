// /imports/startup/client/routes/appsRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { Apps } from '/imports/ui/pages/Apps/Apps';
import { AppDetails } from '/imports/ui/pages/Apps/AppDetails/AppDetails';
import { CreateApp } from '/imports/ui/pages/Apps/CreateApp/CreateApp';

export const appsRoutes = [
  {
    path: "/apps",
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            index: true,
            element: <Apps />
          },
          {
            path: "create",
            element: <CreateApp />
          },
          {
            path: ":appId",
            element: <AppDetails />
          }
        ]
      }
    ]
  }
];
