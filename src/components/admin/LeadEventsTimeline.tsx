import { LeadEvent } from '@/types/agents';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Phone, 
  PhoneCall, 
  Calendar, 
  CalendarCheck,
  RefreshCw,
  FormInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface LeadEventsTimelineProps {
  events: LeadEvent[];
  isLoading?: boolean;
}

const eventConfig: Record<string, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}> = {
  web_form_inbound: {
    icon: <FormInput className="h-4 w-4" />,
    label: 'Form Submitted',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  sms_sent: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'SMS Sent',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
  call_attempted: {
    icon: <Phone className="h-4 w-4" />,
    label: 'Call Attempted',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  call_completed: {
    icon: <PhoneCall className="h-4 w-4" />,
    label: 'Call Completed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  appointment_set: {
    icon: <Calendar className="h-4 w-4" />,
    label: 'Appointment Set',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  appointment_confirmed: {
    icon: <CalendarCheck className="h-4 w-4" />,
    label: 'Appointment Confirmed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  rework_scheduled: {
    icon: <RefreshCw className="h-4 w-4" />,
    label: 'Rework Scheduled',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export function LeadEventsTimeline({ events, isLoading }: LeadEventsTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No events yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {events.map((event) => {
          const config = eventConfig[event.event_type] || {
            icon: <Phone className="h-4 w-4" />,
            label: event.event_type,
            color: 'text-muted-foreground',
            bgColor: 'bg-muted',
          };
          const status = statusConfig[event.status] || statusConfig.pending;

          return (
            <div 
              key={event.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div className={cn('p-2 rounded-full', config.bgColor)}>
                <span className={config.color}>{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('font-medium text-sm', config.color)}>
                    {config.label}
                  </span>
                  <Badge variant={status.variant} className="text-xs">
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                {event.lead_id && (
                  <p className="text-xs text-muted-foreground truncate">
                    Lead: {event.lead_id}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
