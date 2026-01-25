// src/pages/dashboard/CallLogs.tsx
import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useCallLogs, useCallStats } from '@/hooks/useCallLogs';
import { useCampaigns } from '@/hooks/useCampaigns';
import { CallLog, CallStatus } from '@/types/calls';
import { CallDetailModal } from '@/components/calls/CallDetailModal';
import { AudioPlayer } from '@/components/calls/AudioPlayer';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/phoneUtils';

const statusConfig: Record<CallStatus, { label: string; color: string; icon: React.ReactNode }> = {
  initiated: { label: 'Initiated', color: 'bg-blue-500/20 text-blue-400', icon: <Phone className="h-3 w-3" /> },
  ringing: { label: 'Ringing', color: 'bg-yellow-500/20 text-yellow-400', icon: <Phone className="h-3 w-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400', icon: <Phone className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400', icon: <CheckCircle className="h-3 w-3" /> },
  missed: { label: 'Missed', color: 'bg-yellow-500/20 text-yellow-400', icon: <PhoneMissed className="h-3 w-3" /> },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400', icon: <XCircle className="h-3 w-3" /> },
  voicemail: { label: 'Voicemail', color: 'bg-purple-500/20 text-purple-400', icon: <Phone className="h-3 w-3" /> },
  busy: { label: 'Busy', color: 'bg-orange-500/20 text-orange-400', icon: <Phone className="h-3 w-3" /> },
  no_answer: { label: 'No Answer', color: 'bg-gray-500/20 text-gray-400', icon: <PhoneMissed className="h-3 w-3" /> },
};

type DatePreset = '7d' | '30d' | '90d';

export default function CallLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CallStatus | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data: callLogsData, isLoading } = useCallLogs({
    startDate: startOfDay(dateRange.from).toISOString(),
    endDate: endOfDay(dateRange.to).toISOString(),
    status: statusFilter !== 'all' ? statusFilter : undefined,
    campaignId: campaignFilter !== 'all' ? campaignFilter : undefined,
  });
  
  const callLogs = callLogsData?.calls || [];
  
  const { data: stats } = useCallStats({
    start: startOfDay(dateRange.from).toISOString(),
    end: endOfDay(dateRange.to).toISOString(),
  });
  const { data: campaigns } = useCampaigns();

  // Filter by search
  const filteredCalls = useMemo(() => {
    if (!searchQuery) return callLogs;
    
    return callLogs.filter((call) =>
      call.phone_number?.includes(searchQuery) ||
      call.transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.call_summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [callLogs, searchQuery]);

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case '7d':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case '30d':
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case '90d':
        setDateRange({ from: subDays(now, 90), to: now });
        break;
    }
  };

  const handleViewDetails = (call: CallLog) => {
    setSelectedCall(call);
    setDetailModalOpen(true);
  };

  const exportToCSV = () => {
    if (!filteredCalls.length) return;

    const headers = ['Date', 'Phone', 'Type', 'Status', 'Duration', 'Campaign', 'Appointment Set', 'Sentiment'];
    const rows = filteredCalls.map((call) => [
      format(new Date(call.created_at), 'yyyy-MM-dd HH:mm:ss'),
      call.phone_number,
      call.call_type,
      call.call_status,
      `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}`,
      campaigns?.find((c) => c.id === call.campaign_id)?.name || '',
      call.appointment_set ? 'Yes' : 'No',
      call.call_sentiment || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Call Logs</h1>
            <p className="text-muted-foreground">
              View call history, recordings, and transcripts
            </p>
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={!filteredCalls.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.totalCalls || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Calls</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.completedCalls || 0}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.totalMinutes || 0}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.appointmentsSet || 0}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stats?.connectRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Connect Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search phone, transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Preset */}
              <Select value={datePreset} onValueChange={(v) => handleDatePresetChange(v as DatePreset)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as CallStatus | 'all')}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Campaign Filter */}
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Call Logs Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Phone className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium">No calls found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {callLogs.length === 0 
                    ? 'No calls have been made yet. Start a campaign to begin making calls.'
                    : 'No calls match your current filters. Try adjusting your search criteria.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Recording</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.map((call) => (
                    <TableRow
                      key={call.id}
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(call)}
                    >
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">
                            {format(new Date(call.created_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(call.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          {call.call_type === 'inbound' ? (
                            <PhoneIncoming className="h-4 w-4 text-blue-500" />
                          ) : (
                            <PhoneOutgoing className="h-4 w-4 text-green-500" />
                          )}
                          {call.call_type}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatPhoneNumber(call.phone_number)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', statusConfig[call.call_status]?.color)}>
                          {statusConfig[call.call_status]?.icon}
                          <span className="ml-1">{statusConfig[call.call_status]?.label || call.call_status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(call.duration_seconds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {call.campaign_id ? (
                          <Badge variant="secondary" className="text-xs">
                            {campaigns?.find((c) => c.id === call.campaign_id)?.name || 'Unknown'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {call.recording_url ? (
                          <AudioPlayer src={call.recording_url} compact />
                        ) : (
                          <span className="text-xs text-muted-foreground">No recording</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {call.appointment_set && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">
                              Appointment
                            </Badge>
                          )}
                          {call.call_sentiment && (
                            <Badge variant="outline" className={cn(
                              'text-xs',
                              call.call_sentiment === 'positive' && 'bg-green-500/10 text-green-500',
                              call.call_sentiment === 'neutral' && 'bg-gray-500/10 text-gray-400',
                              call.call_sentiment === 'negative' && 'bg-red-500/10 text-red-400',
                            )}>
                              {call.call_sentiment}
                            </Badge>
                          )}
                          {call.transcript && (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination info */}
        {filteredCalls.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredCalls.length} call{filteredCalls.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        campaignName={campaigns?.find((c) => c.id === selectedCall?.campaign_id)?.name}
      />
    </DashboardLayout>
  );
}
