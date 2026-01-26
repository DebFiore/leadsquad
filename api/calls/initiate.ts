// api/calls/initiate.ts
import type { VercelRequest, VercelResponse } from '../lib/types.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InitiateCallRequest {
  organization_id: string;
  lead_id: string;
  campaign_id?: string;
  agent_id?: string;
  phone_number: string;
  from_number?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: InitiateCallRequest = req.body;

    if (!body.organization_id || !body.phone_number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get agent settings to determine provider
    let agentSetting = null;
    
    if (body.agent_id) {
      const { data } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('id', body.agent_id)
        .single();
      agentSetting = data;
    } else {
      // Get default outbound agent
      const { data } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('organization_id', body.organization_id)
        .eq('agent_role', 'outbound_lead')
        .eq('is_enabled', true)
        .single();
      agentSetting = data;
    }

    if (!agentSetting) {
      return res.status(400).json({ error: 'No active agent found' });
    }

    // Get provider credentials
    const { data: providerSettings } = await supabase
      .from('provider_settings')
      .select('*')
      .eq('organization_id', body.organization_id)
      .eq('provider', agentSetting.provider || 'retell')
      .single();

    if (!providerSettings?.api_key) {
      return res.status(400).json({ error: 'Provider not configured' });
    }

    let callResult;
    const provider = agentSetting.provider || 'retell';

    if (provider === 'retell') {
      // Initiate Retell call
      const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${providerSettings.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentSetting.retell_agent_id,
          to_number: body.phone_number,
          from_number: body.from_number || agentSetting.phone_number,
          metadata: {
            organization_id: body.organization_id,
            campaign_id: body.campaign_id,
            lead_id: body.lead_id,
          },
        }),
      });

      callResult = await response.json();

      if (!response.ok) {
        throw new Error(callResult.message || 'Failed to initiate Retell call');
      }
    } else if (provider === 'vapi') {
      // Initiate Vapi call
      const response = await fetch('https://api.vapi.ai/call/phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${providerSettings.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: agentSetting.vapi_assistant_id,
          customer: {
            number: body.phone_number,
          },
          phoneNumberId: body.from_number || agentSetting.phone_number,
          metadata: {
            organization_id: body.organization_id,
            campaign_id: body.campaign_id,
            lead_id: body.lead_id,
          },
        }),
      });

      callResult = await response.json();

      if (!response.ok) {
        throw new Error(callResult.message || 'Failed to initiate Vapi call');
      }
    } else {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` });
    }

    // Create initial call log entry
    const callId = callResult.call_id || callResult.id;
    
    await supabase.from('call_logs').insert({
      provider_call_id: callId,
      organization_id: body.organization_id,
      campaign_id: body.campaign_id,
      lead_id: body.lead_id,
      call_type: 'outbound',
      call_status: 'initiated',
      phone_number: body.phone_number,
      from_number: body.from_number || agentSetting.phone_number,
      provider,
    });

    // Update lead last call date
    if (body.lead_id) {
      await supabase
        .from('leads')
        .update({
          last_call_date: new Date().toISOString(),
        })
        .eq('id', body.lead_id);
    }

    return res.status(200).json({
      success: true,
      call_id: callId,
      provider,
    });
  } catch (error: any) {
    console.error('Call initiation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
