// api/usage/aggregate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This endpoint can be called by a cron job to aggregate daily usage
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify internal token
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (token !== process.env.INTERNAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const targetDate = req.body.date || formatDate(subDays(new Date(), 1));
    console.log('Aggregating usage for:', targetDate);

    // Get all organizations
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id');

    if (!organizations) {
      return res.status(200).json({ message: 'No organizations found' });
    }

    const startOfTargetDay = startOfDay(new Date(targetDate)).toISOString();
    const endOfTargetDay = endOfDay(new Date(targetDate)).toISOString();

    for (const org of organizations) {
      // Get call logs for the day grouped by provider
      const { data: calls } = await supabase
        .from('call_logs')
        .select('provider, duration_seconds, call_status, cost_amount')
        .eq('organization_id', org.id)
        .gte('created_at', startOfTargetDay)
        .lte('created_at', endOfTargetDay);

      if (!calls || calls.length === 0) continue;

      // Group by provider
      const byProvider: Record<string, {
        minutes: number;
        calls: number;
        answered: number;
        cost: number;
      }> = {};

      for (const call of calls) {
        const provider = call.provider || 'unknown';
        if (!byProvider[provider]) {
          byProvider[provider] = { minutes: 0, calls: 0, answered: 0, cost: 0 };
        }
        
        byProvider[provider].minutes += (call.duration_seconds || 0) / 60;
        byProvider[provider].calls += 1;
        byProvider[provider].answered += call.call_status === 'completed' ? 1 : 0;
        byProvider[provider].cost += call.cost_amount || 0;
      }

      // Upsert usage records
      for (const [provider, usage] of Object.entries(byProvider)) {
        await supabase.from('billing_usage').upsert({
          organization_id: org.id,
          usage_date: targetDate,
          provider,
          minutes_used: usage.minutes,
          calls_made: usage.calls,
          calls_answered: usage.answered,
          cost_amount: usage.cost,
        }, {
          onConflict: 'organization_id,usage_date,provider',
        });
      }
    }

    return res.status(200).json({ 
      success: true, 
      date: targetDate,
      organizations_processed: organizations.length,
    });
  } catch (error: any) {
    console.error('Usage aggregation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
