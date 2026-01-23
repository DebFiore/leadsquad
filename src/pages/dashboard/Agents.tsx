import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { intakeService } from '@/services/intakeService';
import { agentService } from '@/services/agentService';
import { ClientIntakeResponse } from '@/types/database';
import { AgentSettings, VoiceSettings } from '@/types/agents';
import { AgentCard } from '@/components/dashboard/agents/AgentCard';
import { VoiceSyncPanel } from '@/components/dashboard/agents/VoiceSyncPanel';
import { AgentSettingsDrawer } from '@/components/dashboard/agents/AgentSettingsDrawer';
import { toast } from 'sonner';

export default function Agents() {
  const { organization } = useAuth();
  const [intake, setIntake] = useState<ClientIntakeResponse | null>(null);
  const [agents, setAgents] = useState<AgentSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentSettings | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
    if (!organization?.id) return;
    
    try {
      setIsLoading(true);
      const [intakeData, agentData] = await Promise.all([
        intakeService.getIntakeByOrganization(organization.id),
        agentService.getOrCreateAgentSettings(organization.id),
      ]);
      setIntake(intakeData);
      setAgents(agentData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load agent data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organization?.id]);

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      await agentService.toggleAgentEnabled(id, enabled);
      setAgents(agents.map(a => 
        a.id === id ? { ...a, is_enabled: enabled } : a
      ));
      toast.success(enabled ? 'Agent activated' : 'Agent deactivated');
    } catch (error) {
      toast.error('Failed to update agent');
    }
  };

  const handleOpenSettings = (agent: AgentSettings) => {
    setSelectedAgent(agent);
    setDrawerOpen(true);
  };

  const handleSyncVoice = async (settings: VoiceSettings) => {
    if (!organization?.id) return;
    await agentService.syncVoiceAcrossAgents(organization.id, settings);
    setAgents(agents.map(a => ({ ...a, voice_settings: settings })));
  };

  const currentVoiceSettings = agents[0]?.voice_settings || {
    voice_id: null,
    stability: 0.5,
    clarity: 0.75,
    style: 0.5,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Revenue Squad</h1>
            <p className="text-muted-foreground mt-1">
              Manage your three AI agents and their configurations
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading agents...</p>
            </CardContent>
          </Card>
        ) : !intake?.is_complete ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle className="mb-2">Agent Configuration Pending</CardTitle>
              <CardDescription className="text-center max-w-sm mb-4">
                Complete your onboarding to configure your AI agents.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Unified Voice Settings */}
            <VoiceSyncPanel 
              voiceSettings={currentVoiceSettings}
              onSyncVoice={handleSyncVoice}
            />

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onToggleEnabled={handleToggleEnabled}
                  onOpenSettings={handleOpenSettings}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Status Banner */}
            {agents.some(a => a.is_enabled) && (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="flex items-center gap-3 py-4">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-400">
                      {agents.filter(a => a.is_enabled).length} of 3 agents active
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your AI squad is ready to handle leads
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Agent Settings Drawer */}
      <AgentSettingsDrawer
        agent={selectedAgent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdate={loadData}
      />
    </DashboardLayout>
  );
}
