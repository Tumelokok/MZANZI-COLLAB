import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/action-form';
import { CampaignShell, CampaignSetupNotice } from '@/components/campaign-ui';
import { requireCreatorAccount, campaignSetupMissing } from '@/lib/campaign-account';
import { money, dealDate, deadlineLabel, southAfricaToday, uuidPattern, type CampaignSummary, type Deliverable, type CampaignPayment } from '@/lib/campaigns';
import { addDeliverable, setPublished, recordPayment } from '../actions';

export const metadata = { title: 'Private brand deal | Mzansi Collab' };
async function Deal({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireCreatorAccount();
  const { id } = await params;
  if (!uuidPattern.test(id)) notFound();
  const [campaign, summary] = await Promise.all([
    supabase.from('creator_campaigns').select('id,notes').eq('id', id).maybeSingle(),
    supabase.rpc('creator_campaign_summary'),
  ]);
  const error = campaign.error || summary.error;
  if (campaignSetupMissing(error)) return <CampaignShell title="Brand deal"><CampaignSetupNotice /></CampaignShell>;
  if (error) throw new Error('This deal could not load.');
  // A guessed ID belonging to someone else is indistinguishable from a missing record.
  if (!campaign.data) notFound();
  const deal = (summary.data as CampaignSummary[]).find(row => row.id === id);
  if (!deal) notFound();
  const [deliverablesResult, paymentsResult] = await Promise.all([
    supabase.from('campaign_deliverables').select('id,campaign_id,title,due_on,published_at').eq('campaign_id', id).order('due_on').order('id'),
    supabase.from('campaign_payments').select('id,amount_minor,received_on,reference').eq('campaign_id', id).order('received_on', { ascending: false }).order('created_at', { ascending: false }),
  ]);
  if (deliverablesResult.error || paymentsResult.error) throw new Error('Deal activity could not load.');
  const deliverables = (deliverablesResult.data ?? []) as Deliverable[], payments = (paymentsResult.data ?? []) as CampaignPayment[];
  const today = southAfricaToday(), requestId = crypto.randomUUID();
  return <CampaignShell title={deal.title}>
    <Link className="subtle-link" href="/dashboard/campaigns">← All deals</Link>
    <section className="workspace-section"><p className="eyebrow eyebrow-dark">{deal.brand_name}</p><h2>Deal overview</h2>
      <div className="metric-grid campaign-metrics"><article><span>Agreed fee</span><strong>{money(deal.total_minor, deal.currency)}</strong></article><article><span>Received</span><strong>{money(deal.paid_minor, deal.currency)}</strong></article><article><span>Outstanding</span><strong>{money(deal.outstanding_minor, deal.currency)}</strong><small>{Number(deal.outstanding_minor) === 0 ? 'Fully paid' : deal.payment_due_on ? `${deadlineLabel(deal.payment_due_on, today)} · ${dealDate(deal.payment_due_on)}` : 'Payment deadline not set'}</small></article></div>
      {campaign.data.notes && <p className="campaign-notes">{campaign.data.notes}</p>}
    </section>
    <section className="workspace-section"><h2>Deliverables</h2><p>Deadlines are calendar dates, due by the end of that day in South Africa.</p>
      {deliverables.length ? <ul className="campaign-list">{deliverables.map(item => <li key={item.id}><div><strong>{item.title}</strong><span className={!item.published_at && item.due_on < today ? 'campaign-overdue' : ''}>{dealDate(item.due_on)} · {item.published_at ? 'Published' : deadlineLabel(item.due_on, today)}</span></div><ActionForm action={setPublished} submit={item.published_at ? 'Undo published' : 'Mark published'}><input type="hidden" name="campaign_id" value={id} /><input type="hidden" name="deliverable_id" value={item.id} /><input type="hidden" name="published" value={item.published_at ? 'false' : 'true'} /></ActionForm></li>)}</ul> : <p className="field-help">Add the first piece of content you agreed to deliver.</p>}
      <ActionForm action={addDeliverable} submit="Add deliverable"><input type="hidden" name="campaign_id" value={id} /><div className="field-row"><label>Deliverable title<input name="title" required maxLength={160} placeholder="Instagram Reel — product review" /></label><label>Deadline<input name="due_on" type="date" required min="2000-01-01" max="2100-12-31" /></label></div></ActionForm>
    </section>
    <section className="workspace-section"><h2>Payments received</h2><p>All amounts are recorded in {deal.currency}. Only record money you have actually received.</p>
      {payments.length ? <ul className="campaign-list">{payments.map(payment => <li key={payment.id}><div><strong>{money(payment.amount_minor, deal.currency)}</strong><span>{payment.reference || 'No reference'}</span></div><span>{dealDate(payment.received_on)}</span></li>)}</ul> : <p className="field-help">No payments recorded yet.</p>}
      {Number(deal.outstanding_minor) > 0 ? <ActionForm key={requestId} action={recordPayment} submit="Record received payment"><input type="hidden" name="campaign_id" value={id} /><input type="hidden" name="request_id" value={requestId} /><div className="field-row"><label>Amount received ({deal.currency})<input name="amount" inputMode="decimal" required maxLength={18} placeholder="1000.00" /></label><label>Date received<input type="date" name="received_on" required min="2000-01-01" max={today} defaultValue={today} /></label></div><label>Payment reference <span>(optional)</span><input name="reference" maxLength={160} placeholder="Deposit / invoice reference" /></label><p className="field-help">Maximum remaining: {money(deal.outstanding_minor, deal.currency)}. This records a payment; it does not move money. Check the amount before saving: editing payment records is not available yet.</p></ActionForm> : <p className="success">This deal is fully paid. Your payment history stays here.</p>}
    </section>
  </CampaignShell>;
}
export default function Page({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p className="loading">Opening your private deal…</p>}><Deal params={params} /></Suspense>; }
