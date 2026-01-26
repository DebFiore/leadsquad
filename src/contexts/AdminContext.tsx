import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { adminService } from '@/services/adminService';
import { Organization } from '@/types/database';

interface AdminContextType {
  isSuperAdmin: boolean;
  isCheckingAdmin: boolean;
  impersonatedOrg: Organization | null;
  setImpersonatedOrg: (org: Organization | null) => void;
  exitImpersonation: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [impersonatedOrg, setImpersonatedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsSuperAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const isAdmin = await adminService.isSuperAdmin(user.id);
        setIsSuperAdmin(isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    // Add a small delay to ensure auth is fully initialized
    const timer = setTimeout(() => {
      checkAdminStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  const exitImpersonation = () => {
    setImpersonatedOrg(null);
  };

  return (
    <AdminContext.Provider value={{
      isSuperAdmin,
      isCheckingAdmin,
      impersonatedOrg,
      setImpersonatedOrg,
      exitImpersonation,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
