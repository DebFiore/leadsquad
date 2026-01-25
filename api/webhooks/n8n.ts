// api/webhooks/n8n.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyN8NToken } from '../lib/webhookUtils';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface N8NWebhookPayload {
  event: 'lead_created' | 'lead_updated' | 'call_completed' | 'appointment_set' | 'custom';
  organization_id: string;
  data: Record<string, any>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify webhook token
    const token = req.headers['x-n8n-token'] as string || req.query.token as string;
    
    if (process.env.N8N_WEBHOOK_SECRET) {
      if (!verifyN8NToken(token, process.env.N8N_WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    const payload: N8NWebhookPayload = req.body;
    console.log('N8N webhook event:', payload.event);

    if (!payload.organization_id) {
      return res.status(400).json({ error: 'Missing organization_id' });
    }

    switch (payload.event) {
      case 'lead_created': {
        const { first_name, last_name, email, phone_number, company, campaign_id, source } = payload.data;
        
        if (!phone_number) {
          return res.status(400).json({ error: 'Phone number is required' });
        }

        const { data: lead, error } = await supabase
          .from('leads')
          .insert({
            organization_id: payload.organization_id,
            first_name,
            last_name,
            email,
            phone_number,
            company,
            campaign_id,
            lead_source: source || 'n8n',
            lead_status: 'new',
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({ success: true, lead_id: lead.id });
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
          .eq('organization_id', payload.organization_id);

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
          .eq('organization_id', payload.organization_id)
          .eq('phone_number', phone_number)
          .single();

        // Log the call
        await supabase.from('call_logs').insert({
          organization_id: payload.organization_id,
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
            .eq('organization_id', payload.organization_id);
        }

        return res.status(200).json({ success: true });
      }

      case 'custom': {
        // Log custom event for processing
        await supabase.from('lead_events').insert({
          organization_id: payload.organization_id,
          event_type: 'n8n_custom',
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
