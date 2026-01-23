import { useState } from 'react';
import { VoiceSettings, ELEVENLABS_VOICES } from '@/types/agents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mic2, Volume2, Sparkles, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSyncPanelProps {
  voiceSettings: VoiceSettings;
  onSyncVoice: (settings: VoiceSettings) => Promise<void>;
}

export function VoiceSyncPanel({ voiceSettings, onSyncVoice }: VoiceSyncPanelProps) {
  const [settings, setSettings] = useState<VoiceSettings>(voiceSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSyncVoice(settings);
      toast.success('Voice synchronized across all agents!');
    } catch (error) {
      toast.error('Failed to sync voice settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(voiceSettings);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Unified Voice Settings</CardTitle>
        </div>
        <CardDescription>
          Select a voice and configure settings. Changes will sync across all three agents for seamless handoffs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>ElevenLabs Voice</Label>
          <Select
            value={settings.voice_id || ''}
            onValueChange={(value) => setSettings(s => ({ ...s, voice_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a voice..." />
            </SelectTrigger>
            <SelectContent>
              {ELEVENLABS_VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span>{voice.name}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stability Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Stability
            </Label>
            <span className="text-sm text-muted-foreground">{Math.round(settings.stability * 100)}%</span>
          </div>
          <Slider
            value={[settings.stability]}
            onValueChange={([value]) => setSettings(s => ({ ...s, stability: value }))}
            min={0}
            max={1}
            step={0.05}
          />
          <p className="text-xs text-muted-foreground">
            Lower = more expressive, Higher = more consistent
          </p>
        </div>

        {/* Clarity Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Clarity
            </Label>
            <span className="text-sm text-muted-foreground">{Math.round(settings.clarity * 100)}%</span>
          </div>
          <Slider
            value={[settings.clarity]}
            onValueChange={([value]) => setSettings(s => ({ ...s, clarity: value }))}
            min={0}
            max={1}
            step={0.05}
          />
          <p className="text-xs text-muted-foreground">
            How closely to match original voice characteristics
          </p>
        </div>

        {/* Style Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Style</Label>
            <span className="text-sm text-muted-foreground">{Math.round(settings.style * 100)}%</span>
          </div>
          <Slider
            value={[settings.style]}
            onValueChange={([value]) => setSettings(s => ({ ...s, style: value }))}
            min={0}
            max={1}
            step={0.05}
          />
          <p className="text-xs text-muted-foreground">
            Style exaggeration level
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sync Voice Across All Agents
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
