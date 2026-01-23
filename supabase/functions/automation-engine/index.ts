import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// LeadEvent interface for reference - data structure in lead_events table

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, organization_id, lead_data } = await req.json()

    console.log(`Automation Engine received action: ${action}`)

    // Action: Process new web form submission
    if (action === 'process_new_lead') {
      // 1. Create the initial event record
      const { data: event, error: eventError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'web_form_inbound',
          event_data: lead_data,
          status: 'processing',
        })
        .select()
        .single()

      if (eventError) throw eventError

      console.log(`Created web_form_inbound event: ${event.id}`)

      // 2. Immediately trigger SMS response
      const { error: smsError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'sms_sent',
          event_data: {
            message: 'Thank you for reaching out! One of our team members will call you shortly.',
            phone: lead_data?.phone,
            triggered_by: event.id,
          },
          status: 'completed',
        })

      if (smsError) {
        console.error('Failed to create SMS event:', smsError)
      }

      // 3. Schedule call attempt (simulated 30-second delay via status)
      const { error: callError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.id || null,
          event_type: 'call_attempted',
          event_data: {
            scheduled_for: new Date(Date.now() + 30000).toISOString(),
            agent_role: 'outbound_lead',
            triggered_by: event.id,
          },
          status: 'pending',
        })

      if (callError) {
        console.error('Failed to schedule call:', callError)
      }

      // Update original event as processed
      await supabase
        .from('lead_events')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', event.id)

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: event.id,
        message: 'Lead processing initiated: SMS sent, call scheduled' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Process appointment booking confirmation
    if (action === 'confirm_appointment') {
      // Create appointment set event
      const { data: appointmentEvent, error: appointmentError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'appointment_set',
          event_data: {
            appointment_time: lead_data?.appointment_time,
            service: lead_data?.service,
            notes: lead_data?.notes,
          },
          status: 'completed',
        })
        .select()
        .single()

      if (appointmentError) throw appointmentError

      // Send confirmation SMS
      const { error: smsError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'sms_sent',
          event_data: {
            message: `Your appointment is confirmed for ${lead_data?.appointment_time}. We look forward to seeing you!`,
            phone: lead_data?.phone,
            type: 'appointment_confirmation',
            triggered_by: appointmentEvent.id,
          },
          status: 'completed',
        })

      if (smsError) {
        console.error('Failed to send confirmation SMS:', smsError)
      }

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: appointmentEvent.id,
        message: 'Appointment confirmed and SMS sent' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Schedule lead rework
    if (action === 'schedule_rework') {
      const { retry_count, max_retries, hours_between } = lead_data

      if (retry_count >= max_retries) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Max retries reached for this lead' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const nextAttemptTime = new Date(Date.now() + (hours_between * 60 * 60 * 1000))

      const { data: reworkEvent, error: reworkError } = await supabase
        .from('lead_events')
        .insert({
          organization_id,
          lead_id: lead_data?.lead_id || null,
          event_type: 'rework_scheduled',
          event_data: {
            retry_count: retry_count + 1,
            max_retries,
            scheduled_for: nextAttemptTime.toISOString(),
            reason: 'unanswered_call',
          },
          status: 'pending',
        })
        .select()
        .single()

      if (reworkError) throw reworkError

      return new Response(JSON.stringify({ 
        success: true, 
        event_id: reworkEvent.id,
        next_attempt: nextAttemptTime.toISOString(),
        message: `Rework scheduled: attempt ${retry_count + 1} of ${max_retries}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Get event statistics for an organization
    if (action === 'get_stats') {
      const { data: events, error: statsError } = await supabase
        .from('lead_events')
        .select('event_type, status')
        .eq('organization_id', organization_id)

      if (statsError) throw statsError

      const stats = {
        total: events?.length || 0,
        by_type: {} as Record<string, number>,
        by_status: {} as Record<string, number>,
      }

      events?.forEach(event => {
        stats.by_type[event.event_type] = (stats.by_type[event.event_type] || 0) + 1
        stats.by_status[event.status] = (stats.by_status[event.status] || 0) + 1
      })

      return new Response(JSON.stringify({ success: true, stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('Automation engine error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
