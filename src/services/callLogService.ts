import { supabase } from '@/lib/supabase';
import { CallLog, CallLogInsert } from '@/types/calls';

export const callLogService = {
  // Get all call logs for an organization
  async getCallLogs(organizationId: string, filters?: {
    campaignId?: string;
    leadId?: string;
    status?: string;
    callType?: 'inbound' | 'outbound';
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ calls: CallLog[]; count: number }> {
    let query = supabase
      .from('call_logs')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    if (filters?.leadId) {
      query = query.eq('lead_id', filters.leadId);
    }

    if (filters?.status) {
      query = query.eq('call_status', filters.status);
    }

    if (filters?.callType) {
      query = query.eq('call_type', filters.callType);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { calls: data || [], count: count || 0 };
  },

  // Get a single call log by ID
  async getCallLog(id: string): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get call log by provider call ID
  async getCallByProviderId(providerCallId: string): Promise<CallLog | null> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('provider_call_id', providerCallId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new call log
  async createCallLog(call: CallLogInsert): Promise<CallLog> {
    const { data, error } = await supabase
      .from('call_logs')
      .insert(call)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a call log
  async updateCallLog(id: string, updates: Partial<CallLog>): Promise<CallLog> {
    const { data, error } = await supabase
      .from('call_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get call statistics
  async getCallStats(organizationId: string, dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('call_logs')
      .select('call_status, call_type, duration_seconds, appointment_set, call_sentiment')
      .eq('organization_id', organizationId);

    if (dateRange) {
      query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    const calls = data || [];
    const completedCalls = calls.filter(c => c.call_status === 'completed');
    const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

    return {
      totalCalls: calls.length,
      inboundCalls: calls.filter(c => c.call_type === 'inbound').length,
      outboundCalls: calls.filter(c => c.call_type === 'outbound').length,
      completedCalls: completedCalls.length,
      missedCalls: calls.filter(c => c.call_status === 'missed').length,
      failedCalls: calls.filter(c => c.call_status === 'failed').length,
      voicemailCalls: calls.filter(c => c.call_status === 'voicemail').length,
      appointmentsSet: calls.filter(c => c.appointment_set).length,
      totalMinutes: Math.round(totalDuration / 60),
      avgDuration: completedCalls.length > 0 ? Math.round(totalDuration / completedCalls.length) : 0,
      connectRate: calls.length > 0 ? Math.round((completedCalls.length / calls.length) * 100) : 0,
      sentimentBreakdown: {
        positive: calls.filter(c => c.call_sentiment === 'positive').length,
        neutral: calls.filter(c => c.call_sentiment === 'neutral').length,
        negative: calls.filter(c => c.call_sentiment === 'negative').length,
      },
    };
  },

  // Get recent calls for dashboard
  async getRecentCalls(organizationId: string, limit: number = 10): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get calls for a specific lead
  async getLeadCalls(leadId: string): Promise<CallLog[]> {
    const { data, error } = await supabase
      .from('call_logs')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
