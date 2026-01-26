import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Mic, 
  Play, 
  Pause, 
  Pencil, 
  Trash2,
  Search,
  GripVertical,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useVoices, useCreateVoice, useUpdateVoice, useDeleteVoice, useSyncRetellVoices } from '@/hooks/useVoices';
import { Voice, VoiceGender } from '@/types/voice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const voiceSchema = z.object({
  voice_name: z.string().min(1, 'Name is required'),
  voice_provider: z.enum(['elevenlabs', 'retell', 'vapi']),
  provider_voice_id: z.string().min(1, 'Provider voice ID is required'),
  gender: z.enum(['male', 'female', 'neutral']).optional(),
  accent: z.string().optional(),
  language: z.string().default('en-US'),
  description: z.string().optional(),
  sample_audio_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  is_premium: z.boolean().default(false),
});

type VoiceFormData = z.infer<typeof voiceSchema>;

function VoiceLibraryContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncSecret, setSyncSecret] = useState('');

  const { data: voices, isLoading } = useVoices();
  const createVoice = useCreateVoice();
  const updateVoice = useUpdateVoice();
  const deleteVoice = useDeleteVoice();
  const syncRetellVoices = useSyncRetellVoices();

  const form = useForm<VoiceFormData>({
    resolver: zodResolver(voiceSchema),
    defaultValues: {
      voice_name: '',
      voice_provider: 'elevenlabs',
      provider_voice_id: '',
      gender: undefined,
      accent: '',
      language: 'en-US',
      description: '',
      sample_audio_url: '',
      is_active: true,
      is_premium: false,
    },
  });

  const filteredVoices = voices?.filter(voice => {
    const matchesSearch = voice.voice_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === 'all' || voice.voice_provider === providerFilter;
    return matchesSearch && matchesProvider;
  }) || [];

  const handleOpenDialog = (voice?: Voice) => {
    if (voice) {
      setEditingVoice(voice);
      form.reset({
        voice_name: voice.voice_name,
        voice_provider: voice.voice_provider,
        provider_voice_id: voice.provider_voice_id,
        gender: voice.gender || undefined,
        accent: voice.accent || '',
        language: voice.language,
        description: voice.description || '',
        sample_audio_url: voice.sample_audio_url || '',
        is_active: voice.is_active,
        is_premium: voice.is_premium,
      });
    } else {
      setEditingVoice(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: VoiceFormData) => {
    try {
      if (editingVoice) {
        await updateVoice.mutateAsync({
          id: editingVoice.id,
          data: {
            ...data,
            gender: data.gender as VoiceGender,
            sample_audio_url: data.sample_audio_url || null,
          },
        });
      } else {
        await createVoice.mutateAsync({
          voice_name: data.voice_name,
          voice_provider: data.voice_provider,
          provider_voice_id: data.provider_voice_id,
          language: data.language,
          is_active: data.is_active,
          is_premium: data.is_premium,
          gender: (data.gender as VoiceGender) || null,
          accent: data.accent || null,
          description: data.description || null,
          sample_audio_url: data.sample_audio_url || null,
          display_order: (voices?.length || 0) + 1,
          tags: [],
        });
      }
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Voice save error:', error);
    }
  };

  const handleToggleActive = async (voice: Voice) => {
    await updateVoice.mutateAsync({
      id: voice.id,
      data: { is_active: !voice.is_active },
    });
  };

  const handleDelete = async (voice: Voice) => {
    if (confirm(`Are you sure you want to delete "${voice.voice_name}"?`)) {
      await deleteVoice.mutateAsync(voice.id);
    }
  };

  const handlePlaySample = (voice: Voice) => {
    if (!voice.sample_audio_url) return;

    if (playingId === voice.id) {
      audio?.pause();
      setPlayingId(null);
      return;
    }

    audio?.pause();
    const newAudio = new Audio(voice.sample_audio_url);
    newAudio.onended = () => setPlayingId(null);
    newAudio.play();
    setAudio(newAudio);
    setPlayingId(voice.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Voice Library</h1>
            <p className="text-muted-foreground">
              Manage available voices for campaigns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSyncDialogOpen(true)}
              disabled={syncRetellVoices.isPending}
            >
              {syncRetellVoices.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync from Retell
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Voice
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search voices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={providerFilter}
                onValueChange={(v) => setProviderFilter(v)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="retell">Retell</SelectItem>
                  <SelectItem value="vapi">Vapi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Voices Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Mic className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-1">No voices found</h3>
                <p className="text-sm text-muted-foreground">
                  Add voices to make them available for campaigns.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>Voice</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Sample</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoices.map((voice) => (
                    <TableRow key={voice.id}>
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{voice.voice_name}</p>
                          {voice.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {voice.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {voice.voice_provider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {voice.gender || '-'}
                      </TableCell>
                      <TableCell>
                        {voice.sample_audio_url ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlaySample(voice)}
                          >
                            {playingId === voice.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={voice.is_active}
                            onCheckedChange={() => handleToggleActive(voice)}
                          />
                          <span className={voice.is_active ? 'text-green-500 text-sm' : 'text-muted-foreground text-sm'}>
                            {voice.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(voice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(voice)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Voice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVoice ? 'Edit Voice' : 'Add New Voice'}
            </DialogTitle>
            <DialogDescription>
              {editingVoice 
                ? 'Update the voice details below.'
                : 'Add a new voice to the library for use in campaigns.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="voice_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voice Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah - Professional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="voice_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="retell">Retell</SelectItem>
                          <SelectItem value="vapi">Vapi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="provider_voice_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Voice ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., voice_abc123" {...field} />
                    </FormControl>
                    <FormDescription>
                      The unique ID from ElevenLabs, Retell, or Vapi
                    </FormDescription>
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
                        placeholder="Describe the voice characteristics..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sample_audio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Audio URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_premium"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Premium</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVoice.isPending || updateVoice.isPending}
                >
                  {(createVoice.isPending || updateVoice.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingVoice ? 'Save Changes' : 'Add Voice'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Sync Secret Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Retell Voices</DialogTitle>
            <DialogDescription>
              Enter the admin sync secret to fetch voices from the Retell API.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter admin sync secret..."
              value={syncSecret}
              onChange={(e) => setSyncSecret(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSyncDialogOpen(false);
                setSyncSecret('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                syncRetellVoices.mutate(syncSecret, {
                  onSuccess: () => {
                    setSyncDialogOpen(false);
                    setSyncSecret('');
                  },
                });
              }}
              disabled={syncRetellVoices.isPending || !syncSecret.trim()}
            >
              {syncRetellVoices.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Sync Voices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default function VoiceLibrary() {
  return (
    <SuperAdminRoute>
      <VoiceLibraryContent />
    </SuperAdminRoute>
  );
}
