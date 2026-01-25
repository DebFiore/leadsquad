import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Check, Mic } from 'lucide-react';
import { useVoices } from '@/hooks/useVoices';
import { Voice, VoiceProvider } from '@/types/voice';
import { cn } from '@/lib/utils';

interface VoiceSelectorProps {
  selectedVoiceId: string | null;
  selectedProvider: string | null;
  onSelect: (voiceId: string, provider: string) => void;
}

export function VoiceSelector({ selectedVoiceId, selectedProvider, onSelect }: VoiceSelectorProps) {
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [activeProvider, setActiveProvider] = useState<VoiceProvider>('elevenlabs');
  
  const { data: voices, isLoading } = useVoices();

  const filteredVoices = voices?.filter(v => v.voice_provider === activeProvider) || [];

  const handlePlaySample = (voice: Voice) => {
    if (!voice.sample_audio_url) return;

    if (playingVoiceId === voice.id) {
      audioRef?.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audioRef) {
      audioRef.pause();
    }

    const audio = new Audio(voice.sample_audio_url);
    audio.onended = () => setPlayingVoiceId(null);
    audio.play();
    setAudioRef(audio);
    setPlayingVoiceId(voice.id);
  };

  const handleSelect = (voice: Voice) => {
    onSelect(voice.provider_voice_id, voice.voice_provider);
  };

  const genderColor: Record<string, string> = {
    male: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    female: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    neutral: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <CardTitle>Voice Selection</CardTitle>
        </div>
        <CardDescription>
          Choose the AI voice for your campaign calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeProvider} onValueChange={(v) => setActiveProvider(v as VoiceProvider)}>
          <TabsList className="mb-4">
            <TabsTrigger value="elevenlabs">ElevenLabs</TabsTrigger>
            <TabsTrigger value="retell">Retell</TabsTrigger>
            <TabsTrigger value="vapi">Vapi</TabsTrigger>
          </TabsList>

          <TabsContent value={activeProvider}>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : filteredVoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No voices available for this provider
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoiceId === voice.provider_voice_id && 
                                    selectedProvider === voice.voice_provider;
                  const isPlaying = playingVoiceId === voice.id;

                  return (
                    <Card
                      key={voice.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary/50',
                        isSelected && 'border-primary ring-2 ring-primary/20'
                      )}
                      onClick={() => handleSelect(voice)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{voice.voice_name}</p>
                            {voice.gender && (
                              <Badge variant="outline" className={genderColor[voice.gender] || ''}>
                                {voice.gender}
                              </Badge>
                            )}
                          </div>
                          {isSelected && (
                            <div className="rounded-full bg-primary p-1">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        
                        {voice.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {voice.description}
                          </p>
                        )}

                        {voice.sample_audio_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaySample(voice);
                            }}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Play Sample
                              </>
                            )}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {selectedVoiceId && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Selected voice:{' '}
              <span className="font-medium text-foreground">
                {voices?.find(v => v.provider_voice_id === selectedVoiceId)?.voice_name || selectedVoiceId}
              </span>
              {' '}
              <Badge variant="secondary" className="ml-1">{selectedProvider}</Badge>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
