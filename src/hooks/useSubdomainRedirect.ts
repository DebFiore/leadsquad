import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Detects subdomain and redirects to appropriate routes:
 * - app.leadsquad.ai → /dashboard (protected, will redirect to /auth if not logged in)
 * - admin.leadsquad.ai → /admin
 */
export const useSubdomainRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Only redirect from root path to avoid loops
    if (location.pathname !== "/") return;

    if (hostname === "app.leadsquad.ai") {
      navigate("/dashboard", { replace: true });
    } else if (hostname === "admin.leadsquad.ai") {
      navigate("/admin", { replace: true });
    }
  }, [location.pathname, navigate]);
};
