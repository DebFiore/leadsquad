import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSubdomainRedirect } from "@/hooks/useSubdomainRedirect";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Integrations from "./pages/Integrations";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminProvisioning from "./pages/admin/AdminProvisioning";
import AdminBranding from "./pages/admin/AdminBranding";
import AdminOrganizations from "./pages/admin/Organizations";
import AdminVoiceLibrary from "./pages/admin/VoiceLibrary";
import AdminSettings from "./pages/admin/AdminSettings";
import DeploymentChecklist from "./pages/admin/DeploymentChecklist";
import Agents from "./pages/dashboard/Agents";
import Campaigns from "./pages/dashboard/Campaigns";
import CampaignDetail from "./pages/dashboard/CampaignDetail";
import Leads from "./pages/dashboard/Leads";
import DashboardIntegrations from "./pages/dashboard/DashboardIntegrations";
import LiveDashboard from "./pages/dashboard/LiveDashboard";
import Settings from "./pages/dashboard/Settings";
import CallLogs from "./pages/dashboard/CallLogs";
import Billing from "./pages/dashboard/Billing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle subdomain-based routing
const SubdomainRouter = ({ children }: { children: React.ReactNode }) => {
  useSubdomainRedirect();
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <BrandingProvider>
              <TooltipProvider>
                <SubdomainRouter>
                  <ImpersonationBanner />
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Onboarding route */}
                    <Route path="/onboarding" element={<Onboarding />} />
                    
                    {/* SuperAdmin routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/organizations" element={<AdminOrganizations />} />
                    <Route path="/admin/voices" element={<AdminVoiceLibrary />} />
                    <Route path="/admin/billing" element={<AdminBilling />} />
                    <Route path="/admin/provisioning" element={<AdminProvisioning />} />
                    <Route path="/admin/branding" element={<AdminBranding />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/deployment" element={<DeploymentChecklist />} />
                  
                  {/* Protected dashboard routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/agents" element={
                    <ProtectedRoute>
                      <Agents />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/campaigns" element={
                    <ProtectedRoute>
                      <Campaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/campaigns/:id" element={
                    <ProtectedRoute>
                      <CampaignDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/leads" element={
                    <ProtectedRoute>
                      <Leads />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/integrations" element={
                    <ProtectedRoute>
                      <DashboardIntegrations />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/live" element={
                    <ProtectedRoute>
                      <LiveDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/calls" element={
                    <ProtectedRoute>
                      <CallLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/billing" element={
                    <ProtectedRoute>
                      <Billing />
                    </ProtectedRoute>
                  } />
                  
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SubdomainRouter>
              </TooltipProvider>
            </BrandingProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
