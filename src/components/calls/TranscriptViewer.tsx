// src/components/calls/TranscriptViewer.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Copy, Check, User, Bot } from 'lucide-react';
import { TranscriptSegment } from '@/types/calls';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TranscriptViewerProps {
  transcript: string | null;
  segments?: TranscriptSegment[];
  className?: string;
}

export function TranscriptViewer({ transcript, segments, className }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!transcript && (!segments || segments.length === 0)) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-muted-foreground', className)}>
        <p className="text-sm">No transcript available for this call</p>
      </div>
    );
  }

  const copyTranscript = () => {
    const text = segments 
      ? segments.map(s => `${s.speaker === 'agent' ? 'AI' : 'Caller'}: ${s.text}`).join('\n\n')
      : transcript || '';
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Transcript copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-500/30 text-foreground px-0.5 rounded">{part}</mark>
        : part
    );
  };

  // If we have segments, show the rich view
  if (segments && segments.length > 0) {
    const filteredSegments = searchQuery
      ? segments.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
      : segments;

    return (
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={copyTranscript}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Transcript */}
        <ScrollArea className="h-[400px] rounded-lg border p-4">
          <div className="space-y-4">
            {filteredSegments.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <div className={cn(
                  'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                  segment.speaker === 'agent' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {segment.speaker === 'agent' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {segment.speaker === 'agent' ? 'AI Agent' : 'Caller'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(segment.start_time)}
                    </span>
                  </div>
                  <div className={cn(
                    'rounded-lg p-3 text-sm',
                    segment.speaker === 'agent' ? 'bg-primary/5' : 'bg-muted'
                  )}>
                    <p className="leading-relaxed">
                      {highlightText(segment.text, searchQuery)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {filteredSegments.length === 0 && searchQuery && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No matches found for "{searchQuery}"
          </p>
        )}
      </div>
    );
  }

  // Plain text transcript fallback
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Transcript</h4>
        <Button variant="outline" size="sm" onClick={copyTranscript}>
          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          Copy
        </Button>
      </div>
      <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted/30">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{transcript}</p>
      </ScrollArea>
    </div>
  );
}
