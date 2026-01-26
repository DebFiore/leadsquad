// api/webhooks/n8n.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface N8NWebhookPayload {
  event: 'lead_created' | 'lead_updated' | 'call_completed' | 'appointment_set' | 'custom';
  organization_id?: string; // Now optional - derived from token
  data: Record<string, any>;
}

interface WebhookToken {
  organization_id: string;
  token_name: string;
  is_active: boolean;
}

/**
 * Validate token against database and return organization context
 */
async function validateWebhookToken(token: string): Promise<WebhookToken | null> {
  if (!token) return null;
  
  const { data, error } = await supabase
    .from('organization_webhook_tokens')
    .select('organization_id, token_name, is_active')
    .eq('token_value', token)
    .eq('is_active', true)
    .single();
  
  if (error || !data) return null;
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers['x-n8n-token'] as string || req.query.token as string;
    
    if (!token) {
      return res.status(401).json({ error: 'Missing x-n8n-token header' });
    }

    // Validate token against database
    const tokenRecord = await validateWebhookToken(token);
    
    if (!tokenRecord) {
      console.warn('Invalid or inactive N8N webhook token attempted');
      return res.status(401).json({ error: 'Invalid or inactive token' });
    }

    const payload: N8NWebhookPayload = req.body;
    
    // Use organization_id from token (override any payload value for security)
    const organizationId = tokenRecord.organization_id;
    
    console.log('N8N webhook event:', payload.event, '| Org:', organizationId, '| Workflow:', tokenRecord.token_name);

    switch (payload.event) {
      case 'lead_created': {
        const { first_name, last_name, email, phone_number, company, campaign_id, source } = payload.data;
        
        if (!phone_number) {
          return res.status(400).json({ error: 'Phone number is required' });
        }

        const { data: lead, error } = await supabase
          .from('leads')
          .insert({
            organization_id: organizationId,
            first_name,
            last_name,
            email,
            phone_number,
            company,
            campaign_id,
            lead_source: source || `n8n:${tokenRecord.token_name}`,
            lead_status: 'new',
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({ success: true, lead_id: lead.id, workflow: tokenRecord.token_name });
      }

      case 'lead_updated': {
        const { lead_id, ...updates } = payload.data;
        
        if (!lead_id) {
          return res.status(400).json({ error: 'Lead ID is required' });
        }

        const { error } = await supabase
          .from('leads')
          .update(updates)
          .eq('id', lead_id)
          .eq('organization_id', organizationId);

        if (error) throw error;

        return res.status(200).json({ success: true });
      }

      case 'call_completed': {
        // External system reporting a call completion
        const { 
          phone_number, 
          campaign_id, 
          duration_seconds, 
          outcome,
          notes,
          appointment_set,
        } = payload.data;

        // Find the lead
        const { data: lead } = await supabase
          .from('leads')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('phone_number', phone_number)
          .single();

        // Log the call
        await supabase.from('call_logs').insert({
          organization_id: organizationId,
          campaign_id,
          lead_id: lead?.id,
          call_type: 'outbound',
          call_status: 'completed',
          phone_number,
          provider: 'external',
          duration_seconds: duration_seconds || 0,
          outcome,
          call_summary: notes,
          appointment_set: appointment_set || false,
        });

        // Update lead if appointment was set
        if (appointment_set && lead) {
          await supabase
            .from('leads')
            .update({ lead_status: 'appointment_set' })
            .eq('id', lead.id);
        }

        return res.status(200).json({ success: true });
      }

      case 'appointment_set': {
        const { lead_id, appointment_datetime, notes } = payload.data;

        if (lead_id) {
          await supabase
            .from('leads')
            .update({ 
              lead_status: 'appointment_set',
              notes: notes ? `Appointment: ${appointment_datetime}\n${notes}` : `Appointment: ${appointment_datetime}`,
            })
            .eq('id', lead_id)
            .eq('organization_id', organizationId);
        }

        return res.status(200).json({ success: true });
      }

      case 'custom': {
        // Log custom event for processing
        await supabase.from('lead_events').insert({
          organization_id: organizationId,
          event_type: `n8n:${tokenRecord.token_name}`,
          event_data: payload.data,
          status: 'pending',
        });

        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: `Unknown event: ${payload.event}` });
    }
  } catch (error: any) {
    console.error('N8N webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
