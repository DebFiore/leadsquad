-- Create the client_onboarding_questionnaire table for storing questionnaire questions
CREATE TABLE public.client_onboarding_questionnaire (
  id SERIAL PRIMARY KEY,
  section TEXT,
  question TEXT,
  answer_options TEXT,
  answer_options_1 TEXT,
  answer_options_2 TEXT,
  field_type TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_onboarding_questionnaire ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read questions (questionnaire is read-only for clients)
CREATE POLICY "Anyone can read questionnaire" 
ON public.client_onboarding_questionnaire 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_client_onboarding_questionnaire_updated_at
BEFORE UPDATE ON public.client_onboarding_questionnaire
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all the questionnaire questions
-- Business Details Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Business Details', NULL, NULL, NULL, 1),
(NULL, 'Name of Business', NULL, 'Text', 2),
(NULL, 'Street Address', NULL, 'Text', 3),
(NULL, 'City', NULL, 'Text', 4),
(NULL, 'State', NULL, 'State - 2 character abbreviation', 5),
(NULL, 'Zip', NULL, 'Numerical 5 digit', 6),
(NULL, 'Business Phone Number', NULL, 'Phone number', 7),
(NULL, 'Business Website', NULL, 'https URL', 8),
(NULL, 'Hours of Operation', NULL, 'Table - 7 Days', 9),
(NULL, 'Business Coverage', NULL, 'Large Text', 10),
(NULL, 'Type of Business', NULL, 'Text', 11),
(NULL, 'Services Offered', NULL, 'Large Text', 12);

-- Brand Voice & Personality Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Brand Voice & Personality', NULL, NULL, NULL, 20),
(NULL, 'How would you describe your brand''s communicaton style?', NULL, 'Large Text', 21),
(NULL, 'Are there specific words or phrases you always use?', NULL, 'Large Text', 22),
(NULL, 'Are there specific words or phrases you avoid?', NULL, 'Large Text', 23),
(NULL, 'What tone resonates with your ideal customer?', NULL, 'Large Text', 24);

-- Customer Journey & Pain Points Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Customer Journey & Pain Points', NULL, NULL, NULL, 30),
(NULL, 'What problems do customers typically have when they first contact you?', NULL, 'Large Text', 31),
(NULL, 'What questions do prospects ask most frequently?', NULL, 'Large Text', 32),
(NULL, 'What objections do you commonly hear?', NULL, 'Large Text', 33),
(NULL, 'What stage in their decision process are most callers?', NULL, 'Large Text', 34);

-- Call Handling Priorities Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Call Handling Priorities', NULL, NULL, NULL, 40),
(NULL, 'What information is essential to collect from every caller?', NULL, 'Large Text', 41),
(NULL, 'What qualifies as a "hot lead" ?', NULL, 'Large Text', 42),
(NULL, 'What signals a caller that needs nurturing?', NULL, 'Large Text', 43),
(NULL, 'Are there specific qualifying questions that determine next steps?', NULL, 'Large Text', 44),
(NULL, 'What situations require immediate human escalation?', NULL, 'Large Text', 45);

-- Scheduling and Process Details Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Scheduling and Process Details', NULL, NULL, NULL, 50),
(NULL, 'What''s your booking process?', NULL, 'Dropdown', 51),
(NULL, 'Schedule right on the call', NULL, NULL, 52),
(NULL, 'Send booking link after', NULL, NULL, 53),
(NULL, 'Transfer to scheduler', NULL, NULL, 54),
(NULL, 'How far out can appointments be scheduled?', NULL, 'Text', 55),
(NULL, 'Average appointment duration by service type?', NULL, 'Large Text', 56),
(NULL, 'Any blackout dates or seasonal considerations?', NULL, 'Large Text', 57);

-- Calendar Integration Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Calendar Integration', NULL, NULL, NULL, 60),
(NULL, 'Name of Scheduling Calendar', NULL, 'Text', 61),
(NULL, 'Scheduling Calendar API (if known)', NULL, 'Text', 62);

-- Pricing and Offers Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Pricing and Offers', NULL, NULL, NULL, 70),
(NULL, 'How often do you run special offers or promotions?', NULL, 'Large Text', 71),
(NULL, 'Do you offer a first-time appointment discount?', NULL, 'Dropdown', 72),
(NULL, 'Yes', NULL, NULL, 73),
(NULL, 'No', NULL, NULL, 74),
(NULL, 'If you offer a first-time appointment discount, describe offer.', NULL, 'Large Text', 75),
(NULL, 'Are there financing options available?', NULL, 'Dropdown', 76),
(NULL, 'Yes', NULL, NULL, 77),
(NULL, 'No', NULL, NULL, 78),
(NULL, 'If you offer financing options, describe options.', NULL, 'Large Text', 79),
(NULL, 'What triggers a free consultation versus a paid service call?', NULL, 'Large Text', 80);

-- Competition & Differentiation Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Competition & Differentiation', NULL, NULL, NULL, 90),
(NULL, 'Who are your main competitors?', NULL, 'Large Text', 91),
(NULL, 'What makes you different/better?', NULL, 'Large Text', 92),
(NULL, 'What are your unique selling propositions?', NULL, 'Large Text', 93),
(NULL, 'Do you have any awards, certifications or credentials to mention?', NULL, 'Large Text', 94);

-- Objection Handling Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Objection Handling', NULL, NULL, NULL, 100),
(NULL, 'Common reasons people don''t schedule an appointment?', NULL, 'Large Text', 101),
(NULL, 'How do you currently overcome price objections?', NULL, 'Large Text', 102),
(NULL, 'Do you offer a warranty or quarantee?', NULL, 'Dropdown', 103),
(NULL, 'Yes', NULL, NULL, 104),
(NULL, 'No', NULL, NULL, 105),
(NULL, 'If you offer a warranty or guarantee, describe offer.', NULL, 'Large Text', 106),
(NULL, 'What trust-building elements should your agent call-out? (years in business, reviews, insurance, licensed, bonded, education, certifications, etc.)', NULL, 'Large Text', 107);

-- Conversation Outcomes Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Conversation Outcomes', NULL, NULL, NULL, 110),
(NULL, 'What is the primary goal?', NULL, 'Dropdown', 111),
(NULL, 'Book appointments', NULL, NULL, 112),
(NULL, 'Qualify leads', NULL, NULL, 113),
(NULL, 'Provide information', NULL, NULL, 114),
(NULL, 'What''s your follow-up process if they don''t book immediately?', NULL, 'Large Text', 115),
(NULL, 'Who should receive lead notification and how quickly?', NULL, 'Large Text', 116);

-- Compliance & Limitations Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Compliance & Limitations', NULL, NULL, NULL, 120),
(NULL, 'Any regulatory requirements for your industry?', NULL, 'Large Text', 121),
(NULL, 'What can the agent NOT promise or guarantee?', NULL, 'Large Text', 122),
(NULL, 'Required disclosures or disclaimers?', NULL, 'Large Text', 123);

-- Integration Requirements Section
INSERT INTO public.client_onboarding_questionnaire (section, question, answer_options, field_type, sort_order) VALUES
('Integration Requirements', NULL, NULL, NULL, 130),
(NULL, 'Provide CRM System Details?', NULL, 'Large Text', 131),
(NULL, 'How should leads be tagged and categorized?', NULL, 'Large Text', 132),
(NULL, 'Are there required fields for your booking systems?', NULL, 'Large Text', 133),
(NULL, 'Any other tools that need to connected?', NULL, 'Large Text', 134);