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

          // View all apps and agents
          {
            path: "marketplace/all",
            element: <MarketplaceViewAll />
          },

          // IMPORTANT: Specific routes must come BEFORE generic patterns
          // Individual marketplace item detail page - NEW PATTERN
          {
            path: "marketplace/item/:id",
            element: <MarketplaceDetail />
          },

          // Browse by vertical
          {
            path: "marketplace/vertical/:vertical",
            element: <MarketplaceViewAll />
          },

          // Browse by type
          {
            path: "marketplace/type/:type",
            element: <MarketplaceViewAll />
          },

          // Combined filtering
          {
            path: "marketplace/vertical/:vertical/type/:type",
            element: <MarketplaceViewAll />
          },

          // Legacy support - THIS MUST BE LAST to avoid conflicts
          {
            path: "marketplace/:id",
            element: <MarketplaceDetail />
          }
        ]
      }
    ]
  }
];

// Debug component to test route matching
export const RouteDebugger = () => {
  const location = useLocation();
  const params = useParams();

  console.log('Current route:', location.pathname);
  console.log('Route params:', params);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: 'yellow',
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>Path: {location.pathname}</div>
      <div>Params: {JSON.stringify(params)}</div>
    </div>
  );
};
