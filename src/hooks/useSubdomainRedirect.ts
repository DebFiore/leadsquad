import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Detects subdomain and enforces correct routing:
 * - app.leadsquad.ai → only /dashboard/* routes allowed
 * - admin.leadsquad.ai → only /admin/* routes allowed
 * 
 * This prevents cross-subdomain route access within the SPA.
 */
export const useSubdomainRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    const path = location.pathname;

    // app.leadsquad.ai - Client portal
    if (hostname === "app.leadsquad.ai") {
      // Redirect root to dashboard
      if (path === "/") {
        navigate("/dashboard", { replace: true });
        return;
      }
      // Block admin routes on app subdomain
      if (path.startsWith("/admin")) {
        navigate("/dashboard", { replace: true });
        return;
      }
    }
    
    // admin.leadsquad.ai - Agency admin portal
    if (hostname === "admin.leadsquad.ai") {
      // Redirect root to admin
      if (path === "/") {
        navigate("/admin", { replace: true });
        return;
      }
      // Block client dashboard routes on admin subdomain
      if (path.startsWith("/dashboard")) {
        navigate("/admin", { replace: true });
        return;
      }
      // Block onboarding on admin subdomain
      if (path === "/onboarding") {
        navigate("/admin", { replace: true });
        return;
      }
    }
  }, [location.pathname, navigate]);
};
