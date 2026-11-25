import { Suspense } from 'react';
import { ActionForm } from '@/components/action-form';
import { CampaignShell, CampaignSetupNotice, CampaignCards, CampaignHighlights } from '@/components/campaign-ui';
import { requireCreatorAccount, campaignSetupMissing } from '@/lib/campaign-account';
import { currencyDigits, southAfricaToday, type CampaignSummary, type Deliverable } from '@/lib/campaigns';
import { createCampaign } from './actions';

export const metadata = { title: 'Private campaign tracker | Mzansi Collab' };
async function Campaigns() {
  const { supabase } = await requireCreatorAccount();
  const [summary, due] = await Promise.all([
    supabase.rpc('creator_campaign_summary'),
    supabase.from('campaign_deliverables').select('id,campaign_id,title,due_on,published_at').is('published_at', null).order('due_on').order('id').limit(5),
  ]);
  const error = summary.error || due.error;
  if (campaignSetupMissing(error)) return <CampaignShell title="Campaign tracker"><CampaignSetupNotice /></CampaignShell>;
  if (error) throw new Error('Campaign records could not load.');
  const deals = (summary.data ?? []) as CampaignSummary[], today = southAfricaToday();
  return <CampaignShell title="Campaign tracker">
    <section className="workspace-section"><CampaignHighlights deals={deals} due={(due.data ?? []) as Deliverable[]} today={today} /></section>
    <section className="workspace-section"><h2>Your deals</h2><CampaignCards deals={deals} today={today} /></section>
    <section className="workspace-section" id="new-deal"><p className="eyebrow eyebrow-dark">Keep the agreement in one place</p><h2>Record a brand deal</h2><ActionForm action={createCampaign} submit="Create private deal">
      <div className="field-row"><label>Brand name<input name="brand_name" required maxLength={120} placeholder="The brand you’re working with" /></label><label>Deal title<input name="title" required maxLength={160} placeholder="Summer launch campaign" /></label></div>
      <div className="field-row"><label>Deal currency<select name="currency" defaultValue="ZAR">{Object.entries(currencyDigits).map(([code, digits]) => <option key={code} value={code}>{code} · {digits} decimal places</option>)}</select></label><label>Total agreed fee<input name="amount" inputMode="decimal" required maxLength={18} placeholder="3000.00" /><small>Use a decimal point without currency symbols or separators.</small></label></div>
      <label>Payment due date <span>(optional)</span><input name="payment_due_on" type="date" min="2000-01-01" max="2100-12-31" /></label>
      <label>Private notes <span>(optional)</span><textarea name="notes" maxLength={2000} rows={3} placeholder="Scope, usage rights or agreed payment terms" /></label>
      <p className="field-help">Choose the agreed fee and currency carefully; this first version keeps them fixed. Payments are manual records of money already received, not charges or transfers.</p>
    </ActionForm></section>
  </CampaignShell>;
}
export default function Page() { return <Suspense fallback={<p className="loading">Opening your campaigns…</p>}><Campaigns /></Suspense>; }
