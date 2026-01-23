import { AgentSettings, AGENT_CONFIGS, AgentRole } from '@/types/agents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AgentSettings;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onOpenSettings: (agent: AgentSettings) => void;
  isLoading?: boolean;
}

export function AgentCard({ agent, onToggleEnabled, onOpenSettings, isLoading }: AgentCardProps) {
  const config = AGENT_CONFIGS[agent.agent_role as AgentRole];

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
      config.borderColor,
      'border-2'
    )}>
      <div className={cn('absolute inset-0 opacity-5', config.bgColor)} />
      
      <CardHeader className="relative pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.emoji}</span>
            <div>
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {config.description}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={agent.is_enabled}
            onCheckedChange={(checked) => onToggleEnabled(agent.id, checked)}
            disabled={isLoading}
          />
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Primary Goal */}
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Primary Goal
          </span>
          <p className={cn('font-semibold', config.color)}>
            {config.primaryGoal}
          </p>
        </div>

        {/* Voice Status */}
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {agent.voice_settings?.voice_id ? (
              <Badge variant="secondary" className="font-normal">
                Voice configured
              </Badge>
            ) : (
              <Badge variant="outline" className="font-normal">
                No voice selected
              </Badge>
            )}
          </span>
        </div>

        {/* Reworking badge for outbound */}
        {agent.agent_role === 'outbound_lead' && agent.lead_reworking_enabled && (
          <Badge variant="outline" className="text-xs">
            Reworking: {agent.retry_attempts} attempts / {agent.retry_hours}h
          </Badge>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2">
          <Badge 
            variant={agent.is_enabled ? 'default' : 'secondary'}
            className={cn(
              agent.is_enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''
            )}
          >
            {agent.is_enabled ? 'Active' : 'Inactive'}
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onOpenSettings(agent)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
