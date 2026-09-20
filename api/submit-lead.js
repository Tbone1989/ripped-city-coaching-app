// Vercel serverless function: spam-guarded lead-magnet email capture.
// Same guards as submit-application: honeypot, minimum fill time,
// email validation, per-IP rate limiting.
// Inserts with the anon key through the "Public can join lead magnet" policy.
//
// POST body: {
//   email: string,
//   source: string,
//   website: string (honeypot — must be empty),
//   loadedAt: number (ms timestamp of when the form was shown)
// }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const hits = new Map(); // ip -> number[]
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  hits.set(ip, arr);
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

  // Honeypot — silently accept so bots learn nothing.
  if (body.website) {
    res.status(200).json({ ok: true });
    return;
  }

  const loadedAt = Number(body.loadedAt) || 0;
  if (!loadedAt || Date.now() - loadedAt < 2000) {
    res.status(429).json({ error: 'Please wait a moment before requesting the guide.' });
    return;
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'A valid email is required.' });
    return;
  }

  if (rateLimited(clientIp(req))) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([{ email, source: String(body.source || 'website').slice(0, 80) }]),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Supabase lead insert failed:', resp.status, text);
      // Never block the freebie: report ok so the guide still downloads.
      res.status(200).json({ ok: true, captured: false });
      return;
    }
  } catch (e) {
    console.error('Lead insert error:', e);
    res.status(200).json({ ok: true, captured: false });
    return;
  }

  res.status(200).json({ ok: true, captured: true });
}
