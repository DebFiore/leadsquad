// api/health.ts
import type { VercelRequest, VercelResponse } from './lib/types.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {};

  // Check Supabase
  try {
    const start = Date.now();
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    await supabase.from('organizations').select('id').limit(1);
    checks.supabase = { status: 'ok', latency: Date.now() - start };
  } catch (error: any) {
    checks.supabase = { status: 'error', error: error.message };
  }

  // Check environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingEnvVars.length === 0) {
    checks.environment = { status: 'ok' };
  } else {
    checks.environment = { status: 'error', error: `Missing: ${missingEnvVars.join(', ')}` };
  }

  const allOk = Object.values(checks).every(c => c.status === 'ok');

  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  });
}
