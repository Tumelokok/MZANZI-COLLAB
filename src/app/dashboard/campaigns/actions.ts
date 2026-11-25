'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCreatorAccount, campaignSetupMissing } from '@/lib/campaign-account';
import { isDealCurrency, parseDealAmount, validDealDate, southAfricaToday, uuidPattern } from '@/lib/campaigns';
import type { ActionState } from '@/lib/platform';

const field = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
function outcome(error: { code?: string; message: string } | null, message: string, id?: string): ActionState {
  if (campaignSetupMissing(error)) return { message: 'Campaign tracking is awaiting setup.' };
  if (error) return { message: error.code === 'P0001' ? error.message : 'Could not save this record. Check the fields and try again.' };
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/campaigns');
  if (id) revalidatePath(`/dashboard/campaigns/${id}`);
  return { ok: true, message };
}

export async function createCampaign(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireCreatorAccount();
  const currency = field(form, 'currency'), brand = field(form, 'brand_name'), title = field(form, 'title');
  const due = field(form, 'payment_due_on'), notes = field(form, 'notes');
  if (!isDealCurrency(currency)) return { message: 'Choose one of the supported currencies.' };
  const amount = parseDealAmount(field(form, 'amount'), currency);
  if (!brand || brand.length > 120 || !title || title.length > 160 || !amount || notes.length > 2000 || (due && !validDealDate(due))) return { message: 'Add a brand, deal title, valid positive fee and optional payment date. Use the selected currency’s decimal precision.' };
  const { data, error } = await supabase.rpc('create_creator_campaign', { p_brand: brand, p_title: title, p_currency: currency, p_total_minor: amount, p_payment_due_on: due || null, p_notes: notes });
  const result = outcome(error, 'Deal saved.');
  if (!result.ok) return result;
  redirect(`/dashboard/campaigns/${data}`);
}

export async function addDeliverable(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireCreatorAccount();
  const id = field(form, 'campaign_id'), title = field(form, 'title'), due = field(form, 'due_on');
  if (!uuidPattern.test(id) || !title || title.length > 160 || !validDealDate(due)) return { message: 'Add a deliverable title and a valid deadline.' };
  const { error } = await supabase.rpc('add_campaign_deliverable', { p_campaign: id, p_title: title, p_due_on: due });
  return outcome(error, 'Deliverable added.', id);
}

export async function setPublished(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireCreatorAccount();
  const id = field(form, 'deliverable_id'), campaign = field(form, 'campaign_id'), published = field(form, 'published');
  if (!uuidPattern.test(id) || !uuidPattern.test(campaign) || !['true', 'false'].includes(published)) return { message: 'Choose a valid deliverable and publication status.' };
  // The database checks the deliverable's actual parent, never the submitted campaign ID.
  const { error } = await supabase.rpc('set_campaign_deliverable_published', { p_id: id, p_published: published === 'true' });
  return outcome(error, published === 'true' ? 'Marked published.' : 'Returned to upcoming deliverables.', campaign);
}

export async function recordPayment(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireCreatorAccount();
  const id = field(form, 'campaign_id'), requestId = field(form, 'request_id'), received = field(form, 'received_on'), reference = field(form, 'reference');
  if (!uuidPattern.test(id) || !uuidPattern.test(requestId) || !validDealDate(received) || received > southAfricaToday() || reference.length > 160) return { message: 'Choose a valid received date, today or earlier, and a reference of up to 160 characters.' };
  // Currency comes from the private parent record, not from the browser.
  const { data: campaign, error: readError } = await supabase.from('creator_campaigns').select('currency').eq('id', id).maybeSingle();
  if (readError) return outcome(readError, '');
  if (!campaign || !isDealCurrency(campaign.currency)) return { message: 'Campaign not found.' };
  const amount = parseDealAmount(field(form, 'amount'), campaign.currency);
  if (!amount) return { message: 'Enter a positive amount using this deal’s currency and decimal precision.' };
  const { error } = await supabase.rpc('record_campaign_payment', { p_campaign: id, p_amount_minor: amount, p_received_on: received, p_reference: reference, p_request_id: requestId });
  return outcome(error, 'Received payment recorded.', id);
}
