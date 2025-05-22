// /imports/startup/client/routes/marketplaceRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';
import { Marketplace } from '/imports/ui/pages/Marketplace/Marketplace';
import { MarketplaceDetail } from '/imports/ui/pages/Marketplace/MarketplaceDetail/MarketplaceDetail';
import { MarketplaceViewAll } from '/imports/ui/pages/Marketplace/MarketplaceViewAll/MarketplaceViewAll';

export const marketplaceRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          // Main marketplace page
          {
            path: "marketplace",
            element: <Marketplace />
          },
          // View all industries page
          {
            path: "marketplace/all",
            element: <MarketplaceViewAll />
          },
          // Marketplace item detail page
          {
            path: "marketplace/:id",
            element: <MarketplaceDetail />
          },
          // Browse by vertical
          {
            path: "marketplace/vertical/:vertical",
            element: <Marketplace />
          },
          // Browse by type (apps/agents)
          {
            path: "marketplace/type/:type",
            element: <Marketplace />
          }
        ]
      }
    ]
  }
];
