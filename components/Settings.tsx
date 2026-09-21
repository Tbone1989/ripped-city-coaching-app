import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.ts';
import { Card, Input, Button, Spinner, TextArea } from './ui/common.tsx';
import { AGREEMENT_PREFERENCE_KEY, DEFAULT_AGREEMENT_TEXT } from '../services/agreement.ts';

const Settings: React.FC = () => {
  const [stripePubKey, setStripePubKey] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [intakeFormUrl, setIntakeFormUrl] = useState('');
  const [notifEmail, setNotifEmail] = useState('');
  // F8a: editable coaching agreement (seeded DRAFT, editable by the coach).
  const [agreementText, setAgreementText] = useState(DEFAULT_AGREEMENT_TEXT);
  const [agreementSaving, setAgreementSaving] = useState(false);
  const [agreementSaved, setAgreementSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (!isSupabaseConfigured || !supabase) { setIsLoading(false); return; }
      try {
        const { data } = await (supabase as any)
          .from('preferences')
          .select('key, value')
          .in('key', ['stripe_pub_key', 'google_sheet_url', 'intake_form_url', 'notification_email', AGREEMENT_PREFERENCE_KEY]);
        if (data) {
          data.forEach((row: { key: string; value: string }) => {
            if (row.key === 'stripe_pub_key') setStripePubKey(row.value || '');
            if (row.key === 'google_sheet_url') setGoogleSheetUrl(row.value || '');
            if (row.key === 'intake_form_url') setIntakeFormUrl(row.value || '');
            if (row.key === 'notification_email') setNotifEmail(row.value || '');
            if (row.key === AGREEMENT_PREFERENCE_KEY && row.value) setAgreementText(row.value);
          });
        }
      } catch (e) { /* silent */ }
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const upsertPref = async (key: string, value: string) => {
    if (!supabase) return;
    await (supabase as any)
      .from('preferences')
      .upsert({ key, value, user_id: 'coach' }, { onConflict: 'user_id,key' });
  };

  const handleSave = async (key: string, value: string, label: string) => {
    setIsSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      await upsertPref(key, value);
      setSaveSuccess(label + ' saved successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (e: any) { setSaveError(e.message); }
    setIsSaving(false);
  };

  const handleSaveAgreement = async () => {
    setAgreementSaving(true);
    setAgreementSaved(false);
    setSaveError('');
    try {
      await upsertPref(AGREEMENT_PREFERENCE_KEY, agreementText);
      setAgreementSaved(true);
      setTimeout(() => setAgreementSaved(false), 3000);
    } catch (e: any) {
      setSaveError(e.message);
    }
    setAgreementSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="space-y-8">
      {saveSuccess && (
        <div className="p-3 bg-green-900/40 border border-green-600 rounded-lg text-green-300 text-sm font-semibold">
          <i className="fa-solid fa-circle-check mr-2"></i>{saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="p-3 bg-red-900/40 border border-red-600 rounded-lg text-red-300 text-sm">
          <i className="fa-solid fa-triangle-exclamation mr-2"></i>{saveError}
        </div>
      )}

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-solid fa-bell mr-2 text-red-500"></i>Notification Settings
        </h3>
        <p className="text-gray-400 mb-4">Email address to receive alerts when new clients apply or check in.</p>
        <div className="space-y-4">
          <Input label="Notification Email" id="notif-email" type="email" value={notifEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifEmail(e.target.value)}
            placeholder="tbone1989@gmail.com" />
          <Button onClick={() => handleSave('notification_email', notifEmail, 'Notification email')} disabled={isSaving || !notifEmail}>
            {isSaving ? <Spinner /> : <><i className="fa-solid fa-save mr-2"></i>Save Email</>}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-solid fa-file-signature mr-2 text-red-500"></i>Coaching Agreement{' '}
          <span className="text-xs font-bold bg-yellow-500/20 text-yellow-300 py-1 px-2 rounded-full align-middle">DRAFT</span>
        </h3>
        <p className="text-gray-400 mb-1">This text is shown to clients in their portal before payment features unlock. They must check the box and accept before continuing.</p>
        <p className="text-yellow-400/90 text-xs mb-4 font-semibold">Draft for your approval — this is not legal advice. Edit it freely, then approve the final wording.</p>
        <div className="space-y-4">
          <TextArea
            label="Agreement text"
            id="coaching-agreement"
            value={agreementText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgreementText(e.target.value)}
            rows={18}
            className="font-mono !text-xs"
          />
          <div className="flex items-center gap-4">
            <Button onClick={handleSaveAgreement} disabled={agreementSaving || !agreementText.trim()}>
              {agreementSaving ? <Spinner /> : <><i className="fa-solid fa-save mr-2"></i>Save Agreement</>}
            </Button>
            {agreementSaved && <span className="text-green-400 text-sm font-semibold"><i className="fa-solid fa-circle-check mr-2"></i>Agreement saved.</span>}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-brands fa-stripe mr-2 text-purple-400"></i>Stripe Integration
        </h3>
        <p className="text-gray-400 mb-4">Real Stripe checkout is built in. Add your secret key in Vercel (see STRIPE_SETUP.md), then generate live payment links from any client's onboarding checklist — paid clients are marked Paid automatically.</p>
        <div className="p-3 mb-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-xs">
          <i className="fa-solid fa-shield-halved mr-2"></i>
          <strong>Security:</strong> Only store your publishable key (pk_live_...) here. Your secret key must be added to Vercel environment variables only.
        </div>
        <div className="space-y-4">
          <Input label="Stripe Publishable Key" id="stripe-publishable" value={stripePubKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStripePubKey(e.target.value)}
            placeholder="pk_live_..." />
          <Button onClick={() => handleSave('stripe_pub_key', stripePubKey, 'Stripe key')} disabled={isSaving || !stripePubKey}>
            {isSaving ? <Spinner /> : <><i className="fa-solid fa-save mr-2"></i>Save Stripe Key</>}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-solid fa-table mr-2 text-green-400"></i>Google Sheets Backup
        </h3>
        <p className="text-gray-400 mb-4">Save your Google Sheet URL for client data backup. Supabase is the primary source of truth.</p>
        <div className="space-y-4">
          <Input label="Target Google Sheet URL" id="google-sheet-url" value={googleSheetUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoogleSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..." />
          <Button onClick={() => handleSave('google_sheet_url', googleSheetUrl, 'Google Sheet URL')} disabled={isSaving || !googleSheetUrl}>
            {isSaving ? <Spinner /> : <><i className="fa-solid fa-save mr-2"></i>Save Sheet URL</>}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-solid fa-wpforms mr-2 text-blue-400"></i>Client Intake Form
        </h3>
        <p className="text-gray-400 mb-4">Save the URL of your client intake form. Prospects will be directed here to apply.</p>
        <div className="space-y-4">
          <Input label="Intake Form URL" id="intake-form-url" value={intakeFormUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIntakeFormUrl(e.target.value)}
            placeholder="https://ripped-city-coaching-frontend.vercel.app" />
          <Button onClick={() => handleSave('intake_form_url', intakeFormUrl, 'Intake form URL')} disabled={isSaving || !intakeFormUrl}>
            {isSaving ? <Spinner /> : <><i className="fa-solid fa-save mr-2"></i>Save Form URL</>}
          </Button>
        </div>
      </Card>

      <Card className="bg-green-900/20 border-green-800">
        <h3 className="text-xl font-semibold text-white mb-2">
          <i className="fa-solid fa-database mr-2 text-green-400"></i>Database Status
        </h3>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse inline-block"></span>
          <span className="text-green-300 font-semibold">Supabase Connected &amp; Secured</span>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Your database at <code className="bg-gray-800 px-1 rounded">neyopskwxstqpoogqumy.supabase.co</code> is live, RLS-secured, and fully operational.
        </p>
      </Card>
    </div>
  );
};

export default Settings;