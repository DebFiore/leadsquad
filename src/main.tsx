import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handler to catch "operation is insecure" errors
window.addEventListener('error', (event) => {
  if (event.message?.includes('insecure') || event.message?.includes('SecurityError')) {
    console.warn('Security error caught - likely third-party storage blocked');
    event.preventDefault();
  }
});

// Perform subdomain redirect BEFORE React renders to avoid flash
const performSubdomainRedirect = () => {
  const hostname = window.location.hostname;
  const path = window.location.pathname;
  
  if (hostname === 'admin.leadsquad.ai') {
    // Admin subdomain - redirect to /admin if on wrong route
    if (path === '/' || path === '' || path.startsWith('/dashboard') || path === '/onboarding') {
      window.location.replace('/admin');
      return true; // Signal that redirect is happening
    }
    // Also redirect marketing pages
    if (!path.startsWith('/admin') && !path.startsWith('/auth')) {
      window.location.replace('/admin');
      return true;
    }
  }
  
  if (hostname === 'app.leadsquad.ai') {
    // App subdomain - redirect to /dashboard if on wrong route
    if (path === '/' || path === '' || path.startsWith('/admin')) {
      window.location.replace('/dashboard');
      return true;
    }
  }
  
  return false;
};

// Only render React if we're not redirecting
if (!performSubdomainRedirect()) {
  createRoot(document.getElementById("root")!).render(<App />);
}
