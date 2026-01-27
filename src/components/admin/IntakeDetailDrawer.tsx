import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MessageSquare, 
  Users, 
  Target, 
  TrendingUp,
  Calendar,
  Globe,
  FileText,
  DollarSign,
  Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface IntakeDetailDrawerProps {
  organizationId: string | null;
  organizationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface IntakeData {
  id: string;
  organization_id: string;
  current_step: number;
  is_complete: boolean;
  
  // Business Basics
  business_name: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  hours_of_operation: string | null;
  business_coverage: string | null;
  business_type: string | null;
  services_offered: string | null;
  
  // Brand Voice
  communication_style: string | null;
  words_to_use: string | null;
  words_to_avoid: string | null;
  ideal_customer_tone: string | null;
  
  // Customer Understanding
  customer_problems: string | null;
  frequent_questions: string | null;
  common_objections: string | null;
  caller_decision_stage: string | null;
  
  // Lead Qualification
  essential_info_to_collect: string | null;
  hot_lead_criteria: string | null;
  qualifying_questions: string | null;
  escalation_situations: string | null;
  
  // Booking & Scheduling
  booking_process: string | null;
  scheduling_window: string | null;
  appointment_durations: string | null;
  blackout_dates: string | null;
  calendar_integration: string | null;
  
  // Pricing & Offers
  pricing_discussion_approach: string | null;
  current_promotions: string | null;
  financing_options: string | null;
  consultation_triggers: string | null;
  
  // Competition
  main_competitors: string | null;
  differentiators: string | null;
  unique_selling_propositions: string | null;
  awards_certifications: string | null;
  
  // Objection Handling
  reasons_people_dont_book: string | null;
  price_objection_handling: string | null;
  warranty_guarantee_messaging: string | null;
  trust_building_elements: string | null;
  
  // Goals & Follow-up
  primary_goal: string | null;
  followup_process: string | null;
  lead_notification_recipients: string | null;
  
  // Compliance
  regulatory_requirements: string | null;
  agent_limitations: string | null;
  required_disclosures: string | null;
  
  // Integration
  crm_system: string | null;
  lead_tagging: string | null;
  booking_system_fields: string | null;
  other_integrations: string | null;
  
  created_at: string;
  updated_at: string;
}

function DataField({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{displayValue}</p>
    </div>
  );
}

function IntakeSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
        {icon}
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 pl-6">
        {children}
      </div>
    </div>
  );
}

