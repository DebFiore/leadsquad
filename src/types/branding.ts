export interface OrganizationBranding {
  id: string;
  organization_id: string;
  logo_url: string | null;
  primary_color: string; // HSL format: "27 92% 53%"
  secondary_color: string | null;
  company_name: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandingContextType {
  branding: OrganizationBranding | null;
  isLoading: boolean;
  updateBranding: (updates: Partial<OrganizationBranding>) => Promise<void>;
  applyBranding: (branding: OrganizationBranding) => void;
  resetBranding: () => void;
}

// Default LeadSquad branding
export const DEFAULT_BRANDING: Omit<OrganizationBranding, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
  logo_url: null,
  primary_color: '27 92% 53%', // LeadSquad orange
  secondary_color: '201 100% 78%', // LeadSquad sky blue
  company_name: 'LeadSquad',
  favicon_url: null,
};
