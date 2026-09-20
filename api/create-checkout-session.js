// Vercel serverless function: create a real Stripe Checkout Session for a client.
// Env required on Vercel: STRIPE_SECRET_KEY
// POST body: { clientId, email, name, amountCents, description }

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(501).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to the Vercel environment variables.' });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { clientId, email, name, amountCents, description } = body;
  const amount = parseInt(amountCents, 10);
  if (!clientId || !amount || amount < 50) {
    res.status(400).json({ error: 'A valid clientId and an amount of at least $0.50 are required.' });
    return;
  }

  try {
    const origin = req.headers.origin || 'https://ripped-city-coaching-app.vercel.app';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Ripped City Coaching',
              description: name ? `Client: ${name}` : undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { client_id: String(clientId) },
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });
    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message || 'Could not create checkout session' });
  }
}