export function IntakeDetailDrawer({ organizationId, organizationName, open, onOpenChange }: IntakeDetailDrawerProps) {
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchIntake() {
      if (!organizationId || !open) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('client_intake_responses')
          .select('*')
          .eq('organization_id', organizationId)
          .maybeSingle();
        
        if (error) throw error;
        setIntake(data);
      } catch (error) {
        console.error('Failed to fetch intake:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIntake();
  }, [organizationId, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {organizationName} - Intake Details
          </SheetTitle>
          {intake && (
            <div className="flex items-center gap-2">
              <Badge variant={intake.is_complete ? 'default' : 'secondary'}>
                {intake.is_complete ? 'Complete' : `Step ${intake.current_step}/4`}
              </Badge>
            </div>
          )}
        </SheetHeader>

        <Tabs defaultValue="intake" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="intake">Intake Data</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(intake, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="intake" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !intake ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No intake data available yet</p>
            <p className="text-sm">The client hasn't completed onboarding</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
              {/* Section 1: Business Basics */}
              <IntakeSection title="Business Basics" icon={<Building2 className="h-4 w-4" />}>
                <DataField label="Business Name" value={intake.business_name} />
                <DataField label="Business Type" value={intake.business_type} />
                <DataField label="Address" value={intake.business_address} />
                <DataField label="City" value={intake.business_city} />
                <DataField label="State" value={intake.business_state} />
                <DataField label="ZIP" value={intake.business_zip} />
                <DataField label="Hours" value={intake.hours_of_operation} />
                <DataField label="Services" value={intake.services_offered} />
                <DataField label="Coverage Area" value={intake.business_coverage} />
              </IntakeSection>

              <Separator />

              {/* Section 2: Brand Voice */}
              <IntakeSection title="Brand Voice" icon={<MessageSquare className="h-4 w-4" />}>
                <DataField label="Communication Style" value={intake.communication_style} />
                <DataField label="Ideal Customer Tone" value={intake.ideal_customer_tone} />
                <DataField label="Words to Use" value={intake.words_to_use} />
                <DataField label="Words to Avoid" value={intake.words_to_avoid} />
              </IntakeSection>

              <Separator />

              {/* Section 3: Customer Understanding */}
              <IntakeSection title="Customer Understanding" icon={<Users className="h-4 w-4" />}>
                <DataField label="Customer Problems" value={intake.customer_problems} />
                <DataField label="Frequent Questions" value={intake.frequent_questions} />
                <DataField label="Common Objections" value={intake.common_objections} />
                <DataField label="Caller Decision Stage" value={intake.caller_decision_stage} />
              </IntakeSection>

              <Separator />

              {/* Section 4: Lead Qualification */}
              <IntakeSection title="Lead Qualification" icon={<Target className="h-4 w-4" />}>
                <DataField label="Essential Info to Collect" value={intake.essential_info_to_collect} />
                <DataField label="Hot Lead Criteria" value={intake.hot_lead_criteria} />
                <DataField label="Qualifying Questions" value={intake.qualifying_questions} />
                <DataField label="Escalation Situations" value={intake.escalation_situations} />
              </IntakeSection>

              <Separator />

              {/* Section 5: Booking & Scheduling */}
              <IntakeSection title="Booking & Scheduling" icon={<Calendar className="h-4 w-4" />}>
                <DataField label="Booking Process" value={intake.booking_process} />
                <DataField label="Scheduling Window" value={intake.scheduling_window} />
                <DataField label="Appointment Durations" value={intake.appointment_durations} />
                <DataField label="Blackout Dates" value={intake.blackout_dates} />
                <DataField label="Calendar Integration" value={intake.calendar_integration} />
              </IntakeSection>

              <Separator />

              {/* Section 6: Pricing & Offers */}
              <IntakeSection title="Pricing & Offers" icon={<DollarSign className="h-4 w-4" />}>
                <DataField label="Pricing Approach" value={intake.pricing_discussion_approach} />
                <DataField label="Current Promotions" value={intake.current_promotions} />
                <DataField label="Financing Options" value={intake.financing_options} />
                <DataField label="Consultation Triggers" value={intake.consultation_triggers} />
              </IntakeSection>

              <Separator />

              {/* Section 7: Competition */}
              <IntakeSection title="Competition & Differentiation" icon={<TrendingUp className="h-4 w-4" />}>
                <DataField label="Main Competitors" value={intake.main_competitors} />
                <DataField label="Differentiators" value={intake.differentiators} />
                <DataField label="USPs" value={intake.unique_selling_propositions} />
                <DataField label="Awards & Certifications" value={intake.awards_certifications} />
              </IntakeSection>

              <Separator />

              {/* Section 8: Objection Handling */}
              <IntakeSection title="Objection Handling" icon={<Shield className="h-4 w-4" />}>
                <DataField label="Reasons People Don't Book" value={intake.reasons_people_dont_book} />
                <DataField label="Price Objection Handling" value={intake.price_objection_handling} />
                <DataField label="Warranty/Guarantee Messaging" value={intake.warranty_guarantee_messaging} />
                <DataField label="Trust Building Elements" value={intake.trust_building_elements} />
              </IntakeSection>

              <Separator />

              {/* Section 9: Goals & Follow-up */}
              <IntakeSection title="Goals & Follow-up" icon={<Target className="h-4 w-4" />}>
                <DataField label="Primary Goal" value={intake.primary_goal} />
                <DataField label="Follow-up Process" value={intake.followup_process} />
                <DataField label="Lead Notification Recipients" value={intake.lead_notification_recipients} />
              </IntakeSection>

              <Separator />

              {/* Section 10: Compliance */}
              <IntakeSection title="Compliance & Limitations" icon={<Shield className="h-4 w-4" />}>
                <DataField label="Regulatory Requirements" value={intake.regulatory_requirements} />
                <DataField label="Agent Limitations" value={intake.agent_limitations} />
                <DataField label="Required Disclosures" value={intake.required_disclosures} />
              </IntakeSection>

              <Separator />

              {/* Section 11: Integration */}
              <IntakeSection title="CRM & Integration" icon={<Globe className="h-4 w-4" />}>
                <DataField label="CRM System" value={intake.crm_system} />
                <DataField label="Lead Tagging" value={intake.lead_tagging} />
                <DataField label="Booking System Fields" value={intake.booking_system_fields} />
                <DataField label="Other Integrations" value={intake.other_integrations} />
              </IntakeSection>
          </div>
        )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
