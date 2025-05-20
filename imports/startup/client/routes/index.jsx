// /imports/startup/client/routes/index.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '/imports/ui/pages/NotFound';

// Import route groups
import { authRoutes } from './authRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { adminRoutes } from './adminRoutes';
import { supportRoutes } from './supportRoutes';
import { operationsRoutes } from './operationsRoutes';
import { aiGatewayRoutes } from './aiGatewayRoutes';

// Combine all routes
const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...adminRoutes,
  ...supportRoutes,
  ...operationsRoutes,
  ...aiGatewayRoutes,
  // Catch-all route
  {
    path: "*",
    element: <NotFound />
  }
];

// Create the router
const router = createBrowserRouter(routes);

export default router;
