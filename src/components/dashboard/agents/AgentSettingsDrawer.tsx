import { AgentSettings, AGENT_CONFIGS, AgentRole } from '@/types/agents';
import { agentService } from '@/services/agentService';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PersistenceSettings } from './PersistenceSettings';
import { cn } from '@/lib/utils';

interface AgentSettingsDrawerProps {
  agent: AgentSettings | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function AgentSettingsDrawer({ 
  agent, 
  open, 
  onOpenChange,
  onUpdate,
}: AgentSettingsDrawerProps) {
  if (!agent) return null;

  const config = AGENT_CONFIGS[agent.agent_role as AgentRole];

  const handlePersistenceSave = async (enabled: boolean, attempts: number, hours: number) => {
    await agentService.updatePersistenceSettings(agent.id, enabled, attempts, hours);
    onUpdate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <SheetTitle>{config.title}</SheetTitle>
              <SheetDescription>
                Configure agent behavior and settings
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Agent Info */}
            <div className={cn(
              'rounded-lg p-4 border',
              config.bgColor,
              config.borderColor
            )}>
              <h4 className="font-medium mb-2">Primary Goal</h4>
              <p className={cn('text-lg font-semibold', config.color)}>
                {config.primaryGoal}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {config.description}
              </p>
            </div>

            <Separator />

            {/* Persistence Settings - Only for Outbound */}
            {agent.agent_role === 'outbound_lead' && (
              <PersistenceSettings 
                agent={agent} 
                onSave={handlePersistenceSave}
              />
            )}

            {/* Voice Info */}
            <div className="space-y-2">
              <h4 className="font-medium">Voice Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Voice settings are managed globally in the "Unified Voice Settings" panel above. 
                Changes sync across all agents for seamless handoffs.
              </p>
              {agent.voice_settings?.voice_id ? (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p><strong>Voice ID:</strong> {agent.voice_settings.voice_id}</p>
                  <p><strong>Stability:</strong> {Math.round(agent.voice_settings.stability * 100)}%</p>
                  <p><strong>Clarity:</strong> {Math.round(agent.voice_settings.clarity * 100)}%</p>
                </div>
              ) : (
                <p className="text-sm text-amber-500">
                  No voice configured yet. Select a voice in the panel above.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
