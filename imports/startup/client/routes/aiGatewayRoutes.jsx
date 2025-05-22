// /imports/startup/client/routes/aiGatewayRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { AIGateway } from '/imports/ui/pages/AIGateway/AIGateway';
import { SelfHostedAI } from '/imports/ui/pages/AIGateway/SelfHostedAI/SelfHostedAI';
import { ThirdPartyAI } from '/imports/ui/pages/AIGateway/ThirdPartyAI/ThirdPartyAI';
import APIKeys from '/imports/ui/pages/AIGateway/APIKeys/APIKeys';

export const aiGatewayRoutes = [
  {
    path: "/operations/ai-gateway", // ✅ Added leading slash
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            index: true, // ✅ This makes it the default route for /operations/ai-gateway
            element: <AIGateway />
          },
          {
            path: "self-hosted", // ✅ Relative path (no leading slash for children)
            element: <SelfHostedAI />
          },
          {
            path: "third-party",
            element: <ThirdPartyAI />
          },
          {
            path: "api-keys",
            element: <APIKeys />
          }
        ]
      }
    ]
  }
];
