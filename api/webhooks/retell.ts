// api/webhooks/retell.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyRetellSignature, extractOrganizationId } from '../lib/webhookUtils.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

interface RetellCallEvent {
  event: 'call_started' | 'call_ended' | 'call_analyzed';
  call: {
    call_id: string;
    call_type: 'inbound' | 'outbound' | 'web_call';
    agent_id: string;
    from_number?: string;
    to_number?: string;
    direction?: string;
    call_status: string;
    start_timestamp?: number;
    end_timestamp?: number;
    duration_ms?: number;
    recording_url?: string;
    transcript?: string;
    transcript_object?: Array<{
      role: 'agent' | 'user';
      content: string;
      words?: Array<{ word: string; start: number; end: number }>;
    }>;
    call_analysis?: {
      call_summary?: string;
      user_sentiment?: 'positive' | 'neutral' | 'negative';
      call_successful?: boolean;
      custom_analysis_data?: Record<string, any>;
    };
    metadata?: Record<string, any>;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');
    const signature = req.headers['x-retell-signature'] as string;

    // Verify signature if secret is configured
    if (process.env.RETELL_WEBHOOK_SECRET) {
      if (!signature || !verifyRetellSignature(rawBody, signature, process.env.RETELL_WEBHOOK_SECRET)) {
        console.error('Invalid Retell webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event: RetellCallEvent = JSON.parse(rawBody);
    console.log('Retell webhook event:', event.event, event.call.call_id);

    const { call } = event;
    
    // Extract organization ID from agent metadata
    let organizationId = extractOrganizationId(call.metadata || {});
    
    // If not in metadata, try to find from agent_settings
    if (!organizationId && call.agent_id) {
      const { data: agentSetting } = await supabase
        .from('agent_settings')
        .select('organization_id')
        .eq('retell_agent_id', call.agent_id)
        .single();
      
      organizationId = agentSetting?.organization_id;
    }

    if (!organizationId) {
      console.warn('No organization ID found for call:', call.call_id);
      return res.status(200).json({ received: true, warning: 'No organization ID' });
    }

    // Find campaign and lead if available
    const phoneNumber = call.call_type === 'outbound' ? call.to_number : call.from_number;
    let campaignId = call.metadata?.campaign_id || null;
    let leadId = call.metadata?.lead_id || null;

    // Try to find lead by phone number if not provided
    if (!leadId && phoneNumber) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id, campaign_id')
        .eq('organization_id', organizationId)
        .eq('phone_number', phoneNumber)
        .single();
      
      if (lead) {
        leadId = lead.id;
        campaignId = campaignId || lead.campaign_id;
      }
    }

    switch (event.event) {
      case 'call_started': {
        // Insert call log with initial status
        await supabase.from('call_logs').upsert({
          provider_call_id: call.call_id,
          organization_id: organizationId,
          campaign_id: campaignId,
          lead_id: leadId,
          call_type: call.call_type === 'outbound' ? 'outbound' : 'inbound',
          call_status: 'in_progress',
          phone_number: phoneNumber || '',
          from_number: call.from_number,
          provider: 'retell',
          started_at: call.start_timestamp 
            ? new Date(call.start_timestamp).toISOString() 
            : new Date().toISOString(),
        }, {
          onConflict: 'provider_call_id',
        });
        break;
      }

      case 'call_ended': {
        const durationSeconds = call.duration_ms 
          ? Math.round(call.duration_ms / 1000) 
          : 0;

        // Map Retell status to our status
        const statusMap: Record<string, string> = {
          'ended': 'completed',
          'error': 'failed',
          'busy': 'busy',
          'no-answer': 'no_answer',
          'voicemail': 'voicemail',
        };
        const callStatus = statusMap[call.call_status] || 'completed';

        // Update call log
        await supabase
          .from('call_logs')
          .update({
            call_status: callStatus,
            duration_seconds: durationSeconds,
            recording_url: call.recording_url,
            ended_at: call.end_timestamp 
              ? new Date(call.end_timestamp).toISOString() 
              : new Date().toISOString(),
          })
          .eq('provider_call_id', call.call_id);

        // Update usage tracking
        if (durationSeconds > 0) {
          const today = new Date().toISOString().split('T')[0];
          const minutes = durationSeconds / 60;
          
          // Upsert daily usage
          const { data: existing } = await supabase
            .from('billing_usage')
            .select('id, minutes_used, calls_made')
            .eq('organization_id', organizationId)
            .eq('usage_date', today)
            .eq('provider', 'retell')
            .single();

          if (existing) {
            await supabase
              .from('billing_usage')
              .update({
                minutes_used: existing.minutes_used + minutes,
                calls_made: existing.calls_made + 1,
                calls_answered: callStatus === 'completed' ? existing.calls_made + 1 : existing.calls_made,
              })
              .eq('id', existing.id);
          } else {
            await supabase.from('billing_usage').insert({
              organization_id: organizationId,
              usage_date: today,
              provider: 'retell',
              minutes_used: minutes,
              calls_made: 1,
              calls_answered: callStatus === 'completed' ? 1 : 0,
            });
          }
        }
        break;
      }

      case 'call_analyzed': {
        // Update with transcript and analysis
        const transcriptSegments = call.transcript_object?.map(t => ({
          speaker: t.role === 'agent' ? 'agent' : 'caller',
          text: t.content,
          start_time: t.words?.[0]?.start || 0,
          end_time: t.words?.[t.words.length - 1]?.end || 0,
        })) || [];

        const analysis = call.call_analysis;
        const appointmentSet = analysis?.custom_analysis_data?.appointment_set || false;

        await supabase
          .from('call_logs')
          .update({
            transcript: call.transcript,
            transcript_segments: transcriptSegments,
            call_summary: analysis?.call_summary,
            call_sentiment: analysis?.user_sentiment,
            appointment_set: appointmentSet,
            key_topics: analysis?.custom_analysis_data?.topics || [],
          })
          .eq('provider_call_id', call.call_id);

        // Update lead status if appointment was set
        if (appointmentSet && leadId) {
          await supabase
            .from('leads')
            .update({ lead_status: 'appointment_set' })
            .eq('id', leadId);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Retell webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
