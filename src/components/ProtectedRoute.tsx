import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, organization, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Not logged in - redirect to auth
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Logged in but no organization - they need to complete initial setup
    if (!organization) {
      // Allow them to stay on onboarding if that's where they're going
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
      return;
    }

    // Has organization but hasn't completed onboarding
    if (requireOnboarding && !organization.onboarding_completed) {
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding', { replace: true });
      }
      return;
    }

    // Onboarding is complete but user is on onboarding page - redirect to dashboard
    if (organization.onboarding_completed && location.pathname === '/onboarding') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, organization, loading, navigate, location.pathname, requireOnboarding]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
