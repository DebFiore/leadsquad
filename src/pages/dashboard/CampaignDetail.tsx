import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Play, 
  Pause, 
  Phone, 
  Users, 
  Clock, 
  Calendar,
  TrendingUp,
  Mic,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useCampaign, useUpdateCampaign, useToggleCampaignStatus } from '@/hooks/useCampaigns';
import { useLeadsByCampaign } from '@/hooks/useLeads';
import { useCallLogsByCampaign } from '@/hooks/useCallLogs';
import { VoiceSelector } from '@/components/campaigns/VoiceSelector';
import { ScriptEditor } from '@/components/campaigns/ScriptEditor';
import { CampaignSchedule } from '@/components/campaigns/CampaignSchedule';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { toast } from 'sonner';
import { CampaignStatus } from '@/types/campaigns';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  campaign_type: z.enum(['inbound', 'outbound', 'hybrid']),
  ai_script: z.string().optional().nullable(),
  ai_prompt: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  calling_hours_start: z.string(),
  calling_hours_end: z.string(),
  calling_days: z.array(z.string()),
  timezone: z.string(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

const statusColors: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-blue-500/20 text-blue-400',
  archived: 'bg-muted text-muted-foreground',
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: campaign, isLoading, error } = useCampaign(id);
  const { data: leads } = useLeadsByCampaign(id);
  const { data: callLogs } = useCallLogsByCampaign(id);
  const updateCampaign = useUpdateCampaign();
  const toggleStatus = useToggleCampaignStatus();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      campaign_type: 'outbound',
      ai_script: '',
      ai_prompt: '',
      phone_number: '',
      calling_hours_start: '09:00',
      calling_hours_end: '17:00',
      calling_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'America/New_York',
    },
  });

  // Populate form when campaign loads
  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name,
        description: campaign.description,
        campaign_type: campaign.campaign_type,
        ai_script: campaign.ai_script,
        ai_prompt: campaign.ai_prompt,
        phone_number: campaign.phone_number,
        calling_hours_start: campaign.calling_hours_start,
        calling_hours_end: campaign.calling_hours_end,
        calling_days: campaign.calling_days,
        timezone: campaign.timezone,
      });
    }
  }, [campaign, form]);

  const onSubmit = async (data: CampaignFormData) => {
    if (!id) return;
    
    updateCampaign.mutate(
      { id, data },
      {
        onSuccess: () => {
          toast.success('Campaign saved successfully');
        },
      }
    );
  };

  const handleToggleStatus = () => {
    if (!campaign) return;
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    toggleStatus.mutate({ id: campaign.id, status: newStatus });
  };

  const handleVoiceSelect = (voiceId: string, provider: string) => {
    if (!id) return;
    updateCampaign.mutate({
      id,
      data: {
        selected_voice_id: voiceId,
        voice_provider: provider as 'retell' | 'vapi' | 'elevenlabs',
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive mb-4">Campaign not found</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/campaigns')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
                <Badge className={statusColors[campaign.status]}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {campaign.campaign_type.charAt(0).toUpperCase() + campaign.campaign_type.slice(1)} Campaign
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {campaign.status !== 'draft' && (
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                disabled={toggleStatus.isPending}
              >
                {campaign.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            )}
            <Button onClick={form.handleSubmit(onSubmit)} disabled={updateCampaign.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateCampaign.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-xs">Leads</span>
              </div>
              <p className="text-2xl font-bold">{campaign.total_leads}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Phone className="h-4 w-4" />
                <span className="text-xs">Calls</span>
              </div>
              <p className="text-2xl font-bold">{campaign.total_calls_attempted}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Connected</span>
              </div>
              <p className="text-2xl font-bold">{campaign.total_calls_connected}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Minutes</span>
              </div>
              <p className="text-2xl font-bold">{campaign.total_minutes_talked.toFixed(1)}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Appointments</span>
              </div>
              <p className="text-2xl font-bold">{campaign.total_appointments_set}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="script" className="gap-2">
              <FileText className="h-4 w-4" />
              Script
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                    <CardDescription>
                      Basic information about your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field}
                              value={field.value || ''}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="campaign_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="outbound">Outbound</SelectItem>
                              <SelectItem value="inbound">Inbound</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              value={field.value || ''}
                              placeholder="+1 (555) 000-0000"
                            />
                          </FormControl>
                          <FormDescription>
                            The phone number used for this campaign
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice" className="mt-6">
                <VoiceSelector 
                  selectedVoiceId={campaign.selected_voice_id}
                  selectedProvider={campaign.voice_provider}
                  onSelect={handleVoiceSelect}
                />
              </TabsContent>

              {/* Script Tab */}
              <TabsContent value="script" className="mt-6">
                <ScriptEditor
                  script={form.watch('ai_script') || ''}
                  prompt={form.watch('ai_prompt') || ''}
                  onScriptChange={(value) => form.setValue('ai_script', value)}
                  onPromptChange={(value) => form.setValue('ai_prompt', value)}
                />
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-6">
                <CampaignSchedule
                  callingHoursStart={form.watch('calling_hours_start')}
                  callingHoursEnd={form.watch('calling_hours_end')}
                  callingDays={form.watch('calling_days')}
                  timezone={form.watch('timezone')}
                  onHoursStartChange={(value) => form.setValue('calling_hours_start', value)}
                  onHoursEndChange={(value) => form.setValue('calling_hours_end', value)}
                  onDaysChange={(value) => form.setValue('calling_days', value)}
                  onTimezoneChange={(value) => form.setValue('timezone', value)}
                />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-6">
                <CampaignStats 
                  campaign={campaign}
                  leads={leads || []}
                  callLogs={callLogs || []}
                />
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
