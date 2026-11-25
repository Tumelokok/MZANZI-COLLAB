import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from './brand-logo';
import { money, dealDate, deadlineLabel, unpaidByCurrency, type CampaignSummary, type Deliverable } from '@/lib/campaigns';

export function CampaignShell({ title, children }: { title: string; children: ReactNode }) {
  return <div className="workspace"><aside className="workspace-nav"><BrandLogo /><span className="role-pill">Creator Intelligence</span><nav aria-label="Creator workspace"><Link href="/dashboard">← Your dashboard</Link><Link href="/dashboard/campaigns">Campaign tracker</Link><Link href="/chart">Creator chart</Link></nav></aside><main className="workspace-main campaign-page"><header className="workspace-heading"><div><p className="eyebrow eyebrow-dark">Private to your creator account</p><h1>{title}</h1><p>Keep track of your work and the money you’ve received. These records never appear on your public profile.</p></div></header>{children}</main></div>;
}

export function CampaignSetupNotice() {
  return <p className="form-message" role="status">Campaign tracking is awaiting setup in this environment.</p>;
}

export function CampaignHighlights({ deals, due, today }: { deals: CampaignSummary[]; due: Deliverable[]; today: string }) {
  const totals = unpaidByCurrency(deals);
  return <div className="campaign-highlights">
    <div><h3>Due next</h3>{due.length ? <ul className="campaign-list">{due.map(item => <li key={item.id}><Link href={`/dashboard/campaigns/${item.campaign_id}`}><strong>{item.title}</strong><span>{deals.find(d => d.id === item.campaign_id)?.brand_name}</span></Link><span className={item.due_on < today ? 'campaign-overdue' : ''}>{deadlineLabel(item.due_on, today)} · {dealDate(item.due_on)}</span></li>)}</ul> : <p className="field-help">No unpublished deliverables with deadlines.</p>}<p className="field-help">Earliest five deadlines, including overdue work. Dates use South African time.</p></div>
    <div><h3>Still unpaid</h3>{totals.length ? <ul className="campaign-balances">{totals.map(([currency, minor]) => <li key={currency}><strong>{money(minor, currency)}</strong></li>)}</ul> : <p className="field-help">No outstanding balances.</p>}<p className="field-help">Remaining agreed fees, including amounts not due yet. Each currency stays separate; no exchange-rate conversion.</p><Link className="text-link" href="/dashboard/campaigns">See your deals →</Link></div>
  </div>;
}

export function CampaignCards({ deals, today }: { deals: CampaignSummary[]; today: string }) {
  if (!deals.length) return <p className="field-help">No deals yet. Record your first brand deal below.</p>;
  return <div className="campaign-cards">{deals.map(deal => <article className="campaign-card" key={deal.id}>
    <p className="eyebrow eyebrow-dark">{deal.brand_name}</p><h3><Link href={`/dashboard/campaigns/${deal.id}`}>{deal.title} →</Link></h3>
    <dl><div><dt>Agreed fee</dt><dd>{money(deal.total_minor, deal.currency)}</dd></div><div><dt>Received</dt><dd>{money(deal.paid_minor, deal.currency)}</dd></div><div><dt>Outstanding</dt><dd>{money(deal.outstanding_minor, deal.currency)}</dd></div></dl>
    <p>{Number(deal.outstanding_minor) === 0 ? <strong className="success">Fully paid</strong> : deal.payment_due_on ? <span className={deal.payment_due_on < today ? 'campaign-overdue' : ''}>Payment {deadlineLabel(deal.payment_due_on, today).toLowerCase()} · {dealDate(deal.payment_due_on)}</span> : 'Payment deadline not set'}</p>
    <p>{deal.next_due_on ? `Next deliverable: ${dealDate(deal.next_due_on)}` : 'No pending deliverables'} · {deal.open_deliverables} remaining</p>
  </article>)}</div>;
}
