import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable body parsing, we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const PLAN_LIMITS: Record<string, { minutes: number; calls: number; leads: number }> = {
  'price_starter_monthly': { minutes: 100, calls: 500, leads: 500 },
  'price_professional_monthly': { minutes: 500, calls: 2500, leads: 5000 },
  'price_enterprise_monthly': { minutes: 2000, calls: 10000, leads: -1 },
};

const PRICE_TO_PLAN: Record<string, string> = {
  'price_starter_monthly': 'starter',
  'price_professional_monthly': 'professional',
  'price_enterprise_monthly': 'enterprise',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        
        if (organizationId && session.subscription) {
          // Retrieve the subscription to get the price
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const priceId = subscription.items.data[0]?.price.id;
          const limits = PLAN_LIMITS[priceId] || PLAN_LIMITS['price_starter_monthly'];
          const planName = PRICE_TO_PLAN[priceId] || 'starter';

          await supabase
            .from('subscriptions')
            .upsert({
              organization_id: organizationId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              stripe_price_id: priceId,
              plan_name: planName,
              status: 'active',
              monthly_minutes_limit: limits.minutes,
              monthly_calls_limit: limits.calls,
              monthly_leads_limit: limits.leads,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        
        if (organizationId) {
          const priceId = subscription.items.data[0]?.price.id;
          const limits = PLAN_LIMITS[priceId] || PLAN_LIMITS['price_starter_monthly'];
          const planName = PRICE_TO_PLAN[priceId] || 'starter';

          await supabase
            .from('subscriptions')
            .update({
              stripe_price_id: priceId,
              plan_name: planName,
              status: subscription.status,
              monthly_minutes_limit: limits.minutes,
              monthly_calls_limit: limits.calls,
              monthly_leads_limit: limits.leads,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at: subscription.cancel_at 
                ? new Date(subscription.cancel_at * 1000).toISOString() 
                : null,
              cancelled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription as string);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Reset usage counters on successful payment (new billing period)
          await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              minutes_used_current_cycle: 0,
              calls_used_current_cycle: 0,
            })
            .eq('stripe_subscription_id', invoice.subscription as string);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
