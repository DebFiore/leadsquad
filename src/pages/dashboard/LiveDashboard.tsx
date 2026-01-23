import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Calendar, CheckCircle2, Loader2, Play, RefreshCw } from 'lucide-react';
import { AGENT_CONFIGS, AgentRole } from '@/types/agents';
import { toast } from 'sonner';

interface DeploymentData {
  status: string;
  phone_numbers: {
    inbound?: string;
    outbound?: string;
    setter?: string;
  } | null;
  agent_ids: {
    inbound_receptionist?: string;
    outbound_lead?: string;
    appointment_setter?: string;
  } | null;
}

interface AgentCardData {
  role: AgentRole;
  phoneNumber: string | null;
  agentId: string | null;
  icon: React.ReactNode;
}

export default function LiveDashboard() {
  const { organization } = useAuth();
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingAgent, setTestingAgent] = useState<AgentRole | null>(null);

  useEffect(() => {
    const loadDeploymentStatus = async () => {
      if (!organization?.id) return;

      try {
        const { data, error } = await supabase
          .from('deployment_status')
          .select('status, phone_numbers, agent_ids')
          .eq('organization_id', organization.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load deployment status:', error);
        }

        setDeploymentData(data);
      } catch (error) {
        console.error('Error loading deployment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeploymentStatus();

    // Subscribe to updates
    const channel = supabase
      .channel(`deployment-${organization?.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deployment_status',
          filter: `organization_id=eq.${organization?.id}`,
        },
        (payload) => {
          setDeploymentData(payload.new as DeploymentData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  const handleTestCall = async (role: AgentRole) => {
    if (!organization?.id) return;

    setTestingAgent(role);

    try {
      const { error } = await supabase.functions.invoke('call-trigger', {
        body: {
          organization_id: organization.id,
          phone: '+1234567890', // Test phone - in real use, would prompt user
          name: 'Test User',
          agent_role: role,
          metadata: { is_test: true },
        },
      });

      if (error) throw error;

      toast.success(`Test call initiated for ${AGENT_CONFIGS[role].shortTitle}`);
    } catch (error) {
      console.error('Test call failed:', error);
      toast.error('Failed to initiate test call. Check your provider configuration.');
    } finally {
      setTestingAgent(null);
    }
  };

  const agents: AgentCardData[] = [
    {
      role: 'inbound_receptionist',
      phoneNumber: deploymentData?.phone_numbers?.inbound || null,
      agentId: deploymentData?.agent_ids?.inbound_receptionist || null,
      icon: <PhoneIncoming className="h-6 w-6" />,
    },
    {
      role: 'outbound_lead',
      phoneNumber: deploymentData?.phone_numbers?.outbound || null,
      agentId: deploymentData?.agent_ids?.outbound_lead || null,
      icon: <PhoneOutgoing className="h-6 w-6" />,
    },
    {
      role: 'appointment_setter',
      phoneNumber: deploymentData?.phone_numbers?.setter || null,
      agentId: deploymentData?.agent_ids?.appointment_setter || null,
      icon: <Calendar className="h-6 w-6" />,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const isLive = deploymentData?.status === 'completed';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Live Dashboard</h1>
              {isLive && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Your AI Revenue Squad is {isLive ? 'active and ready' : 'being configured'}
            </p>
          </div>
        </div>

        {/* Status banner */}
        {isLive && (
          <div className="bg-gradient-to-r from-green-500/10 to-primary/10 rounded-xl border border-green-500/20 p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Sales Floor is Operational</h2>
                <p className="text-muted-foreground">
                  All 3 AI agents are deployed and ready to handle calls. Share your phone numbers to start receiving leads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Agent cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {agents.map((agent) => {
            const config = AGENT_CONFIGS[agent.role];
            const isTesting = testingAgent === agent.role;

            return (
              <Card key={agent.role} className={`${config.bgColor} ${config.borderColor} border-2`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center ${config.color}`}>
                      {agent.icon}
                    </div>
                    {agent.agentId && (
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Deployed
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Phone number */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {agent.phoneNumber || 'Pending...'}
                      </span>
                    </div>
                  </div>

                  {/* Agent ID */}
                  {agent.agentId && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Agent ID
                      </label>
                      <div className="p-2 rounded bg-background/50 border border-border">
                        <code className="text-xs text-muted-foreground break-all">
                          {agent.agentId}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Test call button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleTestCall(agent.role)}
                    disabled={!isLive || isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Initiating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Test Call
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick actions */}
        {isLive && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <PhoneCall className="h-5 w-5" />
                  <span>View Call Logs</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Sync CRM</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>View Appointments</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Phone className="h-5 w-5" />
                  <span>Update Numbers</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
