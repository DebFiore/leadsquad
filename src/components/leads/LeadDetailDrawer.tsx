// src/components/leads/LeadDetailDrawer.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Phone, 
  Calendar, 
  MessageSquare,
  Save,
  Clock,
  PhoneCall,
  Loader2,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/leads';
import { Campaign } from '@/types/campaigns';
import { useUpdateLead, useUpdateLeadStatus } from '@/hooks/useLeads';
import { formatPhoneNumber } from '@/lib/phoneUtils';
import { formatDistanceToNow, format } from 'date-fns';
import { validatePhoneNumber } from '@/lib/phoneUtils';
import { callService } from '@/services/callService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const leadSchema = z.object({
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  phone_number: z.string().min(1, 'Phone number is required'),
  company: z.string().optional().nullable(),
  job_title: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Campaign[];
}

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  qualified: { label: 'Qualified', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  appointment_set: { label: 'Appointment Set', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  converted: { label: 'Converted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  not_interested: { label: 'Not Interested', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  do_not_call: { label: 'Do Not Call', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  invalid: { label: 'Invalid', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export function LeadDetailDrawer({ lead, open, onOpenChange, campaigns }: LeadDetailDrawerProps) {
  const updateLead = useUpdateLead();
  const updateStatus = useUpdateLeadStatus();
  const [activeTab, setActiveTab] = useState('details');
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const { organization } = useAuth();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      company: '',
      job_title: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone_number: lead.phone_number,
        company: lead.company,
        job_title: lead.job_title,
        notes: lead.notes,
      });
    }
  }, [lead, form]);

  const onSubmit = async (data: LeadFormData) => {
    if (!lead) return;

    const { e164 } = validatePhoneNumber(data.phone_number);
    
    updateLead.mutate({
      id: lead.id,
      data: {
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
        phone_number: e164 || data.phone_number,
        company: data.company || null,
        job_title: data.job_title || null,
        notes: data.notes || null,
      },
    });
  };

  const handleStatusChange = (status: LeadStatus) => {
    if (!lead) return;
    updateStatus.mutate({ id: lead.id, status });
  };

  const handleInitiateCall = async () => {
    if (!lead || !organization?.id) return;
    
    setIsInitiatingCall(true);
    try {
      const result = await callService.initiateCall({
        organizationId: organization.id,
        leadId: lead.id,
        campaignId: lead.campaign_id || undefined,
        phoneNumber: lead.phone_number,
      });
      
      toast.success(`Call initiated via ${result.provider}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate call');
    } finally {
      setIsInitiatingCall(false);
    }
  };

  if (!lead) return null;

  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Unknown';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{fullName}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Phone className="h-3 w-3" />
                {formatPhoneNumber(lead.phone_number)}
              </SheetDescription>
            </div>
            <Badge className={statusConfig[lead.lead_status].color}>
              {statusConfig[lead.lead_status].label}
            </Badge>
          </div>
          
          {/* Call Now Button */}
          <Button 
            onClick={handleInitiateCall}
            disabled={isInitiatingCall || lead.lead_status === 'do_not_call'}
            className="w-full"
          >
            {isInitiatingCall ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PhoneCall className="h-4 w-4 mr-2" />
            )}
            {isInitiatingCall ? 'Initiating Call...' : 'Call Now'}
          </Button>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Status Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={lead.lead_status}
                      onValueChange={(value) => handleStatusChange(value as LeadStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            value={field.value || ''}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={updateLead.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateLead.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-4">
              {/* Lead Meta Info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </span>
                  <span>{format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    Total Calls
                  </span>
                  <span>{lead.total_calls}</span>
                </div>
                {lead.last_call_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Call
                    </span>
                    <span>{formatDistanceToNow(new Date(lead.last_call_date), { addSuffix: true })}</span>
                  </div>
                )}
                {lead.lead_source && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Source</span>
                    <Badge variant="outline">{lead.lead_source}</Badge>
                  </div>
                )}
              </div>

              {/* Campaign Assignment */}
              {lead.campaign_id && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Assigned Campaign</h4>
                  <p className="text-sm text-muted-foreground">
                    {campaigns.find(c => c.id === lead.campaign_id)?.name || 'Unknown Campaign'}
                  </p>
                </div>
              )}

              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholder for call history */}
              <div className="p-4 border rounded-lg text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Call history will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
