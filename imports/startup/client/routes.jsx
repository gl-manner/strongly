import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Import the AppWithProviders wrapper
import AppWithProviders from './AppWithProviders';

// Import ThemeProvider
import { ThemeProvider } from '/imports/ui/contexts/ThemeContext';

// Import layouts
import MainLayout from '/imports/ui/layouts/MainLayout/MainLayout';
import AuthLayout from '/imports/ui/layouts/AuthLayout/AuthLayout';

// Import common components
import LoadingState from '/imports/ui/components/common/LoadingState/LoadingState';

// Import pages
import { Home } from '/imports/ui/pages/dashboard/Home/Home';
import { UserManagement } from '/imports/ui/pages/users/UserManagement/UserManagement';
import { UserProfile } from '/imports/ui/pages/users/UserProfile/UserProfile';
import { FaqPage } from '/imports/ui/pages/faq/FaqPage/FaqPage';
import { Login } from '/imports/ui/pages/auth/Login/Login';
import { Register } from '/imports/ui/pages/auth/Register/Register';
import { ForgotPassword } from '/imports/ui/pages/auth/ForgotPassword/ForgotPassword';
import { ResetPassword } from '/imports/ui/pages/auth/ResetPassword/ResetPassword';
import { NotFound } from '/imports/ui/pages/NotFound';
import { PendingApproval } from '/imports/ui/pages/auth/PendingApproval/PendingApproval';
import { TermsAndConditions } from '/imports/ui/pages/legal/TermsAndConditions/TermsAndConditions';

// Import AI Gateway components
import { AIGateway } from '/imports/ui/pages/AIGateway/AIGateway';
import { SelfHostedAI } from '/imports/ui/pages/AIGateway/SelfHostedAI/SelfHostedAI';
import { ThirdPartyAI } from '/imports/ui/pages/AIGateway/ThirdPartyAI/ThirdPartyAI';
import { TraditionalAI } from '/imports/ui/pages/AIGateway/TraditionalAI/TraditionalAI';

// Import Kubernetes components
import { KubernetesClusters } from '/imports/ui/pages/kubernetes/Clusters/KubernetesClusters';
import { KubernetesDeployments } from '/imports/ui/pages/kubernetes/Deployments/KubernetesDeployments';
import { KubernetesPods } from '/imports/ui/pages/kubernetes/Pods/KubernetesPods';
import { KubernetesServices } from '/imports/ui/pages/kubernetes/Services/KubernetesServices';
import { KubernetesStorage } from '/imports/ui/pages/kubernetes/Storage/KubernetesStorage';
import { KubernetesMonitoring } from '/imports/ui/pages/kubernetes/Monitoring/KubernetesMonitoring';

// Import admin Kubernetes components
import { KubernetesConfig } from '/imports/ui/pages/admin/kubernetes/KubernetesConfig';
import { KubernetesResources } from '/imports/ui/pages/admin/kubernetes/KubernetesResources';
import { KubernetesTemplates } from '/imports/ui/pages/admin/kubernetes/KubernetesTemplates';
import { KubernetesSecurity } from '/imports/ui/pages/admin/kubernetes/KubernetesSecurity';

// Import Kubernetes dashboard
import { KubernetesDashboard } from '/imports/ui/pages/kubernetes/Dashboard/KubernetesDashboard';

// Protected route wrapper element
const ProtectedRouteElement = ({ requiredRoles = [] }) => {
  const { isLoggedIn, userRoles, isLoading, user } = useTracker(() => {
    const userSub = Meteor.subscribe('userData');
    const user = Meteor.user();

    // Check if user has admin role using Roles package
    const userRoles = user ? (user.roles || []) : [];

    return {
      isLoading: !userSub.ready(),
      isLoggedIn: !!user,
      userRoles,
      user
    };
  });

  // If still loading auth state, show loading
  if (isLoading) return <LoadingState fullPage={true} message="Loading your account..." />;

  // If not logged in, redirect to login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // If roles are required, check if user has at least one of them
  const hasRequiredRole = requiredRoles.length === 0 ||
    requiredRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user account is approved
  if (user?.profile && user.profile.approved === false) {
    return <Navigate to="/pending-approval" replace />;
  }

  // If all checks pass, render the outlet (children)
  return <Outlet />;
};

