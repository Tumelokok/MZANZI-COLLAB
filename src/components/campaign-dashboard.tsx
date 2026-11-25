import Link from 'next/link';
import { requireCreatorAccount, campaignSetupMissing } from '@/lib/campaign-account';
import { southAfricaToday, type CampaignSummary, type Deliverable } from '@/lib/campaigns';
import { CampaignHighlights, CampaignSetupNotice } from './campaign-ui';

export async function CampaignDashboard() {
  const { supabase } = await requireCreatorAccount();
  const [summary, due] = await Promise.all([
    supabase.rpc('creator_campaign_summary'),
    supabase.from('campaign_deliverables').select('id,campaign_id,title,due_on,published_at').is('published_at', null).order('due_on').order('id').limit(5),
  ]);
  const error = summary.error || due.error;
  return <section className="workspace-section" id="campaigns"><div className="workspace-section-heading"><div><p className="eyebrow eyebrow-dark">Creator Intelligence · Private</p><h2>Your brand deals</h2></div><Link className="button button-dark" href="/dashboard/campaigns">Manage deals →</Link></div>
    {campaignSetupMissing(error) ? <CampaignSetupNotice /> : error ? <p role="status" className="form-message">Your campaign summary couldn’t load. Refresh to try again.</p> : <CampaignHighlights deals={(summary.data ?? []) as CampaignSummary[]} due={(due.data ?? []) as Deliverable[]} today={southAfricaToday()} />}
  </section>;
}
