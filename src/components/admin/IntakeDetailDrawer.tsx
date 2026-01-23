import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Organization, ClientIntakeResponse } from '@/types/database';
import { LeadEvent } from '@/types/agents';
import { adminService } from '@/services/adminService';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadEventsTimeline } from './LeadEventsTimeline';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  Globe, 
  Clock, 
  MapPin,
  MessageSquare,
  Users,
  Phone,
  Calendar,
  Target,
  Award,
  FileText,
  TrendingUp,
  UserCheck,
  Loader2,
  Eye,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface IntakeDetailDrawerProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationUpdate: () => void;
}

interface IntakeSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function IntakeSection({ title, icon, children }: IntakeSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h4 className="font-semibold">{title}</h4>
      </div>
      <div className="pl-6 space-y-2 text-sm">
        {children}
      </div>
    </div>
  );
}

function DataField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="text-foreground">{value || '—'}</span>
    </div>
  );
}

function ArrayField({ label, items }: { label: string; items: string[] | null }) {
  if (!items || items.length === 0) {
    return <DataField label={label} value="—" />;
  }
  return (
    <div>
      <span className="text-muted-foreground">{label}:</span>
      <ul className="list-disc list-inside ml-2 mt-1">
        {items.map((item, i) => (
          <li key={i} className="text-foreground">{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function IntakeDetailDrawer({ 
  organization, 
  open, 
  onOpenChange,
  onOrganizationUpdate,
}: IntakeDetailDrawerProps) {
  const navigate = useNavigate();
  const { setImpersonatedOrg } = useAdmin();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [eventStats, setEventStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<Organization['status']>('pending');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (organization && open) {
      setStatus(organization.status || 'pending');
      setIsActive(organization.is_active ?? true);
      loadData(organization.id);
    }
  }, [organization, open]);

  const loadData = async (orgId: string) => {
    setIsLoading(true);
    try {
      const [intakeData, eventsData, statsData] = await Promise.all([
        adminService.getIntakeByOrganization(orgId),
        adminService.getLeadEventsByOrganization(orgId),
        adminService.getEventStats(orgId),
      ]);
      setIntake(intakeData);
      setEvents(eventsData);
      setEventStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Organization['status']) => {
    if (!organization) return;
    setIsSaving(true);
    try {
      await adminService.updateOrganizationStatus(organization.id, newStatus);
      setStatus(newStatus);
      toast.success('Status updated');
      onOrganizationUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActiveToggle = async (checked: boolean) => {
    if (!organization) return;
    setIsSaving(true);
    try {
      await adminService.toggleOrganizationActive(organization.id, checked);
      setIsActive(checked);
      toast.success(checked ? 'Organization activated' : 'Organization deactivated');
      onOrganizationUpdate();
    } catch (error) {
      toast.error('Failed to toggle active state');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImpersonate = () => {
    if (!organization) return;
    setImpersonatedOrg(organization);
    onOpenChange(false);
    navigate('/dashboard');
  };

  if (!organization) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization.name}
          </SheetTitle>
          <SheetDescription>
            Review intake data and manage organization settings
          </SheetDescription>
        </SheetHeader>

        {/* Admin Actions */}
        <div className="space-y-4 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Status</Label>
              <p className="text-xs text-muted-foreground">Set the organization's approval status</p>
            </div>
            <Select 
              value={status} 
              onValueChange={(v) => handleStatusChange(v as Organization['status'])}
              disabled={isSaving}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="needs_clarification">Needs Clarification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Toggle if this organization can use the platform</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleActiveToggle}
              disabled={isSaving}
            />
          </div>

          <Button 
            onClick={handleImpersonate} 
            variant="outline" 
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Impersonate Client
          </Button>
        </div>

        {/* Tabs for Intake and Events */}
        <Tabs defaultValue="events" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Events ({eventStats.total || 0})
            </TabsTrigger>
            <TabsTrigger value="intake">
              <FileText className="h-4 w-4 mr-2" />
              Intake Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="flex-1 mt-4">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded bg-muted/50">
                <div className="text-lg font-bold text-sky-400">{eventStats.sms_sent || 0}</div>
                <div className="text-xs text-muted-foreground">SMS Sent</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/50">
                <div className="text-lg font-bold text-amber-400">{eventStats.call_attempted || 0}</div>
                <div className="text-xs text-muted-foreground">Calls</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/50">
                <div className="text-lg font-bold text-green-400">{eventStats.call_completed || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-2 rounded bg-muted/50">
                <div className="text-lg font-bold text-primary">{eventStats.appointment_set || 0}</div>
                <div className="text-xs text-muted-foreground">Appts</div>
              </div>
            </div>
            <LeadEventsTimeline events={events} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="intake" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] -mx-6 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                <DataField label="Address" value={intake.business_address} />
                <DataField label="Website" value={intake.business_website} />
                <DataField label="Hours" value={intake.business_hours} />
                <ArrayField label="Services" items={intake.services} />
                <DataField label="Geographic Area" value={intake.geographic_area} />
                <DataField label="Years in Business" value={intake.years_in_business} />
                <DataField label="Licensed & Insured" value={intake.is_licensed_insured ? 'Yes' : 'No'} />
              </IntakeSection>

              <Separator />

              {/* Section 2: Brand Voice */}
              <IntakeSection title="Brand Voice" icon={<MessageSquare className="h-4 w-4" />}>
                <DataField label="Communication Style" value={intake.communication_style} />
                <DataField label="Intro Sentence" value={intake.intro_sentence} />
                <ArrayField label="Phrases to Use" items={intake.phrases_to_use} />
                <ArrayField label="Phrases to Avoid" items={intake.phrases_to_avoid} />
              </IntakeSection>

              <Separator />

              {/* Section 3: Customer Questions */}
              <IntakeSection title="Customer Questions & Objections" icon={<Users className="h-4 w-4" />}>
                <ArrayField label="Top Questions" items={intake.top_customer_questions} />
                <ArrayField label="Common Objections" items={intake.common_objections} />
              </IntakeSection>

              <Separator />

              {/* Section 4: Call Flow */}
              <IntakeSection title="Call Flow" icon={<Phone className="h-4 w-4" />}>
                <ArrayField label="Info to Collect" items={intake.info_to_collect} />
                <DataField label="Transfer Protocols" value={intake.transfer_protocols} />
                <DataField label="Pricing Strategy" value={intake.pricing_strategy} />
                <DataField label="Pricing Details" value={intake.pricing_details} />
              </IntakeSection>

              <Separator />

              {/* Section 5: Ideal Customer */}
              <IntakeSection title="Ideal Customer Profile" icon={<UserCheck className="h-4 w-4" />}>
                <DataField label="Description" value={intake.ideal_customer_description} />
                <ArrayField label="Pain Points" items={intake.customer_pain_points} />
              </IntakeSection>

              <Separator />

              {/* Section 6: Competition */}
              <IntakeSection title="Competitive Landscape" icon={<Target className="h-4 w-4" />}>
                <ArrayField label="Main Competitors" items={intake.main_competitors} />
                <ArrayField label="Competitive Advantages" items={intake.competitive_advantages} />
              </IntakeSection>

              <Separator />

              {/* Section 7: USPs */}
              <IntakeSection title="USPs & Credentials" icon={<Award className="h-4 w-4" />}>
                <ArrayField label="Unique Selling Points" items={intake.unique_selling_points} />
                <ArrayField label="Trust Factors" items={intake.trust_factors} />
              </IntakeSection>

              <Separator />

              {/* Section 8: Lead Qualification */}
              <IntakeSection title="Lead Qualification" icon={<TrendingUp className="h-4 w-4" />}>
                <ArrayField label="Qualification Criteria" items={intake.qualification_criteria} />
                <ArrayField label="Disqualification Criteria" items={intake.disqualification_criteria} />
                <DataField label="Scoring Notes" value={intake.lead_scoring_notes} />
              </IntakeSection>

              <Separator />

              {/* Section 9: Goals */}
              <IntakeSection title="Inbound & Outbound Goals" icon={<Target className="h-4 w-4" />}>
                <ArrayField label="Inbound Goals" items={intake.inbound_goals} />
                <ArrayField label="Outbound Goals" items={intake.outbound_goals} />
              </IntakeSection>

              <Separator />

              {/* Section 10: Appointments */}
              <IntakeSection title="Appointment Setting" icon={<Calendar className="h-4 w-4" />}>
                <ArrayField label="Appointment Types" items={intake.appointment_types} />
                <DataField label="Duration" value={intake.appointment_duration} />
                <DataField label="Buffer Time" value={intake.appointment_buffer} />
              </IntakeSection>

              <Separator />

              {/* Section 11: Integration */}
              <IntakeSection title="CRM & Calendar" icon={<Globe className="h-4 w-4" />}>
                <DataField label="Booking Process" value={intake.booking_process} />
                <ArrayField label="Calendar Systems" items={intake.calendar_systems} />
                <DataField label="CRM System" value={intake.crm_system} />
                <DataField label="CRM Notes" value={intake.crm_integration_notes} />
              </IntakeSection>

              <Separator />

              {/* Section 12: Follow-up */}
              <IntakeSection title="Follow-up Protocols" icon={<Clock className="h-4 w-4" />}>
                <DataField label="Timing" value={intake.followup_timing} />
                <ArrayField label="Channels" items={intake.followup_channels} />
                <DataField label="Sequence" value={intake.followup_sequence} />
              </IntakeSection>

              <Separator />

              {/* Section 13: KPIs */}
              <IntakeSection title="Reporting & KPIs" icon={<TrendingUp className="h-4 w-4" />}>
                <ArrayField label="Key Metrics" items={intake.key_metrics} />
                <DataField label="Reporting Frequency" value={intake.reporting_frequency} />
                <DataField label="Success Criteria" value={intake.success_criteria} />
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
