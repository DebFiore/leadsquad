// src/components/calls/CallDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Calendar,
  CheckCircle,
  Mic,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { CallLog, CallStatus } from '@/types/calls';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptViewer } from './TranscriptViewer';
import { format } from 'date-fns';
import { formatPhoneNumber } from '@/lib/phoneUtils';
import { cn } from '@/lib/utils';

interface CallDetailModalProps {
  call: CallLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName?: string;
}

const statusConfig: Record<CallStatus, { label: string; color: string }> = {
  initiated: { label: 'Initiated', color: 'bg-blue-500/20 text-blue-400' },
  ringing: { label: 'Ringing', color: 'bg-yellow-500/20 text-yellow-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  missed: { label: 'Missed', color: 'bg-yellow-500/20 text-yellow-400' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400' },
  voicemail: { label: 'Voicemail', color: 'bg-purple-500/20 text-purple-400' },
  busy: { label: 'Busy', color: 'bg-orange-500/20 text-orange-400' },
  no_answer: { label: 'No Answer', color: 'bg-gray-500/20 text-gray-400' },
};

export function CallDetailModal({ call, open, onOpenChange, campaignName }: CallDetailModalProps) {
  if (!call) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {call.call_type === 'inbound' ? (
              <PhoneIncoming className="h-5 w-5 text-blue-500" />
            ) : (
              <PhoneOutgoing className="h-5 w-5 text-green-500" />
            )}
            Call Details
          </DialogTitle>
          <DialogDescription>
            {format(new Date(call.created_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </div>
                <p className="font-mono font-medium">{formatPhoneNumber(call.phone_number)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  Duration
                </div>
                <p className="font-medium">{formatDuration(call.duration_seconds)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-muted-foreground text-sm mb-1">
                  Status
                </div>
                <Badge variant="outline" className={cn('text-xs', statusConfig[call.call_status]?.color)}>
                  {statusConfig[call.call_status]?.label || call.call_status}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4 pb-3">
                <div className="text-muted-foreground text-sm mb-1">
                  Provider
                </div>
                <Badge variant="secondary" className="text-xs capitalize">{call.provider}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Outcomes */}
          {(call.appointment_set || call.call_sentiment) && (
            <div className="flex flex-wrap gap-2">
              {call.appointment_set && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Appointment Set
                  {call.appointment_datetime && (
                    <span className="ml-1 opacity-80">
                      - {format(new Date(call.appointment_datetime), 'MMM d, h:mm a')}
                    </span>
                  )}
                </Badge>
              )}
              {call.call_sentiment && (
                <Badge variant="outline" className={cn(
                  call.call_sentiment === 'positive' && 'bg-green-500/10 text-green-500 border-green-500/30',
                  call.call_sentiment === 'neutral' && 'bg-gray-500/10 text-gray-400 border-gray-500/30',
                  call.call_sentiment === 'negative' && 'bg-red-500/10 text-red-400 border-red-500/30',
                )}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {call.call_sentiment} sentiment
                </Badge>
              )}
              {call.follow_up_required && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                  Follow-up required
                </Badge>
              )}
            </div>
          )}

          {/* Campaign & Summary */}
          <div className="space-y-3">
            {campaignName && (
              <div>
                <p className="text-sm text-muted-foreground">Campaign</p>
                <p className="font-medium">{campaignName}</p>
              </div>
            )}
            
            {call.call_summary && (
              <div>
                <p className="text-sm text-muted-foreground">AI Summary</p>
                <p className="text-sm leading-relaxed">{call.call_summary}</p>
              </div>
            )}

            {call.key_topics && call.key_topics.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Key Topics</p>
                <div className="flex flex-wrap gap-1">
                  {call.key_topics.map((topic, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{topic}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Tabs for Recording & Transcript */}
          <Tabs defaultValue="recording" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recording" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Recording
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Transcript
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recording" className="mt-4">
              {call.recording_url ? (
                <div className="rounded-lg border p-4">
                  <AudioPlayer src={call.recording_url} />
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  No recording available
                </div>
              )}
            </TabsContent>

            <TabsContent value="transcript" className="mt-4">
              <TranscriptViewer 
                transcript={call.transcript} 
                segments={call.transcript_segments} 
              />
            </TabsContent>
          </Tabs>

          {/* Metadata */}
          {call.provider_call_id && (
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Technical Details</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider Call ID:</span>
                  <span className="font-mono">{call.provider_call_id}</span>
                </div>
                {call.cost_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-mono">${call.cost_amount.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
