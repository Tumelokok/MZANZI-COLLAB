-- Private Creator Intelligence records. No public profile/admin access or money movement.
create table public.creator_campaigns (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.accounts(id) on delete cascade,
  brand_name text not null check(length(trim(brand_name)) between 1 and 120),
  title text not null check(length(trim(title)) between 1 and 160),
  currency text not null check(currency in ('ZAR','USD','EUR','GBP','AUD','CAD','NZD','CHF','JPY','KWD')),
  total_minor bigint not null check(total_minor between 1 and 1000000000000),
  payment_due_on date check(payment_due_on between date '2000-01-01' and date '2100-12-31'),
  notes text not null default '' check(length(notes)<=2000),
  created_at timestamptz not null default now()
);
create index creator_campaigns_owner on public.creator_campaigns(creator_id,created_at desc);

create table public.campaign_deliverables (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.creator_campaigns(id) on delete cascade,
  title text not null check(length(trim(title)) between 1 and 160),
  due_on date not null check(due_on between date '2000-01-01' and date '2100-12-31'),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index campaign_deliverables_due on public.campaign_deliverables(campaign_id,due_on,id) where published_at is null;

create table public.campaign_payments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.creator_campaigns(id) on delete cascade,
  amount_minor bigint not null check(amount_minor between 1 and 1000000000000),
  received_on date not null check(received_on between date '2000-01-01' and date '2100-12-31'),
  reference text not null default '' check(length(reference)<=160),
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique(campaign_id,request_id)
);
create index campaign_payments_deal on public.campaign_payments(campaign_id,received_on desc);

-- Same auth and confirmed-creator requirements for both RLS reads and RPC writes.
create function public.owns_creator_campaign(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.creator_campaigns c
    join public.accounts a on a.id=c.creator_id
    join auth.users u on u.id=a.id
    where c.id=p_id and c.creator_id=auth.uid() and a.role='creator' and u.email_confirmed_at is not null
  );
$$;
alter table public.creator_campaigns enable row level security;
alter table public.campaign_deliverables enable row level security;
alter table public.campaign_payments enable row level security;
create policy campaign_owner_read on public.creator_campaigns for select to authenticated using(public.owns_creator_campaign(id));
create policy deliverable_owner_read on public.campaign_deliverables for select to authenticated using(public.owns_creator_campaign(campaign_id));
create policy payment_owner_read on public.campaign_payments for select to authenticated using(public.owns_creator_campaign(campaign_id));

create function public.create_creator_campaign(p_brand text,p_title text,p_currency text,p_total_minor bigint,p_payment_due_on date default null,p_notes text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); created_id uuid;
begin
  insert into public.creator_campaigns(creator_id,brand_name,title,currency,total_minor,payment_due_on,notes)
  values(who,trim(p_brand),trim(p_title),p_currency,p_total_minor,p_payment_due_on,trim(p_notes)) returning id into created_id;
  return created_id;
end $$;

create function public.add_campaign_deliverable(p_campaign uuid,p_title text,p_due_on date)
returns uuid language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); created_id uuid;
begin
  if not public.owns_creator_campaign(p_campaign) then raise exception 'Campaign not found.'; end if;
  insert into public.campaign_deliverables(campaign_id,title,due_on)
  values(p_campaign,trim(p_title),p_due_on) returning id into created_id;
  return created_id;
end $$;

create function public.set_campaign_deliverable_published(p_id uuid,p_published boolean)
returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true);
begin
  if p_published is null then raise exception 'Choose a publication status.'; end if;
  update public.campaign_deliverables set published_at=case when p_published then coalesce(published_at,now()) else null end
  where id=p_id and public.owns_creator_campaign(campaign_id);
  if not found then raise exception 'Deliverable not found.'; end if;
end $$;

create function public.record_campaign_payment(p_campaign uuid,p_amount_minor bigint,p_received_on date,p_reference text,p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); agreed bigint; paid numeric; existing public.campaign_payments%rowtype; created_id uuid;
begin
  -- The parent row lock serializes concurrent payments, including retries.
  select total_minor into agreed from public.creator_campaigns where id=p_campaign and creator_id=who for update;
  if not found then raise exception 'Campaign not found.'; end if;
  select * into existing from public.campaign_payments where campaign_id=p_campaign and request_id=p_request_id;
  if found then
    if existing.amount_minor=p_amount_minor and existing.received_on=p_received_on and existing.reference=trim(p_reference) then return existing.id; end if;
    raise exception 'This payment form was already used. Refresh before recording a different payment.';
  end if;
  if p_received_on>(now() at time zone 'Africa/Johannesburg')::date then raise exception 'A received payment cannot be dated in the future.'; end if;
  select coalesce(sum(amount_minor),0) into paid from public.campaign_payments where campaign_id=p_campaign;
  if p_amount_minor>agreed-paid then raise exception 'Payment exceeds the outstanding balance.'; end if;
  insert into public.campaign_payments(campaign_id,amount_minor,received_on,reference,request_id)
  values(p_campaign,p_amount_minor,p_received_on,trim(p_reference),p_request_id) returning id into created_id;
  return created_id;
end $$;

-- A server-side projection avoids client-side joins, duplicated payment totals, or cross-currency sums.
create function public.creator_campaign_summary()
returns table(id uuid,brand_name text,title text,currency text,total_minor bigint,paid_minor bigint,outstanding_minor bigint,payment_due_on date,next_due_on date,open_deliverables bigint)
language sql stable security definer set search_path='' as $$
  select c.id,c.brand_name,c.title,c.currency,c.total_minor,p.paid,c.total_minor-p.paid,c.payment_due_on,d.next_due,d.remaining
  from public.creator_campaigns c
  cross join lateral(select coalesce(sum(amount_minor),0)::bigint paid from public.campaign_payments where campaign_id=c.id) p
  cross join lateral(select min(due_on) next_due,count(*) remaining from public.campaign_deliverables where campaign_id=c.id and published_at is null) d
  where public.owns_creator_campaign(c.id)
  order by c.created_at desc,c.id;
$$;

-- Deny all direct writes, even to the owner's rows; mutations must use the checked RPCs.
revoke all on public.creator_campaigns,public.campaign_deliverables,public.campaign_payments from public,anon,authenticated;
grant select on public.creator_campaigns,public.campaign_deliverables,public.campaign_payments to authenticated;
revoke all on function public.owns_creator_campaign(uuid),public.create_creator_campaign(text,text,text,bigint,date,text),public.add_campaign_deliverable(uuid,text,date),public.set_campaign_deliverable_published(uuid,boolean),public.record_campaign_payment(uuid,bigint,date,text,uuid),public.creator_campaign_summary() from public,anon,authenticated;
grant execute on function public.owns_creator_campaign(uuid),public.create_creator_campaign(text,text,text,bigint,date,text),public.add_campaign_deliverable(uuid,text,date),public.set_campaign_deliverable_published(uuid,boolean),public.record_campaign_payment(uuid,bigint,date,text,uuid),public.creator_campaign_summary() to authenticated;
