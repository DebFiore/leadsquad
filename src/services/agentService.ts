import { supabase } from '@/lib/supabase';
import { AgentSettings, AgentRole, VoiceSettings, LeadEvent } from '@/types/agents';

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voice_id: null,
  stability: 0.5,
  clarity: 0.75,
  style: 0.5,
};

const DEFAULT_AGENT_DATA: Record<AgentRole, Partial<AgentSettings>> = {
  inbound_receptionist: {
    primary_goal: 'Book appointments or route calls',
    lead_reworking_enabled: false,
    retry_attempts: 0,
    retry_hours: 0,
  },
  outbound_lead: {
    primary_goal: 'Qualify interest and schedule callbacks',
    lead_reworking_enabled: true,
    retry_attempts: 3,
    retry_hours: 48,
  },
  appointment_setter: {
    primary_goal: 'Confirm or reschedule bookings',
    lead_reworking_enabled: false,
    retry_attempts: 0,
    retry_hours: 0,
  },
};

export const agentService = {
  async getAgentSettings(organizationId: string): Promise<AgentSettings[]> {
    const { data, error } = await supabase
      .from('agent_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .order('agent_role');

    if (error) {
      console.error('Error fetching agent settings:', error);
      throw error;
    }

    return data || [];
  },

  async getOrCreateAgentSettings(organizationId: string): Promise<AgentSettings[]> {
    let settings = await this.getAgentSettings(organizationId);

    // If no settings exist, create defaults for all three agents
    if (settings.length === 0) {
      const roles: AgentRole[] = ['inbound_receptionist', 'outbound_lead', 'appointment_setter'];
      
      const newSettings = roles.map(role => ({
        organization_id: organizationId,
        agent_role: role,
        is_enabled: false,
        voice_settings: DEFAULT_VOICE_SETTINGS,
        ...DEFAULT_AGENT_DATA[role],
      }));

      const { data, error } = await supabase
        .from('agent_settings')
        .insert(newSettings)
        .select();

      if (error) {
        console.error('Error creating agent settings:', error);
        throw error;
      }

      settings = data || [];
    }

    return settings;
  },

  async updateAgentSetting(
    id: string,
    updates: Partial<Omit<AgentSettings, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
  ): Promise<AgentSettings> {
    const { data, error } = await supabase
      .from('agent_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent setting:', error);
      throw error;
    }

    return data;
  },

  async syncVoiceAcrossAgents(
    organizationId: string,
    voiceSettings: VoiceSettings
  ): Promise<void> {
    const { error } = await supabase
      .from('agent_settings')
      .update({ 
        voice_settings: voiceSettings,
        updated_at: new Date().toISOString() 
      })
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error syncing voice settings:', error);
      throw error;
    }
  },

  async toggleAgentEnabled(id: string, isEnabled: boolean): Promise<AgentSettings> {
    return this.updateAgentSetting(id, { is_enabled: isEnabled });
  },

  async updatePersistenceSettings(
    id: string,
    enabled: boolean,
    attempts: number,
    hours: number
  ): Promise<AgentSettings> {
    return this.updateAgentSetting(id, {
      lead_reworking_enabled: enabled,
      retry_attempts: attempts,
      retry_hours: hours,
    });
  },
};

export const leadEventService = {
  async getEventsByOrganization(organizationId: string, limit = 50): Promise<LeadEvent[]> {
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching lead events:', error);
      throw error;
    }

    return data || [];
  },

  async getRecentEvents(limit = 100): Promise<LeadEvent[]> {
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent events:', error);
      throw error;
    }

    return data || [];
  },

  async createEvent(event: Omit<LeadEvent, 'id' | 'created_at' | 'processed_at'>): Promise<LeadEvent> {
    const { data, error } = await supabase
      .from('lead_events')
      .insert(event)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead event:', error);
      throw error;
    }

    return data;
  },

  async getEventStats(organizationId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('lead_events')
      .select('event_type, status')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }

    const stats: Record<string, number> = {
      total: data?.length || 0,
      sms_sent: 0,
      call_attempted: 0,
      call_completed: 0,
      appointment_set: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    data?.forEach(event => {
      if (stats[event.event_type] !== undefined) {
        stats[event.event_type]++;
      }
      if (stats[event.status] !== undefined) {
        stats[event.status]++;
      }
    });

    return stats;
  },
};
