// Coaching agreement text: single source of truth for the seeded DRAFT.
// The coach can edit this in Dashboard → Settings; edits are saved to the
// `preferences` table under AGREEMENT_PREFERENCE_KEY. The client portal
// reads the saved text and falls back to DEFAULT_AGREEMENT_TEXT.

export const AGREEMENT_PREFERENCE_KEY = 'coaching_agreement_text';

export const DEFAULT_AGREEMENT_TEXT = `DRAFT — FOR TYRONE'S REVIEW. THIS IS NOT LEGAL ADVICE.

RIPPED CITY COACHING AGREEMENT (DRAFT)

1. WHAT COACHING IS
Coaching is guidance on training, nutrition, and lifestyle based on your goals and the information you provide. It is not medical advice, diagnosis, or treatment. Talk to your doctor before changing your training, diet, or supplements, especially if you have a health condition.

2. HOW WE WORK
You get a personalized plan and bi-weekly check-ins, with adjustments based on your progress. Results depend on your consistency — no specific outcome is promised or guaranteed.

3. PAYMENT
Coaching fees are discussed and agreed with you before any payment is taken. Payments are due as agreed. Missed payments may pause your coaching until resolved.

4. CANCELLATION
Either side can end the coaching relationship at any time. If you cancel, tell your coach in writing (email is fine). Fees already paid for coaching already delivered are not refundable unless we agree otherwise in writing.

5. YOUR RESPONSIBILITY
Give accurate health information, train safely, and speak up right away if something feels wrong.

By accepting below, you confirm you have read this agreement and agree to these terms.`;

// Load the coach-edited agreement text from the preferences table.
// Falls back to the seeded DRAFT if there is no saved value or the
// read fails (e.g. RLS) — the client always sees *something*.
export async function loadAgreementText(supabase: any): Promise<string> {
  try {
    if (!supabase) return DEFAULT_AGREEMENT_TEXT;
    const { data, error } = await supabase
      .from('preferences')
      .select('value')
      .eq('key', AGREEMENT_PREFERENCE_KEY)
      .maybeSingle();
    if (error || !data?.value) return DEFAULT_AGREEMENT_TEXT;
    return String(data.value);
  } catch {
    return DEFAULT_AGREEMENT_TEXT;
  }
}