// Public layout (for auth pages)
const PublicLayout = () => {
  const { isLoggedIn, isLoading } = useTracker(() => {
    return {
      isLoading: Meteor.loggingIn(),
      isLoggedIn: !!Meteor.userId()
    };
  });

  // If still checking login state, show loading
  if (isLoading) return <LoadingState fullPage={true} message="Please wait..." />;

  // If logged in, redirect to dashboard from public pages
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Create the router
const router = createBrowserRouter([
  // Public routes (auth pages)
  {
    element: (
        <ThemeProvider>
          <AppWithProviders />
        </ThemeProvider>
      ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />
          },
          {
            path: "register",
            element: <Register />
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />
          },
          {
            path: "reset-password/:token",
            element: <ResetPassword />
          }
        ]
      },
      {
        path: "pending-approval",
        element: <PendingApproval />
      },
      // Legal pages (no auth layout)
      {
        path: "terms",
        element: <TermsAndConditions />
      }
    ]
  },

  // Protected routes
  {
    element: (
      <ThemeProvider>
        <ProtectedRouteElement />
      </ThemeProvider>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: "dashboard",
            element: <Home />
          },
          {
            path: "profile",
            element: <UserProfile />
          },
          // SUPPORT section routes
          {
            path: "support/faq",
            element: <FaqPage />
          },
          // Apps section
          {
            path: "apps",
            element: <div className="page-content">Apps Page</div>
          },
          // Workflows section
          {
            path: "workflows/builder",
            element: <div className="page-content">Workflow Builder</div>
          },
          {
            path: "workflows/monitor",
            element: <div className="page-content">Workflow Monitor</div>
          },
          // Analytics section
          {
            path: "analytics/users",
            element: <div className="page-content">Users Analytics</div>
          },
          {
            path: "analytics/models",
            element: <div className="page-content">Models Analytics</div>
          },
          // Operations section
          {
            path: "operations/platform",
            element: <div className="page-content">Platform Operations</div>
          },
          // AI Gateway section
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
          {
            path: "operations/ai-gateway/self-hosted/custom",
            element: <SelfHostedAI />  // For now, just reuse SelfHostedAI
          },
          // Contact support
          {
            path: "support/contact",
            element: <div className="page-content">Contact Support</div>
          }
        ]
      }
    ]
  },

  // Admin routes
  {
    element: (
      <ThemeProvider>
        <ProtectedRouteElement requiredRoles={['admin']} />
      </ThemeProvider>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "admin/users",
            element: <UserManagement />
          },
          {
            path: "admin/governance",
            element: <div className="page-content">Governance</div>
          },
          {
            path: "admin/finops",
            element: <div className="page-content">FinOps</div>
          },
          {
            path: "admin/faq",
            element: <div className="page-content">FAQ Management</div>
          }
        ]
      }
    ]
  },

  // Kubernetes Management routes - uses same MainLayout with the second sidebar
  {
    element: (
      <ThemeProvider>
        <ProtectedRouteElement />
      </ThemeProvider>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
          // Root Kubernetes route redirects to dashboard
          {
            path: "kubernetes",
            element: <Navigate to="/kubernetes/dashboard" replace />
          },
          // Kubernetes Dashboard
          {
            path: "kubernetes/dashboard",
            element: <KubernetesDashboard />
          },
          // User Kubernetes routes
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
          }
        ]
      }
    ]
  },

  // Admin Kubernetes Management routes - uses same MainLayout with the second sidebar
  {
    element: (
      <ThemeProvider>
        <ProtectedRouteElement requiredRoles={['admin']} />
      </ThemeProvider>
    ),
    children: [
      {
        element: <MainLayout />,
        children: [
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
  },

  // Catch-all route
  {
    path: "*",
    element: <NotFound />
  }
]);

export default router;