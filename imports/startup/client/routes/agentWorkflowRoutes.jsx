// /imports/startup/client/routes/agentRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import AgentWorkflow from '/imports/ui/pages/AgentWorkflow/AgentWorkflow';

export const agentWorkflowRoutes = [
  {
    path: "/agent-workflow",
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            index: true,
            element: <AgentWorkflow />
          },
          {
            path: "new",
            element: <AgentWorkflow />
          },
          {
            path: ":agentId",
            element: <AgentWorkflow />
          }
        ]
      }
    ]
  }
];

// Export the routes you want to use
export default agentWorkflowRoutes;
