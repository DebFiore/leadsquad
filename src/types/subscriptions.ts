// src/types/subscriptions.ts
// TypeScript types for subscriptions and billing

export type PlanName = 'starter' | 'professional' | 'enterprise' | 'custom';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'paused' | 'incomplete';
export type UsageProvider = 'retell' | 'vapi' | 'elevenlabs' | 'twilio';

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_name: PlanName;
  status: SubscriptionStatus;
  monthly_minutes_limit: number;
  monthly_calls_limit: number | null;
  monthly_leads_limit: number | null;
  minutes_used_current_cycle: number;
  calls_used_current_cycle: number;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingUsage {
  id: string;
  organization_id: string;
  usage_date: string;
  provider: UsageProvider;
  minutes_used: number;
  calls_made: number;
  calls_answered: number;
  sms_sent: number;
  cost_amount: number;
  created_at: string;
}
