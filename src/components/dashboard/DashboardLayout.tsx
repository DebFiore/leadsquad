import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, organization, organizationLoading } = useAuth();
  const navigate = useNavigate();

  // Detect if we're on the admin subdomain - skip onboarding for admin portal
  const isAdminPortal = window.location.hostname === 'admin.leadsquad.ai' ||
    window.location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Redirect to full onboarding wizard if:
    // 1. User is logged in
    // 2. Organization loading is complete
    // 3. No organization exists OR organization hasn't completed onboarding
    // 4. NOT on admin subdomain
    if (!isAdminPortal && !loading && !organizationLoading && user) {
      if (organization === null || !organization.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, loading, organization, organizationLoading, isAdminPortal, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
