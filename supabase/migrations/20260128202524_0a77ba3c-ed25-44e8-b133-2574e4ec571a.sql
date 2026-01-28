-- Add missing columns to client_intake_responses for the full questionnaire
ALTER TABLE public.client_intake_responses
ADD COLUMN IF NOT EXISTS business_phone text,
ADD COLUMN IF NOT EXISTS business_website text,
ADD COLUMN IF NOT EXISTS nurturing_signals text,
ADD COLUMN IF NOT EXISTS calendar_name text,
ADD COLUMN IF NOT EXISTS calendar_api text,
ADD COLUMN IF NOT EXISTS special_offers_frequency text,
ADD COLUMN IF NOT EXISTS first_time_discount text,
ADD COLUMN IF NOT EXISTS first_time_discount_description text,
ADD COLUMN IF NOT EXISTS financing_available text,
ADD COLUMN IF NOT EXISTS has_warranty text;