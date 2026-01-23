import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  PhoneIncoming, 
  PhoneOutgoing,
  Calendar,
  RefreshCw,
  Loader2,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { retellWorkspaceService } from '@/services/retellWorkspaceService';
import { RetellPhoneNumber } from '@/types/retell';
import { toast } from 'sonner';

interface PhoneNumbersSectionProps {
  organizationId: string;
}

export function PhoneNumbersSection({ organizationId }: PhoneNumbersSectionProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<RetellPhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadPhoneNumbers = async () => {
    try {
      const data = await retellWorkspaceService.getPhoneNumbers(organizationId);
      setPhoneNumbers(data);
    } catch (error) {
      console.error('Failed to load phone numbers:', error);
      // Set demo data
      setPhoneNumbers([
        {
          id: '1',
          phone_number: '+1 (555) 123-4567',
          nickname: 'Main Inbound',
          agent_id: 'agent_abc123',
          agent_role: 'inbound_receptionist',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          phone_number: '+1 (555) 234-5678',
          nickname: 'Outbound Dialer',
          agent_id: 'agent_def456',
          agent_role: 'outbound_lead',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          phone_number: '+1 (555) 345-6789',
          nickname: 'Appointment Setter',
          agent_id: 'agent_ghi789',
          agent_role: 'appointment_setter',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhoneNumbers();
  }, [organizationId]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const synced = await retellWorkspaceService.syncPhoneNumbers(organizationId);
      setPhoneNumbers(synced);
      toast.success('Phone numbers synced from Retell');
    } catch (error) {
      console.error('Failed to sync:', error);
      toast.error('Failed to sync phone numbers');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopy = (number: string, id: string) => {
    navigator.clipboard.writeText(number.replace(/\D/g, ''));
    setCopiedId(id);
    toast.success('Phone number copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoleIcon = (role: RetellPhoneNumber['agent_role']) => {
    switch (role) {
      case 'inbound_receptionist':
        return <PhoneIncoming className="h-4 w-4" />;
      case 'outbound_lead':
        return <PhoneOutgoing className="h-4 w-4" />;
      case 'appointment_setter':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: RetellPhoneNumber['agent_role']) => {
    switch (role) {
      case 'inbound_receptionist':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'outbound_lead':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'appointment_setter':
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getRoleLabel = (role: RetellPhoneNumber['agent_role']) => {
    switch (role) {
      case 'inbound_receptionist':
        return 'Receptionist';
      case 'outbound_lead':
        return 'Outbound';
      case 'appointment_setter':
        return 'Setter';
      default:
        return 'Unassigned';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Phone Numbers</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
        <CardDescription>
          Your assigned phone numbers from Retell
        </CardDescription>
      </CardHeader>

      <CardContent>
        {phoneNumbers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Phone className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No phone numbers assigned yet</p>
            <p className="text-sm">Numbers will appear here after agent deployment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {phoneNumbers.map((number) => (
              <div
                key={number.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getRoleColor(number.agent_role)}`}>
                    {getRoleIcon(number.agent_role)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{number.phone_number}</span>
                      {number.is_active && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {number.nickname || 'No nickname'}
                      </span>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(number.agent_role)}`}>
                        {getRoleLabel(number.agent_role)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleCopy(number.phone_number, number.id)}
                >
                  {copiedId === number.id ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
