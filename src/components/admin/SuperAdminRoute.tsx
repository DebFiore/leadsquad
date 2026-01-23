import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface SuperAdminRouteProps {
  children: ReactNode;
}

export function SuperAdminRoute({ children }: SuperAdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, isCheckingAdmin } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || isCheckingAdmin) return;

    // Not logged in - redirect to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Not a superadmin - redirect to dashboard
    if (!isSuperAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, isSuperAdmin, isCheckingAdmin, navigate]);

  if (authLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this area.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
