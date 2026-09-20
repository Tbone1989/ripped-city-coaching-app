// Vercel serverless function: Stripe webhook.
// Marks the client as paid + active when their Checkout Session completes.
// Env required on Vercel: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// In the Stripe dashboard, point a webhook at https://<your-app>.vercel.app/api/stripe-webhook
// and subscribe it to the "checkout.session.completed" event.

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    res.status(501).json({ error: 'Webhook not configured.' });
    return;
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const clientId = session.metadata && session.metadata.client_id;
    if (clientId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const resp = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/clients?id=eq.${encodeURIComponent(clientId)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              paymentStatus: 'paid',
              status: 'active',
              payments: [{ amount: (session.amount_total || 0) / 100, date: new Date().toISOString(), stripeSessionId: session.id }],
            }),
          }
        );
        if (!resp.ok) console.error('Supabase update failed:', await resp.text());
      } catch (err) {
        console.error('Supabase update error:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}
