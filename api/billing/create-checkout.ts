import type { VercelRequest, VercelResponse } from '../lib/types.js';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, organizationId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    // Guest checkout flow (no organization yet - user pays first, then signs up)
    if (!organizationId) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Collect customer email for later account linking
        customer_creation: 'always',
        billing_address_collection: 'required',
        metadata: {
          flow: 'guest_checkout',
          price_id: priceId,
        },
      });

      return res.status(200).json({ url: session.url });
    }

    // Existing organization checkout flow
    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('name, id')
        .eq('id', organizationId)
        .single();

      // Create Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          organization_id: organizationId,
        },
        name: org?.name || undefined,
      });

      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('subscriptions')
        .upsert({
          organization_id: organizationId,
          stripe_customer_id: customerId,
          plan_name: 'starter',
          status: 'incomplete',
        });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organization_id: organizationId,
        },
      },
      metadata: {
        organization_id: organizationId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
