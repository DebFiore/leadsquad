export interface BillingRecord {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  
  // Wholesale costs (what we pay providers)
  wholesale_voice_minutes: number;
  wholesale_voice_cost: number;
  wholesale_sms_count: number;
  wholesale_sms_cost: number;
  wholesale_phone_numbers: number;
  wholesale_phone_cost: number;
  total_wholesale_cost: number;
  
  // Retail revenue (what client pays us)
  retail_base_fee: number;
  retail_per_minute_rate: number;
  retail_voice_revenue: number;
  retail_sms_revenue: number;
  retail_overage_revenue: number;
  total_retail_revenue: number;
  
  // Calculated
  gross_profit: number;
  profit_margin_percent: number;
  
  status: 'pending' | 'invoiced' | 'paid' | 'overdue';
  invoice_url: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface ProviderCostRates {
  provider: 'vapi' | 'retell';
  voice_per_minute: number;
  sms_per_message: number;
  phone_number_monthly: number;
}

export interface ClientPricingPlan {
  id: string;
  organization_id: string;
  plan_name: string;
  base_monthly_fee: number;
  included_minutes: number;
  overage_per_minute: number;
  sms_per_message: number;
  is_active: boolean;
  created_at: string;
}

export interface AgencyBillingSummary {
  period: string;
  total_organizations: number;
  total_wholesale_cost: number;
  total_retail_revenue: number;
  total_gross_profit: number;
  average_margin_percent: number;
  top_clients: Array<{
    organization_id: string;
    organization_name: string;
    revenue: number;
    profit: number;
  }>;
}
