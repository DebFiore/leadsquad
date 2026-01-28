import { supabase } from '@/lib/supabase';

export interface QuestionnaireRow {
  id: number;
  section: string | null;
  question: string | null;
  answer_options: string | null;
  answer_options_1: string | null;
  answer_options_2: string | null;
  field_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParsedQuestion {
  id: string;
  section: string;
  question: string;
  fieldType: 'text' | 'textarea' | 'dropdown' | 'multiselect' | 'phone' | 'url' | 'state' | 'zip' | 'hours' | 'coverage';
  options?: string[];
  isRequired: boolean;
  placeholder?: string;
  answerKey: string; // Maps to client_intake_responses column
}

// Questions that should allow multiple selections
const MULTI_SELECT_QUESTIONS = [
  "What's your booking process?",
];

export interface ParsedSection {
  name: string;
  questions: ParsedQuestion[];
}

// Map questions to client_intake_responses columns
const questionToColumnMap: Record<string, string> = {
  'Name of Business': 'business_name',
  'Street Address': 'business_address',
  'City': 'business_city',
  'State': 'business_state',
  'Zip': 'business_zip',
  'Business Phone Number': 'business_phone',
  'Business Website': 'business_website',
  'Hours of Operation': 'hours_of_operation',
  'Business Coverage': 'business_coverage',
  'Type of Business': 'business_type',
  'Services Offered': 'services_offered',
  "How would you describe your brand's communicaton style?": 'communication_style',
  'Are there specific words or phrases you always use?': 'words_to_use',
  'Are there specific words or phrases you avoid?': 'words_to_avoid',
  'What tone resonates with your ideal customer?': 'ideal_customer_tone',
  'What problems do customers typically have when they first contact you?': 'customer_problems',
  'What questions do prospects ask most frequently?': 'frequent_questions',
  'What objections do you commonly hear?': 'common_objections',
  'What stage in their decision process are most callers?': 'caller_decision_stage',
  'What information is essential to collect from every caller?': 'essential_info_to_collect',
  'What qualifies as a "hot lead" ?': 'hot_lead_criteria',
  'What signals a caller that needs nurturing?': 'nurturing_signals',
  'Are there specific qualifying questions that determine next steps?': 'qualifying_questions',
  'What situations require immediate human escalation?': 'escalation_situations',
  "What's your booking process?": 'booking_process',
  'How far out can appointments be scheduled?': 'scheduling_window',
  'Average appointment duration by service type?': 'appointment_durations',
  'Any blackout dates or seasonal considerations?': 'blackout_dates',
  'Name of Scheduling Calendar': 'calendar_name',
  'Scheduling Calendar API (if known)': 'calendar_api',
  'How do you typically discuss pricing?': 'pricing_discussion_approach',
  'How often do you run special offers or promotions?': 'special_offers_frequency',
  'Do you offer a first-time appointment discount?': 'first_time_discount',
  'If you offer a first-time appointment discount, describe offer.': 'first_time_discount_description',
  'Are there financing options available?': 'financing_available',
  'If you offer financing options, describe options.': 'financing_options',
  'What triggers a free consultation versus a paid service call?': 'consultation_triggers',
  'Who are your main competitors?': 'main_competitors',
  'What makes you different/better?': 'differentiators',
  'What are your unique selling propositions?': 'unique_selling_propositions',
  'Do you have any awards, certifications or credentials to mention?': 'awards_certifications',
  "Common reasons people don't schedule an appointment?": 'reasons_people_dont_book',
  'How do you currently overcome price objections?': 'price_objection_handling',
  'Do you offer a warranty or quarantee?': 'has_warranty',
  'If you offer a warranty or guarantee, describe offer.': 'warranty_guarantee_messaging',
  'What trust-building elements should your agent call-out? (years in business, reviews, insurance, licensed, bonded, education, certifications, etc.)': 'trust_building_elements',
  'What is the primary goal?': 'primary_goal',
  "What's your follow-up process if they don't book immediately?": 'followup_process',
  'Who should receive lead notification and how quickly?': 'lead_notification_recipients',
  'Any regulatory requirements for your industry?': 'regulatory_requirements',
  'What can the agent NOT promise or guarantee?': 'agent_limitations',
  'Required disclosures or disclaimers?': 'required_disclosures',
  'Provide CRM System Details?': 'crm_system',
  'How should leads be tagged and categorized?': 'lead_tagging',
  'Are there required fields for your booking systems?': 'booking_system_fields',
  'Any other tools that need to connected?': 'other_integrations',
};

function getFieldType(fieldTypeStr: string | null): ParsedQuestion['fieldType'] {
  if (!fieldTypeStr) return 'text';
  
  const ft = fieldTypeStr.toLowerCase();
  
  if (ft.includes('large text') || ft.includes('textarea')) return 'textarea';
  // Check specific types BEFORE generic dropdown
  if (ft.includes('state') && (ft.includes('2 character') || ft.includes('abbreviation'))) return 'state';
  if (ft.includes('numerical 5') || ft.includes('zip')) return 'zip';
  if (ft.includes('table - 7 days')) return 'hours';
  if (ft.includes('phone')) return 'phone';
  if (ft.includes('https')) return 'url';
  // Generic dropdown check last
  if (ft.includes('dropdown')) return 'dropdown';
  
  return 'text';
}

function getAnswerKey(question: string): string {
  return questionToColumnMap[question] || question.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50);
}

