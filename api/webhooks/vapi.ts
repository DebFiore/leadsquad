// api/webhooks/vapi.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyVapiSignature, extractOrganizationId } from '../lib/webhookUtils.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

interface VapiCallEvent {
  message: {
    type: 'status-update' | 'end-of-call-report' | 'transcript' | 'function-call';
    call?: {
      id: string;
      type: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall';
      status: string;
      endedReason?: string;
      customer?: {
        number?: string;
      };
      phoneNumber?: {
        number?: string;
      };
      startedAt?: string;
      endedAt?: string;
      cost?: number;
      costBreakdown?: {
        total: number;
        voice: number;
        transport: number;
      };
      artifact?: {
        transcript?: string;
        recordingUrl?: string;
        summary?: string;
        messages?: Array<{
          role: 'assistant' | 'user';
          message: string;
          time: number;
          endTime: number;
        }>;
      };
      analysis?: {
        summary?: string;
        successEvaluation?: string;
        structuredData?: Record<string, any>;
      };
      assistantId?: string;
      metadata?: Record<string, any>;
    };
    status?: string;
    endedReason?: string;
    transcript?: string;
    artifact?: any;
    analysis?: any;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const buf = await buffer(req);
    const rawBody = buf.toString('utf8');
    const signature = req.headers['x-vapi-signature'] as string;

    // Verify signature if secret is configured
    if (process.env.VAPI_WEBHOOK_SECRET) {
      if (!signature || !verifyVapiSignature(rawBody, signature, process.env.VAPI_WEBHOOK_SECRET)) {
        console.error('Invalid Vapi webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event: VapiCallEvent = JSON.parse(rawBody);
    const { message } = event;
    const call = message.call;

    console.log('Vapi webhook event:', message.type, call?.id);

    if (!call) {
      return res.status(200).json({ received: true, note: 'No call data' });
    }

    // Extract organization ID
    let organizationId = extractOrganizationId(call.metadata || {});

    // Try to find from assistant if not in metadata
    if (!organizationId && call.assistantId) {
      const { data: agentSetting } = await supabase
        .from('agent_settings')
        .select('organization_id')
        .eq('vapi_assistant_id', call.assistantId)
        .single();
      
      organizationId = agentSetting?.organization_id;
    }

    if (!organizationId) {
      console.warn('No organization ID found for Vapi call:', call.id);
      return res.status(200).json({ received: true, warning: 'No organization ID' });
    }

    const phoneNumber = call.customer?.number || call.phoneNumber?.number || '';
    const campaignId = call.metadata?.campaign_id || null;
    let leadId = call.metadata?.lead_id || null;

    // Find lead if not provided
    if (!leadId && phoneNumber) {
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('phone_number', phoneNumber)
        .single();
      
      leadId = lead?.id || null;
    }

    switch (message.type) {
      case 'status-update': {
        if (message.status === 'in-progress') {
          // Call started
          await supabase.from('call_logs').upsert({
            provider_call_id: call.id,
            organization_id: organizationId,
            campaign_id: campaignId,
            lead_id: leadId,
            call_type: call.type === 'outboundPhoneCall' ? 'outbound' : 'inbound',
            call_status: 'in_progress',
            phone_number: phoneNumber,
            provider: 'vapi',
            started_at: call.startedAt || new Date().toISOString(),
          }, {
            onConflict: 'provider_call_id',
          });
        }
        break;
      }

      case 'end-of-call-report': {
        // Calculate duration
        let durationSeconds = 0;
        if (call.startedAt && call.endedAt) {
          durationSeconds = Math.round(
            (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000
          );
        }

        // Map ended reason to status
        const statusMap: Record<string, string> = {
          'customer-ended-call': 'completed',
          'assistant-ended-call': 'completed',
          'customer-did-not-answer': 'no_answer',
          'customer-busy': 'busy',
          'voicemail': 'voicemail',
          'error': 'failed',
          'silence-timeout': 'completed',
          'max-duration-reached': 'completed',
        };
        const callStatus = statusMap[call.endedReason || ''] || 'completed';

        // Parse transcript segments
        const transcriptSegments = call.artifact?.messages?.map(m => ({
          speaker: m.role === 'assistant' ? 'agent' : 'caller',
          text: m.message,
          start_time: m.time,
          end_time: m.endTime,
        })) || [];

        // Check for appointment in analysis
        const appointmentSet = call.analysis?.structuredData?.appointment_set || false;

        await supabase
          .from('call_logs')
          .update({
            call_status: callStatus,
            duration_seconds: durationSeconds,
            recording_url: call.artifact?.recordingUrl,
            transcript: call.artifact?.transcript,
            transcript_segments: transcriptSegments,
            call_summary: call.analysis?.summary || call.artifact?.summary,
            appointment_set: appointmentSet,
            cost_amount: call.cost || call.costBreakdown?.total || 0,
            ended_at: call.endedAt || new Date().toISOString(),
          })
          .eq('provider_call_id', call.id);

        // Update usage tracking
        if (durationSeconds > 0) {
          const today = new Date().toISOString().split('T')[0];
          const minutes = durationSeconds / 60;
          const cost = call.cost || call.costBreakdown?.total || 0;

          const { data: existing } = await supabase
            .from('billing_usage')
            .select('id, minutes_used, calls_made, cost_amount')
            .eq('organization_id', organizationId)
            .eq('usage_date', today)
            .eq('provider', 'vapi')
            .single();

          if (existing) {
            await supabase
              .from('billing_usage')
              .update({
                minutes_used: existing.minutes_used + minutes,
                calls_made: existing.calls_made + 1,
                calls_answered: callStatus === 'completed' ? existing.calls_made + 1 : existing.calls_made,
                cost_amount: existing.cost_amount + cost,
              })
              .eq('id', existing.id);
          } else {
            await supabase.from('billing_usage').insert({
              organization_id: organizationId,
              usage_date: today,
              provider: 'vapi',
              minutes_used: minutes,
              calls_made: 1,
              calls_answered: callStatus === 'completed' ? 1 : 0,
              cost_amount: cost,
            });
          }
        }

        // Update lead status
        if (appointmentSet && leadId) {
          await supabase
            .from('leads')
            .update({ lead_status: 'appointment_set' })
            .eq('id', leadId);
        } else if (callStatus === 'completed' && leadId) {
          await supabase
            .from('leads')
            .update({ 
              lead_status: 'contacted',
              last_call_date: new Date().toISOString(),
            })
            .eq('id', leadId);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Vapi webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
