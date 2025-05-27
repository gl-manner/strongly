// /imports/startup/client/routes/index.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { NotFound } from '/imports/ui/pages/NotFound';

// Import route groups
import { authRoutes } from './authRoutes';
import { agentWorkflowRoutes } from './agentWorkflowRoutes';
import { dashboardRoutes } from './dashboardRoutes';
import { adminRoutes } from './adminRoutes';
import { supportRoutes } from './supportRoutes';
import { operationsRoutes } from './operationsRoutes';
import { aiGatewayRoutes } from './aiGatewayRoutes';
import { appsRoutes } from './appsRoutes';
import { kubernetesRoutes } from './kubernetesRoutes';
import { marketplaceRoutes } from './marketplaceRoutes';

// Combine all routes
const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...agentWorkflowRoutes,
  ...adminRoutes,
  ...supportRoutes,
  ...operationsRoutes,
  ...aiGatewayRoutes,
  ...appsRoutes,
  ...kubernetesRoutes,
  ...marketplaceRoutes,
  // Catch-all route
  {
    path: "*",
    element: <NotFound />
  }
];

// Create the router
const router = createBrowserRouter(routes);

export default router;
