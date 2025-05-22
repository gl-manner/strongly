// /imports/startup/client/routes/kubernetesRoutes.jsx
import React from 'react';
import { ProtectedRouteElement, MainLayoutWrapper } from './routeWrappers';

// Import Kubernetes pages
import { KubernetesDashboard } from '/imports/ui/pages/kubernetes/Dashboard/KubernetesDashboard';
import { KubernetesClusters } from '/imports/ui/pages/kubernetes/Clusters/KubernetesClusters';
import { KubernetesDeployments } from '/imports/ui/pages/kubernetes/Deployments/KubernetesDeployments';
import { KubernetesPods } from '/imports/ui/pages/kubernetes/Pods/KubernetesPods';
import { KubernetesPodDetail } from '/imports/ui/pages/kubernetes/Pods/KubernetesPodDetail';
import { KubernetesServices } from '/imports/ui/pages/kubernetes/Services/KubernetesServices';
import { KubernetesStorage } from '/imports/ui/pages/kubernetes/Storage/KubernetesStorage';
import { KubernetesMonitoring } from '/imports/ui/pages/kubernetes/Monitoring/KubernetesMonitoring';

// Import admin Kubernetes pages
import { KubernetesConfig } from '/imports/ui/pages/admin/kubernetes/KubernetesConfig';
import { KubernetesResources } from '/imports/ui/pages/admin/kubernetes/KubernetesResources';
import { KubernetesTemplates } from '/imports/ui/pages/admin/kubernetes/KubernetesTemplates';
import { KubernetesSecurity } from '/imports/ui/pages/admin/kubernetes/KubernetesSecurity';

export const kubernetesRoutes = [
  {
    element: <ProtectedRouteElement />,
    children: [
      {
        element: <MainLayoutWrapper />,
        children: [
          // Main Kubernetes routes
          {
            path: "kubernetes/dashboard",
            element: <KubernetesDashboard />
          },
          {
            path: "kubernetes/clusters",
            element: <KubernetesClusters />
          },
          {
            path: "kubernetes/deployments",
            element: <KubernetesDeployments />
          },
          {
            path: "kubernetes/pods",
            element: <KubernetesPods />
          },
          {
            path: "kubernetes/pods/:namespace/:podName",
            element: <KubernetesPodDetail />
          },
          {
            path: "kubernetes/services",
            element: <KubernetesServices />
          },
          {
            path: "kubernetes/storage",
            element: <KubernetesStorage />
          },
          {
            path: "kubernetes/monitoring",
            element: <KubernetesMonitoring />
          },
          // Admin Kubernetes routes
          {
            path: "admin/kubernetes/config",
            element: <KubernetesConfig />
          },
          {
            path: "admin/kubernetes/resources",
            element: <KubernetesResources />
          },
          {
            path: "admin/kubernetes/templates",
            element: <KubernetesTemplates />
          },
          {
            path: "admin/kubernetes/security",
            element: <KubernetesSecurity />
          }
        ]
      }
    ]
  }
];