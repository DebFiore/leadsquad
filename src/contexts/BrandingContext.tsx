import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { OrganizationBranding, BrandingContextType, DEFAULT_BRANDING } from '@/types/branding';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<OrganizationBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply branding to CSS variables
  const applyBranding = useCallback((brandingData: OrganizationBranding) => {
    const root = document.documentElement;
    
    if (brandingData.primary_color) {
      root.style.setProperty('--primary', brandingData.primary_color);
      root.style.setProperty('--ring', brandingData.primary_color);
      root.style.setProperty('--orange', brandingData.primary_color);
      root.style.setProperty('--sidebar-primary', brandingData.primary_color);
      root.style.setProperty('--sidebar-ring', brandingData.primary_color);
    }
    
    if (brandingData.secondary_color) {
      root.style.setProperty('--secondary', brandingData.secondary_color);
      root.style.setProperty('--accent', brandingData.secondary_color);
      root.style.setProperty('--sky', brandingData.secondary_color);
    }

    // Update favicon if provided
    if (brandingData.favicon_url) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = brandingData.favicon_url;
      }
    }

    // Update document title if company name is provided
    if (brandingData.company_name) {
      document.title = `${brandingData.company_name} Dashboard`;
    }
  }, []);

  // Reset branding to defaults
  const resetBranding = useCallback(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', DEFAULT_BRANDING.primary_color);
    root.style.setProperty('--ring', DEFAULT_BRANDING.primary_color);
    root.style.setProperty('--orange', DEFAULT_BRANDING.primary_color);
    root.style.setProperty('--sidebar-primary', DEFAULT_BRANDING.primary_color);
    root.style.setProperty('--sidebar-ring', DEFAULT_BRANDING.primary_color);
    
    if (DEFAULT_BRANDING.secondary_color) {
      root.style.setProperty('--secondary', DEFAULT_BRANDING.secondary_color);
      root.style.setProperty('--accent', DEFAULT_BRANDING.secondary_color);
      root.style.setProperty('--sky', DEFAULT_BRANDING.secondary_color);
    }

    document.title = 'LeadSquad Dashboard';
  }, []);

  // Fetch branding for the user's organization
  useEffect(() => {
    const fetchBranding = async () => {
      if (!user) {
        setIsLoading(false);
        resetBranding();
        return;
      }

      try {
        // First get the user's organization
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!orgMember) {
          setIsLoading(false);
          return;
        }

        // Fetch branding for this organization
        const { data: brandingData, error } = await supabase
          .from('organization_branding')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching branding:', error);
        }

        if (brandingData) {
          setBranding(brandingData);
          applyBranding(brandingData);
        }
      } catch (error) {
        console.error('Failed to fetch branding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranding();
  }, [user, applyBranding, resetBranding]);

  // Update branding
  const updateBranding = async (updates: Partial<OrganizationBranding>) => {
    if (!branding?.id) return;

    const { error } = await supabase
      .from('organization_branding')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', branding.id);

    if (error) {
      throw error;
    }

    const updatedBranding = { ...branding, ...updates };
    setBranding(updatedBranding);
    applyBranding(updatedBranding);
  };

  return (
    <BrandingContext.Provider value={{
      branding,
      isLoading,
      updateBranding,
      applyBranding,
      resetBranding,
    }}>
      {children}
    </BrandingContext.Provider>
  );
};
