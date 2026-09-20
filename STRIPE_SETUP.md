# Stripe billing setup — Ripped City Coaching

The code is done. Real Stripe checkout + automatic "mark as paid" are wired in.
Only these manual steps remain (they need your Stripe + Supabase logins):

## 1. Add 4 environment variables in Vercel

Vercel dashboard → project `ripped-city-coaching-app` → Settings → Environment Variables.
Add each one for **Production**:

| Variable | Where to get it |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys → Secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → Webhooks → add endpoint (step 2) → Signing secret (`whsec_...`) |
| `SUPABASE_URL` | Supabase dashboard → Project settings → API → Project URL (`https://neyopskwxstqpoogqumy.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project settings → API → service_role key (keep secret — server only) |

Then **redeploy** (Deployments → ⋯ → Redeploy) so the functions pick the keys up.

## 2. Register the webhook in Stripe

Stripe dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://ripped-city-coaching-app.vercel.app/api/stripe-webhook`
- Events: `checkout.session.completed`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET` (step 1).

## 3. Run the database fix (one time)

Supabase dashboard → SQL editor → paste the contents of
`supabase/migration-2026-09-19-application-fix.sql` → Run.
This adds the missing client columns, lets the public application form save,
and creates the `leads` table for the free Gut Health Blueprint.

## 4. Confirm it officially works

1. Open the coach dashboard → pick any prospect → onboarding checklist.
2. Enter an amount (e.g. `1.00` for a $1 test) → Generate Link.
3. Open the link in a private window, pay with Stripe test card `4242 4242 4242 4242`.
4. The client should flip to **Paid & Active** automatically within seconds.

Until step 4 passes with a real charge, billing is "wired but unconfirmed."
