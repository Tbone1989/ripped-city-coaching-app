// Email sending for coaching applications, via Resend.
//
// OFF BY DEFAULT: nothing is sent unless RESEND_API_KEY is set in the
// Vercel environment variables. Set EMAIL_ENABLED=false to force-disable
// even when a key is present.
//
// When the key lands, two emails light up automatically:
//   1. Confirmation to the prospect ("Application received" + what happens next)
//   2. Notification to the coach (rippedcityinc@mail.com) with a dashboard link
//
// Uses the Resend REST API directly (fetch) so no new npm dependency is
// needed and the build never breaks when the key is absent.
//
// Resend note: set RESEND_FROM_EMAIL to a sender address on a domain you
// have verified in Resend. The default onboarding@resend.dev only delivers
// to the Resend account owner's inbox.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_ENABLED = !!RESEND_API_KEY && process.env.EMAIL_ENABLED !== 'false';
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const COACH_EMAIL = 'rippedcityinc@mail.com';
const DASHBOARD_URL = 'https://ripped-city-coaching-app.vercel.app/';

export function isEmailEnabled() {
  return EMAIL_ENABLED;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail({ to, subject, html }) {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Resend error ${resp.status}: ${text}`);
  }
}

function prospectConfirmationHtml(name) {
  const safeName = escapeHtml(name);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="color: #b91c1c;">Application received.</h2>
      <p>Hi ${safeName},</p>
      <p>Thanks for applying to Ripped City Coaching. Your application is in.</p>
      <p><strong>What happens next:</strong> Tyrone reviews every application personally and will reach out to you directly.</p>
      <p style="color: #666; font-size: 13px;">— Ripped City Coaching</p>
    </div>`;
}

function coachNotificationHtml({ name, email, goal }) {
  const safe = (v) => escapeHtml(v) || '—';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
      <h2 style="color: #b91c1c;">New coaching application</h2>
      <p><strong>Name:</strong> ${safe(name)}</p>
      <p><strong>Email:</strong> ${safe(email)}</p>
      <p><strong>Goal:</strong> ${safe(goal)}</p>
      <p><a href="${DASHBOARD_URL}" style="color: #b91c1c; font-weight: bold;">Open the dashboard</a> to review and reach out.</p>
    </div>`;
}

// Sends both application emails. Safe no-op when email is disabled.
// Never throws to the caller for disabled state; throws on Resend failure
// so the caller can log it (callers must not fail the submission over email).
export async function sendApplicationEmails({ name, email, goal }) {
  if (!EMAIL_ENABLED) {
    return { sent: false, reason: 'email-disabled' };
  }
  await sendEmail({
    to: email,
    subject: 'Application received — Ripped City Coaching',
    html: prospectConfirmationHtml(name),
  });
  await sendEmail({
    to: COACH_EMAIL,
    subject: `New coaching application: ${name}`,
    html: coachNotificationHtml({ name, email, goal }),
  });
  return { sent: true };
}
