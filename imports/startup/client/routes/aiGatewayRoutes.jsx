// /imports/startup/client/routes/aiGatewayRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { AIGateway } from '/imports/ui/pages/AIGateway/AIGateway';
import { SelfHostedAI } from '/imports/ui/pages/AIGateway/SelfHostedAI/SelfHostedAI';
import { ThirdPartyAI } from '/imports/ui/pages/AIGateway/ThirdPartyAI/ThirdPartyAI';
import { TraditionalAI } from '/imports/ui/pages/AIGateway/TraditionalAI/TraditionalAI';
// import CustomModelForm from '/imports/ui/pages/AIGateway/SelfHostedAI/CustomModelForm';
import APIKeys from '/imports/ui/pages/AIGateway/APIKeys/APIKeys';

export const aiGatewayRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          {
            path: "operations/ai-gateway",
            element: <AIGateway />
          },
          {
            path: "operations/ai-gateway/self-hosted",
            element: <SelfHostedAI />
          },
          {
            path: "operations/ai-gateway/third-party",
            element: <ThirdPartyAI />
          },
          {
            path: "operations/ai-gateway/traditional",
            element: <TraditionalAI />
          },
          // {
          //   path: "operations/ai-gateway/self-hosted/custom",
          //   element: <CustomModelForm />
          // },
          // {
          //   path: "operations/ai-gateway/self-hosted/edit/:modelId",
          //   element: <CustomModelForm />
          // },
          {
            path: "operations/ai-gateway/api-keys",
            element: <APIKeys />
          }
        ]
      }
    ]
  }
];
