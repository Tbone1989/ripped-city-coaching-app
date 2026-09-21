// Vercel serverless function: spam-guarded coaching application intake.
// The public site POSTs here instead of inserting into Supabase directly.
// Guards: honeypot field, minimum form-fill time (bots submit instantly),
// email validation, and per-IP rate limiting.
// Inserts with the anon key through the existing "Public can submit
// applications" RLS policy — no service-role key needed.
//
// POST body: {
//   client: { name, email, goal, status, paymentStatus, profile, intakeData, ... },
//   website: string (honeypot — must be empty),
//   loadedAt: number (ms timestamp of when the form was opened)
// }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Application emails (Resend) are OFF unless RESEND_API_KEY is set in Vercel.
// See api/lib/email.js. Sending never fails the submission.
import { sendApplicationEmails } from './lib/email.js';

// Per-instance sliding-window rate limiter (one layer of defense; Vercel may
// run several instances, so this is a hurdle, not a vault).
const hits = new Map(); // ip -> number[]
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  hits.set(ip, arr);
  // Trim the map so it can't grow forever.
  if (hits.size > 5000) {
    const oldest = [...hits.entries()].sort((a, b) => a[1][0] - b[1][0])[0];
    hits.delete(oldest[0]);
  }
  return false;
}

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

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(501).json({ error: 'Backend not configured.' });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.status(400).json({ error: 'Invalid request body.' });
    return;
  }

  // Honeypot: real users never fill this (it's visually hidden). Bots do.
  // Pretend success so the bot doesn't learn it was caught.
  if (body.website) {
    res.status(200).json({ ok: true });
    return;
  }

  // Time trap: a human needs at least a few seconds to fill 5 steps.
  const loadedAt = Number(body.loadedAt) || 0;
  if (!loadedAt || Date.now() - loadedAt < 3000) {
    res.status(429).json({ error: 'Please take a moment to complete the form before submitting.' });
    return;
  }

  const client = body.client || {};
  const name = String(client.name || '').trim();
  const email = String(client.email || '').trim().toLowerCase();
  if (!name || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid name and email are required.' });
    return;
  }

  if (rateLimited(clientIp(req))) {
    res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    return;
  }

  const row = {
    ...client,
    name,
    email,
    status: 'prospect',
    paymentStatus: 'unpaid',
  };

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Supabase insert failed:', resp.status, text);
      res.status(502).json({ error: 'Could not save your application. Please try again or email us directly.' });
      return;
    }
  } catch (e) {
    console.error('Application insert error:', e);
    res.status(502).json({ error: 'Could not save your application. Please try again or email us directly.' });
    return;
  }

  // F2/F3: confirmation email to the prospect + notification to the coach.
  // No-op when Resend isn't configured. Never fails the submission.
  try {
    await sendApplicationEmails({ name, email, goal: String(client.goal || '') });
  } catch (e) {
    console.error('Application email failed (submission still saved):', e);
  }

  res.status(200).json({ ok: true });
}
