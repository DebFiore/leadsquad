import { supabase } from '@/lib/supabase';
import { ProvisioningEvent, ProvisioningLog, ProvisioningStatus } from '@/types/provisioning';

export const provisioningService = {
  // Get provisioning events for an organization
  async getProvisioningEvents(organizationId: string): Promise<ProvisioningEvent[]> {
    const { data, error } = await supabase
      .from('provisioning_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get all active provisioning logs (for admin view)
  async getAllProvisioningLogs(): Promise<ProvisioningLog[]> {
    const { data: events, error: eventsError } = await supabase
      .from('provisioning_events')
      .select(`
        *,
        organizations:organization_id (name)
      `)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Group events by organization
    const logsByOrg = new Map<string, ProvisioningLog>();
    
    events?.forEach(event => {
      const orgId = event.organization_id;
      
      if (!logsByOrg.has(orgId)) {
        logsByOrg.set(orgId, {
          organization_id: orgId,
          organization_name: event.organizations?.name || 'Unknown',
          started_at: event.created_at,
          completed_at: null,
          overall_status: 'pending' as ProvisioningStatus,
          events: [],
          provider: 'retell',
          agents_created: 0,
          phone_numbers_assigned: [],
        });
      }

      const log = logsByOrg.get(orgId)!;
      log.events.push(event);

      // Update overall status based on latest event
      if (event.status === 'failed') {
        log.overall_status = 'failed';
      } else if (event.step === 'finalizing' && event.status === 'success') {
        log.overall_status = 'success';
        log.completed_at = event.created_at;
      } else if (event.status === 'running') {
        log.overall_status = 'running';
      }

      // Extract agents and phones from details
      if (event.details) {
        if (event.details.agents_created) {
          log.agents_created = event.details.agents_created as number;
        }
        if (event.details.phone_numbers) {
          log.phone_numbers_assigned = event.details.phone_numbers as string[];
        }
        if (event.details.provider) {
          log.provider = event.details.provider as 'vapi' | 'retell';
        }
      }
    });

    return Array.from(logsByOrg.values()).sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  },

  // Log a provisioning event
  async logProvisioningEvent(event: Omit<ProvisioningEvent, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('provisioning_events')
      .insert(event);

    if (error) throw error;
  },

  // Subscribe to real-time provisioning updates
  subscribeToProvisioningUpdates(
    organizationId: string | null,
    callback: (event: ProvisioningEvent) => void
  ) {
    const channel = supabase
      .channel('provisioning-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'provisioning_events',
          ...(organizationId ? { filter: `organization_id=eq.${organizationId}` } : {}),
        },
        (payload) => {
          callback(payload.new as ProvisioningEvent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Get latest status for an organization's provisioning
  async getProvisioningStatus(organizationId: string): Promise<{
    status: ProvisioningStatus;
    currentStep: string | null;
    lastEvent: ProvisioningEvent | null;
  }> {
    const { data, error } = await supabase
      .from('provisioning_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { status: 'pending', currentStep: null, lastEvent: null };
    }

    return {
      status: data.status,
      currentStep: data.step,
      lastEvent: data,
    };
  },
};
