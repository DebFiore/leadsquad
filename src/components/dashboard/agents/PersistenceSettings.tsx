import { useState } from 'react';
import { AgentSettings } from '@/types/agents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PersistenceSettingsProps {
  agent: AgentSettings;
  onSave: (enabled: boolean, attempts: number, hours: number) => Promise<void>;
}

export function PersistenceSettings({ agent, onSave }: PersistenceSettingsProps) {
  const [enabled, setEnabled] = useState(agent.lead_reworking_enabled);
  const [attempts, setAttempts] = useState(agent.retry_attempts);
  const [hours, setHours] = useState(agent.retry_hours);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = 
    enabled !== agent.lead_reworking_enabled ||
    attempts !== agent.retry_attempts ||
    hours !== agent.retry_hours;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(enabled, attempts, hours);
      toast.success('Persistence settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Persistence Settings</CardTitle>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        <CardDescription>
          Enable lead reworking to automatically retry unanswered calls
        </CardDescription>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-6">
          {/* Retry Attempts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Retry Attempts</Label>
              <span className="text-sm font-medium">{attempts} attempts</span>
            </div>
            <Slider
              value={[attempts]}
              onValueChange={([value]) => setAttempts(value)}
              min={1}
              max={5}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Number of call attempts before marking lead as unresponsive
            </p>
          </div>

          {/* Retry Window */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Retry Window</Label>
              <span className="text-sm font-medium">{hours} hours</span>
            </div>
            <Slider
              value={[hours]}
              onValueChange={([value]) => setHours(value)}
              min={12}
              max={120}
              step={12}
            />
            <p className="text-xs text-muted-foreground">
              Time window to spread retry attempts over
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Cadence Preview:</strong> {attempts} attempts over {hours} hours 
              ({Math.round(hours / attempts)} hours between each attempt)
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || !hasChanges}
            className="w-full"
            size="sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Persistence Settings
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
