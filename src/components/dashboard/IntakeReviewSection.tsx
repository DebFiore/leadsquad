import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Pencil, Save, X, ChevronDown, Building2, Users, Calendar, DollarSign, Shield, Plug } from 'lucide-react';
import { intakeService } from '@/services/intakeService';
import { ClientIntakeResponse } from '@/types/database';
import { toast } from 'sonner';

interface IntakeReviewSectionProps {
  organizationId: string;
}

interface IntakeField {
  key: keyof ClientIntakeResponse;
  label: string;
  type: 'text' | 'textarea';
}

interface IntakeSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: IntakeField[];
}

const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: 'business',
    title: 'Business Details',
    icon: <Building2 className="h-4 w-4" />,
    fields: [
      { key: 'business_name', label: 'Business Name', type: 'text' },
      { key: 'business_address', label: 'Street Address', type: 'text' },
      { key: 'business_city', label: 'City', type: 'text' },
      { key: 'business_state', label: 'State', type: 'text' },
      { key: 'business_zip', label: 'ZIP Code', type: 'text' },
      { key: 'business_phone', label: 'Phone', type: 'text' },
      { key: 'business_website', label: 'Website', type: 'text' },
      { key: 'hours_of_operation', label: 'Hours of Operation', type: 'textarea' },
      { key: 'business_coverage', label: 'Service Area', type: 'text' },
      { key: 'business_type', label: 'Business Type', type: 'text' },
      { key: 'services_offered', label: 'Services Offered', type: 'textarea' },
    ],
  },
  {
    id: 'brand',
    title: 'Brand Voice & Personality',
    icon: <Users className="h-4 w-4" />,
    fields: [
      { key: 'communication_style', label: 'Communication Style', type: 'text' },
      { key: 'words_to_use', label: 'Words to Use', type: 'textarea' },
      { key: 'words_to_avoid', label: 'Words to Avoid', type: 'textarea' },
      { key: 'ideal_customer_tone', label: 'Ideal Customer Tone', type: 'text' },
    ],
  },
  {
    id: 'customer',
    title: 'Customer Journey',
    icon: <Users className="h-4 w-4" />,
    fields: [
      { key: 'customer_problems', label: 'Customer Problems', type: 'textarea' },
      { key: 'frequent_questions', label: 'Frequent Questions', type: 'textarea' },
      { key: 'common_objections', label: 'Common Objections', type: 'textarea' },
      { key: 'caller_decision_stage', label: 'Caller Decision Stage', type: 'text' },
    ],
  },
  {
    id: 'leads',
    title: 'Lead Handling',
    icon: <Users className="h-4 w-4" />,
    fields: [
      { key: 'essential_info_to_collect', label: 'Info to Collect', type: 'textarea' },
      { key: 'hot_lead_criteria', label: 'Hot Lead Criteria', type: 'textarea' },
      { key: 'nurturing_signals', label: 'Nurturing Signals', type: 'textarea' },
      { key: 'qualifying_questions', label: 'Qualifying Questions', type: 'textarea' },
      { key: 'escalation_situations', label: 'Escalation Situations', type: 'textarea' },
    ],
  },
  {
    id: 'scheduling',
    title: 'Scheduling & Calendar',
    icon: <Calendar className="h-4 w-4" />,
    fields: [
      { key: 'booking_process', label: 'Booking Process', type: 'textarea' },
      { key: 'scheduling_window', label: 'Scheduling Window', type: 'text' },
      { key: 'appointment_durations', label: 'Appointment Durations', type: 'text' },
      { key: 'blackout_dates', label: 'Blackout Dates', type: 'text' },
      { key: 'calendar_integration', label: 'Calendar Integration', type: 'text' },
      { key: 'calendar_name', label: 'Calendar Name', type: 'text' },
      { key: 'calendar_api', label: 'Calendar API', type: 'text' },
    ],
  },
  {
    id: 'pricing',
    title: 'Pricing & Offers',
    icon: <DollarSign className="h-4 w-4" />,
    fields: [
      { key: 'pricing_discussion_approach', label: 'Pricing Discussion', type: 'textarea' },
      { key: 'special_offers_frequency', label: 'Special Offers Frequency', type: 'text' },
      { key: 'first_time_discount', label: 'First Time Discount', type: 'text' },
      { key: 'first_time_discount_description', label: 'Discount Description', type: 'textarea' },
      { key: 'financing_available', label: 'Financing Available', type: 'text' },
      { key: 'financing_options', label: 'Financing Options', type: 'textarea' },
      { key: 'current_promotions', label: 'Current Promotions', type: 'textarea' },
      { key: 'consultation_triggers', label: 'Consultation Triggers', type: 'textarea' },
    ],
  },
  {
    id: 'competition',
    title: 'Competition & Differentiation',
    icon: <Shield className="h-4 w-4" />,
    fields: [
      { key: 'main_competitors', label: 'Main Competitors', type: 'textarea' },
      { key: 'differentiators', label: 'Differentiators', type: 'textarea' },
      { key: 'unique_selling_propositions', label: 'USPs', type: 'textarea' },
      { key: 'awards_certifications', label: 'Awards & Certifications', type: 'textarea' },
    ],
  },
  {
    id: 'objections',
    title: 'Objection Handling',
    icon: <Shield className="h-4 w-4" />,
    fields: [
      { key: 'reasons_people_dont_book', label: 'Reasons People Don\'t Book', type: 'textarea' },
      { key: 'price_objection_handling', label: 'Price Objection Handling', type: 'textarea' },
      { key: 'has_warranty', label: 'Has Warranty', type: 'text' },
      { key: 'warranty_guarantee_messaging', label: 'Warranty Messaging', type: 'textarea' },
      { key: 'trust_building_elements', label: 'Trust Building Elements', type: 'textarea' },
    ],
  },
  {
    id: 'outcomes',
    title: 'Conversation Outcomes',
    icon: <Users className="h-4 w-4" />,
    fields: [
      { key: 'primary_goal', label: 'Primary Goal', type: 'text' },
      { key: 'followup_process', label: 'Follow-up Process', type: 'textarea' },
      { key: 'lead_notification_recipients', label: 'Notification Recipients', type: 'textarea' },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Limitations',
    icon: <Shield className="h-4 w-4" />,
    fields: [
      { key: 'regulatory_requirements', label: 'Regulatory Requirements', type: 'textarea' },
      { key: 'agent_limitations', label: 'Agent Limitations', type: 'textarea' },
      { key: 'required_disclosures', label: 'Required Disclosures', type: 'textarea' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: <Plug className="h-4 w-4" />,
    fields: [
      { key: 'crm_system', label: 'CRM System', type: 'text' },
      { key: 'lead_tagging', label: 'Lead Tagging', type: 'text' },
      { key: 'booking_system_fields', label: 'Booking System Fields', type: 'textarea' },
      { key: 'other_integrations', label: 'Other Integrations', type: 'textarea' },
    ],
  },
];

export function IntakeReviewSection({ organizationId }: IntakeReviewSectionProps) {
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadIntake() {
      try {
        const data = await intakeService.getIntakeByOrganization(organizationId);
        setIntake(data);
      } catch (error) {
        console.error('Failed to load intake:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (organizationId) {
      loadIntake();
    }
  }, [organizationId]);

  const handleEdit = (sectionId: string) => {
    if (!intake) return;
    
    const section = INTAKE_SECTIONS.find(s => s.id === sectionId);
    if (!section) return;

    const values: Record<string, string> = {};
    for (const field of section.fields) {
      values[field.key] = (intake[field.key] as string) || '';
    }
    setEditedValues(values);
    setEditingSection(sectionId);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedValues({});
  };

  const handleSave = async () => {
    if (!intake?.id) return;

    try {
      setIsSaving(true);
      const updateData: Partial<ClientIntakeResponse> = {};
      for (const [key, value] of Object.entries(editedValues)) {
        (updateData as any)[key] = value || null;
      }

      const updated = await intakeService.updateIntake(intake.id, updateData);
      setIntake(updated);
      setEditingSection(null);
      setEditedValues({});
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!intake) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No intake data found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Configuration
        </CardTitle>
        <CardDescription>
          Review and update the information used to configure your AI agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {INTAKE_SECTIONS.map((section) => {
            const isEditing = editingSection === section.id;
            const hasData = section.fields.some(f => intake[f.key]);

            return (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <div className="text-left">
                      <span className="font-medium">{section.title}</span>
                      {!hasData && (
                        <span className="ml-2 text-xs text-muted-foreground">(Not configured)</span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-11 pr-4 pb-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        {section.fields.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            {field.type === 'textarea' ? (
                              <Textarea
                                id={field.key}
                                value={editedValues[field.key] || ''}
                                onChange={(e) => setEditedValues(prev => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))}
                                rows={3}
                                className="bg-muted"
                              />
                            ) : (
                              <Input
                                id={field.key}
                                value={editedValues[field.key] || ''}
                                onChange={(e) => setEditedValues(prev => ({
                                  ...prev,
                                  [field.key]: e.target.value,
                                }))}
                                className="bg-muted"
                              />
                            )}
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleSave} disabled={isSaving} size="sm">
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancel} size="sm" disabled={isSaving}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.fields.map((field) => {
                          const value = intake[field.key] as string;
                          if (!value) return null;
                          return (
                            <div key={field.key}>
                              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {field.label}
                              </dt>
                              <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                                {value}
                              </dd>
                            </div>
                          );
                        })}
                        {!hasData && (
                          <p className="text-sm text-muted-foreground italic">
                            No data configured for this section
                          </p>
                        )}
                        <div className="pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(section.id)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Section
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
