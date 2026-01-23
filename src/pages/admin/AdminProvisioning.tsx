import { useState, useEffect } from 'react';
import { SuperAdminRoute } from '@/components/admin/SuperAdminRoute';
import { provisioningService } from '@/services/provisioningService';
import { ProvisioningLog, ProvisioningEvent, PROVISIONING_STEP_LABELS } from '@/types/provisioning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Building2,
  Phone,
  Bot,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

function AdminProvisioningContent() {
  const [logs, setLogs] = useState<ProvisioningLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ProvisioningLog | null>(null);

  const loadProvisioningLogs = async () => {
    setIsLoading(true);
    try {
      const data = await provisioningService.getAllProvisioningLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load provisioning logs:', error);
      toast.error('Failed to load provisioning logs');
      // Set demo data
      setLogs([
        {
          organization_id: '1',
          organization_name: 'Acme HVAC',
          started_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          completed_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          overall_status: 'success',
          events: [
            { id: '1', organization_id: '1', step: 'creating_subaccount', status: 'success', message: 'Retell sub-account created', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
            { id: '2', organization_id: '1', step: 'generating_api_key', status: 'success', message: 'API key generated and stored', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
            { id: '3', organization_id: '1', step: 'deploying_agents', status: 'success', message: '3 agents deployed successfully', details: { agents_created: 3 }, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
            { id: '4', organization_id: '1', step: 'configuring_phones', status: 'success', message: 'Phone numbers assigned', details: { phone_numbers: ['+1-555-0101', '+1-555-0102', '+1-555-0103'] }, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 2.5).toISOString() },
            { id: '5', organization_id: '1', step: 'finalizing', status: 'success', message: 'Setup complete', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
          ],
          provider: 'retell',
          agents_created: 3,
          phone_numbers_assigned: ['+1-555-0101', '+1-555-0102', '+1-555-0103'],
        },
        {
          organization_id: '2',
          organization_name: 'Quick Plumbing',
          started_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
          completed_at: null,
          overall_status: 'running',
          events: [
            { id: '6', organization_id: '2', step: 'creating_subaccount', status: 'success', message: 'Retell sub-account created', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString() },
            { id: '7', organization_id: '2', step: 'generating_api_key', status: 'success', message: 'API key generated', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 45).toISOString() },
            { id: '8', organization_id: '2', step: 'deploying_agents', status: 'running', message: 'Deploying agents...', details: null, error_message: null, created_at: new Date(Date.now() - 1000 * 30).toISOString() },
          ],
          provider: 'retell',
          agents_created: 0,
          phone_numbers_assigned: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProvisioningLogs();

    // Subscribe to real-time updates
    const unsubscribe = provisioningService.subscribeToProvisioningUpdates(
      null,
      (event: ProvisioningEvent) => {
        setLogs(prevLogs => {
          const updated = [...prevLogs];
          const logIndex = updated.findIndex(l => l.organization_id === event.organization_id);
          
          if (logIndex >= 0) {
            updated[logIndex].events.push(event);
            if (event.step === 'finalizing' && event.status === 'success') {
              updated[logIndex].overall_status = 'success';
              updated[logIndex].completed_at = event.created_at;
            } else if (event.status === 'failed') {
              updated[logIndex].overall_status = 'failed';
            } else if (event.status === 'running') {
              updated[logIndex].overall_status = 'running';
            }
          }
          
          return updated;
        });
      }
    );

    return unsubscribe;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      running: 'secondary',
      failed: 'destructive',
      pending: 'outline',
    };

    const colors: Record<string, string> = {
      success: 'bg-green-500/10 text-green-500 border-green-500/20',
      running: 'bg-primary/10 text-primary border-primary/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      pending: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Provisioning Monitor</h1>
            <p className="text-muted-foreground">
              Real-time view of N8N client setup workflows
            </p>
          </div>
          <Button variant="outline" onClick={loadProvisioningLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provisioning List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Provisioning Jobs</CardTitle>
                <CardDescription>
                  Click on a job to view detailed event log
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No provisioning jobs yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div
                        key={log.organization_id}
                        onClick={() => setSelectedLog(log)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedLog?.organization_id === log.organization_id
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{log.organization_name}</span>
                          </div>
                          {getStatusBadge(log.overall_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Started {formatDistanceToNow(new Date(log.started_at))} ago</span>
                          {log.agents_created > 0 && (
                            <span className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              {log.agents_created} agents
                            </span>
                          )}
                          {log.phone_numbers_assigned.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {log.phone_numbers_assigned.length} phones
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Event Log Detail */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Event Log
                </CardTitle>
                <CardDescription>
                  {selectedLog
                    ? `Events for ${selectedLog.organization_name}`
                    : 'Select a job to view events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedLog ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {selectedLog.events.map((event, index) => (
                        <div key={event.id} className="relative pl-6">
                          {/* Timeline line */}
                          {index < selectedLog.events.length - 1 && (
                            <div className="absolute left-[7px] top-6 bottom-0 w-[2px] bg-border" />
                          )}
                          
                          {/* Event dot */}
                          <div className="absolute left-0 top-1">
                            {getStatusIcon(event.status)}
                          </div>

                          <div>
                            <p className="font-medium text-sm">
                              {PROVISIONING_STEP_LABELS[event.step] || event.step}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {event.message}
                            </p>
                            {event.error_message && (
                              <p className="text-sm text-red-500 mt-1">
                                {event.error_message}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(event.created_at))} ago
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Select a provisioning job to view its event log</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProvisioning() {
  return (
    <SuperAdminRoute>
      <AdminProvisioningContent />
    </SuperAdminRoute>
  );
}
