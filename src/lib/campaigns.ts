export const currencyDigits = { ZAR: 2, USD: 2, EUR: 2, GBP: 2, AUD: 2, CAD: 2, NZD: 2, CHF: 2, JPY: 0, KWD: 3 } as const;
export type DealCurrency = keyof typeof currencyDigits;
export function isDealCurrency(value: string): value is DealCurrency {
  return Object.hasOwn(currencyDigits, value);
}

// Parse decimal text exactly. No floating-point multiplication or silent rounding.
export function parseDealAmount(value: string, currency: DealCurrency): number | null {
  const digits = currencyDigits[currency];
  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(value.trim());
  if (!match || (match[2]?.length ?? 0) > digits || match[1].length > 13) return null;
  const minor = BigInt(match[1]) * BigInt(10 ** digits) + BigInt((match[2] ?? '').padEnd(digits, '0') || '0');
  return minor > BigInt(0) && minor <= BigInt(1000000000000) ? Number(minor) : null;
}
export function money(minor: number | string | bigint, currency: DealCurrency) {
  const amount = BigInt(minor), digits = currencyDigits[currency], scale = BigInt(10 ** digits);
  return `${currency} ${(amount / scale).toLocaleString('en-ZA')}${digits ? `.${(amount % scale).toString().padStart(digits, '0')}` : ''}`;
}
export function southAfricaToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function validDealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '2000-01-01' || value > '2100-12-31') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function dealDate(value: string) {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'Africa/Johannesburg' }).format(new Date(`${value}T12:00:00Z`));
}
export function deadlineLabel(value: string, today: string) {
  return value < today ? 'Overdue' : value === today ? 'Due today' : 'Upcoming';
}
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type CampaignSummary = {
  id: string; brand_name: string; title: string; currency: DealCurrency;
  total_minor: number; paid_minor: number; outstanding_minor: number;
  payment_due_on: string | null; next_due_on: string | null; open_deliverables: number;
};
export type Deliverable = { id: string; campaign_id: string; title: string; due_on: string; published_at: string | null };
export type CampaignPayment = { id: string; amount_minor: number; received_on: string; reference: string };
export function unpaidByCurrency(deals: CampaignSummary[]) {
  const totals = new Map<DealCurrency, bigint>();
  for (const deal of deals) if (Number(deal.outstanding_minor) > 0) totals.set(deal.currency, (totals.get(deal.currency) ?? BigInt(0)) + BigInt(deal.outstanding_minor));
  return [...totals].sort(([a], [b]) => a.localeCompare(b));
}