export const questionnaireService = {
  async fetchQuestions(): Promise<QuestionnaireRow[]> {
    const { data, error } = await supabase
      .from('client_onboarding_questionnaire')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching questionnaire:', error);
      throw error;
    }

    return data || [];
  },

  parseQuestionsIntoSections(rows: QuestionnaireRow[]): ParsedSection[] {
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    let currentQuestion: ParsedQuestion | null = null;
    let dropdownOptions: string[] = [];
    let questionCounter = 0;

    for (const row of rows) {
      // New section header
      if (row.section && !row.question && !row.answer_options) {
        if (currentQuestion && currentSection) {
          if (dropdownOptions.length > 0) {
            currentQuestion.options = [...dropdownOptions];
          }
          currentSection.questions.push(currentQuestion);
          dropdownOptions = [];
        }
        currentQuestion = null;
        
        if (currentSection && currentSection.questions.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { name: row.section, questions: [] };
        continue;
      }

      // New question
      if (row.question) {
        // Save previous question
        if (currentQuestion && currentSection) {
          if (dropdownOptions.length > 0) {
            currentQuestion.options = [...dropdownOptions];
          }
          currentSection.questions.push(currentQuestion);
          dropdownOptions = [];
        }

        questionCounter++;
        const fieldType = getFieldType(row.field_type);
        
        currentQuestion = {
          id: `q_${questionCounter}`,
          section: currentSection?.name || 'General',
          question: row.question,
          fieldType: MULTI_SELECT_QUESTIONS.includes(row.question) ? 'multiselect' : fieldType,
          isRequired: row.question.includes('*') || ['business_name', 'services_offered'].includes(getAnswerKey(row.question)),
          answerKey: getAnswerKey(row.question),
        };

        // Handle special question types
        if (row.question === 'Hours of Operation') {
          currentQuestion.fieldType = 'hours';
        } else if (row.question === 'Business Coverage') {
          currentQuestion.fieldType = 'coverage';
        }
        
        continue;
      }

      // Dropdown option (answer_options without a question, and no field_type)
      if (row.answer_options && !row.question && !row.field_type) {
        dropdownOptions.push(row.answer_options);
        continue;
      }

      // Sub-field of a compound question (like Address sub-fields)
      // Only process if it's NOT part of Hours of Operation (which has its own special handling)
      if (row.answer_options && row.field_type && !row.field_type.toLowerCase().includes('table - 7 days')) {
        // This is a sub-field like Street Address, City, State, Zip
        questionCounter++;
        const subFieldType = getFieldType(row.field_type);
        const subQuestion: ParsedQuestion = {
          id: `q_${questionCounter}`,
          section: currentSection?.name || 'General',
          question: row.answer_options,
          fieldType: subFieldType,
          isRequired: false,
          answerKey: getAnswerKey(row.answer_options),
        };
        
        if (currentSection) {
          currentSection.questions.push(subQuestion);
        }
        // Keep currentQuestion intact for parent context
        continue;
      }
    }

    // Don't forget the last question and section
    if (currentQuestion && currentSection) {
      if (dropdownOptions.length > 0) {
        currentQuestion.options = [...dropdownOptions];
      }
      currentSection.questions.push(currentQuestion);
    }
    if (currentSection && currentSection.questions.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  },

  flattenToQuestions(sections: ParsedSection[]): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    const seenAnswerKeys = new Set<string>();
    
    for (const section of sections) {
      for (const question of section.questions) {
        // Skip compound parent questions and irrelevant questions
        if (['Hours of Operation', 'Business Address', 'Business Coverage', 'National'].includes(question.question)) {
          continue;
        }
        
        // Skip duplicate questions based on answerKey (prevents duplicate City, etc.)
        if (seenAnswerKeys.has(question.answerKey)) {
          continue;
        }
        seenAnswerKeys.add(question.answerKey);
        
        questions.push({
          ...question,
          section: section.name,
        });
      }
    }
    
    return questions;
  }
};
