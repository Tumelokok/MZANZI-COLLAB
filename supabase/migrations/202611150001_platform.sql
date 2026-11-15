-- Mzansi Collab: all reward and spend operations run in database transactions.
create table public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('creator','business')),
  referral_code text not null unique default substr(replace(gen_random_uuid()::text,'-',''),1,12),
  referred_by uuid references public.accounts(id),
  created_at timestamptz not null default now(),
  check (referred_by is distinct from id)
);
create table public.profiles (
  id uuid primary key references public.accounts(id) on delete cascade,
  display_name text not null check (length(display_name) between 2 and 80),
  bio text not null default '' check (length(bio)<=2000),
  category text not null default '' check (length(category)<=80),
  city text not null default '' check (length(city)<=80),
  photo_path text not null default '',
  portfolio_url text not null default '' check (portfolio_url='' or portfolio_url ~ '^https://'),
  published boolean not null default false,
  verified_until timestamptz,
  promoted_until timestamptz,
  updated_at timestamptz not null default now()
);
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.accounts(id) on delete cascade,
  platform text not null check(platform in ('instagram','tiktok','youtube','facebook','x','snapchat')),
  handle text not null check(length(handle) between 1 and 100),
  profile_url text not null check(profile_url ~ '^https://' and length(profile_url)<=500),
  rate_zar numeric(12,2) not null check(rate_zar>0 and rate_zar<=10000000),
  followers bigint check(followers>=0),
  synced_at timestamptz,
  sync_attempted_at timestamptz,
  count_source text check(count_source is null or count_source='youtube_api'),
  ownership_checked boolean not null default false,
  unique(creator_id,platform)
);
create table public.wallets (
  creator_id uuid primary key references public.accounts(id) on delete cascade,
  balance integer not null default 0 check(balance>=0)
);
create table public.token_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.wallets(creator_id) on delete cascade,
  amount integer not null check(amount<>0),
  reason text not null,
  event_key text not null unique,
  created_at timestamptz not null default now()
);
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.accounts(id) on delete cascade,
  creator_id uuid not null references public.accounts(id) on delete cascade,
  stars integer not null check(stars between 1 and 5),
  review text not null check(length(review) between 20 and 500),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique(reviewer_id,creator_id), check(reviewer_id<>creator_id)
);
create table public.verification_requests (
  creator_id uuid primary key references public.accounts(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','approved','declined')),
  evidence text not null check(length(evidence) between 20 and 2000),
  reviewer_note text not null default '',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create table public.platform_admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.moderation_log (
  id uuid primary key default gen_random_uuid(), actor uuid not null, subject uuid not null,
  action text not null, note text not null, created_at timestamptz not null default now()
);

create function public.is_platform_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.platform_admins where user_id=auth.uid());
$$;
create function public.require_member(creator_only boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare who uuid:=auth.uid(); member_role text;
begin
  if who is null or not exists(select 1 from auth.users where id=who and email_confirmed_at is not null) then raise exception 'Confirm your email and sign in first.'; end if;
  select role into member_role from public.accounts where id=who;
  if member_role is null or (creator_only and member_role<>'creator') then raise exception 'This feature is for creators only.'; end if;
  return who;
end $$;
create function public.handle_new_member() returns trigger language plpgsql security definer set search_path='' as $$
declare member_role text; inviter uuid; name text;
begin
  member_role:=case when new.raw_user_meta_data->>'role'='business' then 'business' else 'creator' end;
  name:=left(trim(coalesce(new.raw_user_meta_data->>'display_name','New member')),80);
  if length(name)<2 then name:='New member'; end if;
  if member_role='creator' then select id into inviter from public.accounts where referral_code=lower(new.raw_user_meta_data->>'referral_code') and role='creator'; end if;
  insert into public.accounts(id,role,referred_by) values(new.id,member_role,inviter);
  insert into public.profiles(id,display_name) values(new.id,name);
  if member_role='creator' then insert into public.wallets(creator_id) values(new.id); end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_member();

create function public.profile_complete(who uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.profiles p join public.accounts a on a.id=p.id join auth.users u on u.id=p.id
    where p.id=who and a.role='creator' and u.email_confirmed_at is not null and p.published
      and length(trim(p.bio))>=50 and p.photo_path<>'' and p.category<>'' and p.city<>'' and p.portfolio_url<>''
      and exists(select 1 from public.social_accounts s where s.creator_id=who)
      and not exists(select 1 from public.social_accounts s where s.creator_id=who and s.rate_zar<=0));
$$;
create function public.save_profile(p_name text,p_bio text,p_category text,p_city text,p_portfolio text,p_published boolean,p_photo text default null) returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member();
begin
  if p_photo is not null and (p_photo not like who::text||'/%' or position('..' in p_photo)>0) then raise exception 'Invalid photo ownership.'; end if;
  if p_photo is not null and not exists(select 1 from storage.objects where bucket_id='avatars' and name=p_photo and owner_id=who::text) then raise exception 'Upload a photo first.'; end if;
  update public.profiles set display_name=trim(p_name),bio=trim(p_bio),category=trim(p_category),city=trim(p_city),portfolio_url=p_portfolio,published=p_published,
    photo_path=coalesce(p_photo,photo_path),verified_until=null,updated_at=now() where id=who;
end $$;
create function public.save_social(p_platform text,p_handle text,p_url text,p_rate numeric) returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); valid_url boolean;
begin
  valid_url:=case p_platform
    when 'youtube' then p_url ~ '^https://(www\.)?youtube\.com/(channel/UC[A-Za-z0-9_-]{22}|@[A-Za-z0-9_.-]+)/?$'
    when 'instagram' then p_url ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$'
    when 'tiktok' then p_url ~ '^https://(www\.)?tiktok\.com/@[A-Za-z0-9_.]+/?$'
    when 'facebook' then p_url ~ '^https://(www\.)?facebook\.com/[A-Za-z0-9_.-]+/?$'
    when 'x' then p_url ~ '^https://(www\.)?(x|twitter)\.com/[A-Za-z0-9_]+/?$'
    when 'snapchat' then p_url ~ '^https://(www\.)?snapchat\.com/(add/|@)[A-Za-z0-9_.-]+/?$' else false end;
  if not coalesce(valid_url,false) then raise exception 'Use a valid public profile URL for the selected platform.'; end if;
  insert into public.social_accounts(creator_id,platform,handle,profile_url,rate_zar) values(who,p_platform,p_handle,p_url,p_rate)
    on conflict(creator_id,platform) do update set handle=excluded.handle,profile_url=excluded.profile_url,rate_zar=excluded.rate_zar,followers=null,synced_at=null,count_source=null,ownership_checked=false;
  update public.profiles set verified_until=null,updated_at=now() where id=who;
end $$;
create function public.remove_social(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true);
begin delete from public.social_accounts where id=p_id and creator_id=who; update public.profiles set verified_until=null where id=who; end $$;
create function public.begin_youtube_sync() returns table(id uuid,profile_url text) language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true);
begin
  return query update public.social_accounts s set sync_attempted_at=now() where s.creator_id=who and s.platform='youtube'
    and (s.sync_attempted_at is null or s.sync_attempted_at<now()-interval '15 minutes') returning s.id,s.profile_url;
end $$;

-- Internal helper. No client EXECUTE grant. Row lock prevents double-spend.
create function public.apply_tokens(who uuid,delta integer,why text,event text) returns boolean language plpgsql security definer set search_path='' as $$
declare current_balance integer;
begin
  select balance into current_balance from public.wallets where creator_id=who for update;
  if current_balance is null then raise exception 'Creator wallet required.'; end if;
  if exists(select 1 from public.token_ledger where event_key=event) then return false; end if;
  if current_balance+delta<0 then raise exception 'Not enough tokens.'; end if;
  insert into public.token_ledger(creator_id,amount,reason,event_key) values(who,delta,why,event);
  update public.wallets set balance=balance+delta where creator_id=who;
  return true;
end $$;
create function public.claim_profile_reward() returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); inviter uuid;
begin
  if not public.profile_complete(who) then raise exception 'Complete and publish your profile, photo, sample work and social rates first.'; end if;
  -- Always lock wallets in UUID order to avoid reciprocal referral deadlocks.
  select referred_by into inviter from public.accounts where id=who;
  perform 1 from public.wallets where creator_id in (who,inviter) order by creator_id for update;
  perform public.apply_tokens(who,40,'Profile completed','profile:'||who::text);
  if inviter is not null and public.profile_complete(inviter) then
    -- Referral rewards require a seven-day-old confirmed account, not sending invites.
    if exists(select 1 from public.accounts where id=who and created_at<=now()-interval '7 days') then
      perform public.apply_tokens(inviter,30,'Qualified creator referral','referral:'||who::text);
    end if;
  end if;
end $$;
create function public.claim_referrals() returns integer language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); invited record; count_awarded integer:=0;
begin
  if not public.profile_complete(who) then raise exception 'Complete your own profile first.'; end if;
  for invited in select id from public.accounts where referred_by=who and role='creator' and created_at<=now()-interval '7 days' order by id loop
    if public.profile_complete(invited.id) and public.apply_tokens(who,30,'Qualified creator referral','referral:'||invited.id::text) then count_awarded:=count_awarded+1; end if;
  end loop;
  return count_awarded;
end $$;
create function public.buy_promotion() returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true); until_at timestamptz;
begin
  if not public.profile_complete(who) then raise exception 'Complete your public profile first.'; end if;
  select promoted_until into until_at from public.profiles where id=who for update;
  if until_at>now() then raise exception 'Your featured placement is already active.'; end if;
  perform public.apply_tokens(who,-60,'Featured placement · 7 days','promotion:'||gen_random_uuid()::text);
  update public.profiles set promoted_until=now()+interval '7 days' where id=who;
end $$;
create function public.request_verification(p_evidence text) returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member(true);
begin
  if not public.profile_complete(who) then raise exception 'Complete every required profile task first.'; end if;
  if exists(select 1 from public.profiles where id=who and verified_until>now()) then raise exception 'Your profile badge is already active.'; end if;
  if (select balance from public.wallets where creator_id=who)<100 then raise exception 'Earn 100 tokens before requesting review.'; end if;
  insert into public.verification_requests(creator_id,evidence) values(who,p_evidence)
    on conflict(creator_id) do update set evidence=excluded.evidence,status='pending',reviewer_note='',requested_at=now(),reviewed_at=null;
end $$;
create function public.review_verification(p_creator uuid,p_approve boolean,p_note text) returns void language plpgsql security definer set search_path='' as $$
declare request_status text;
begin
  if not public.is_platform_admin() then raise exception 'Reviewer access required.'; end if;
  if length(trim(p_note))<10 then raise exception 'Record your review checks.'; end if;
  select status into request_status from public.verification_requests where creator_id=p_creator for update;
  if request_status is distinct from 'pending' then raise exception 'No pending request.'; end if;
  if p_approve then
    if not public.profile_complete(p_creator) then raise exception 'Profile is no longer complete.'; end if;
    perform public.apply_tokens(p_creator,-100,'Profile verification · 90 days','verification:'||gen_random_uuid()::text);
    update public.social_accounts set ownership_checked=true where creator_id=p_creator;
    update public.profiles set verified_until=now()+interval '90 days' where id=p_creator;
  end if;
  update public.verification_requests set status=case when p_approve then 'approved' else 'declined' end,reviewer_note=p_note,reviewed_at=now() where creator_id=p_creator;
  insert into public.moderation_log(actor,subject,action,note) values(auth.uid(),p_creator,'verification:'||p_approve::text,p_note);
end $$;
create function public.rate_creator(p_creator uuid,p_stars integer,p_review text) returns void language plpgsql security definer set search_path='' as $$
declare who uuid:=public.require_member();
begin
  if not exists(select 1 from public.accounts where id=who and created_at<=now()-interval '24 hours') then raise exception 'Ratings unlock 24 hours after sign-up.'; end if;
  if not exists(select 1 from public.profiles where id=who and length(bio)>=50) then raise exception 'Add a bio before reviewing creators.'; end if;
  if not public.profile_complete(p_creator) then raise exception 'This creator is not available for ratings.'; end if;
  insert into public.ratings(reviewer_id,creator_id,stars,review) values(who,p_creator,p_stars,trim(p_review))
    on conflict(reviewer_id,creator_id) do update set stars=excluded.stars,review=excluded.review;
end $$;
create function public.moderate_rating(p_id uuid,p_hidden boolean,p_note text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.is_platform_admin() then raise exception 'Reviewer access required.'; end if;
  if length(trim(p_note))<10 then raise exception 'Add a moderation reason.'; end if;
  update public.ratings set hidden=p_hidden where id=p_id;
  insert into public.moderation_log(actor,subject,action,note) values(auth.uid(),p_id,'rating:'||p_hidden::text,p_note);
end $$;

-- Public projection excludes referral codes, private evidence and wallet balances.
create function public.creator_directory() returns table(id uuid,display_name text,bio text,category text,city text,photo_path text,portfolio_url text,verified_until timestamptz,promoted_until timestamptz,score numeric,rating_count bigint,total_followers numeric,synced_accounts bigint,social_count bigint,last_synced timestamptz) language sql stable security definer set search_path='' as $$
  select p.id,p.display_name,p.bio,p.category,p.city,p.photo_path,p.portfolio_url,p.verified_until,p.promoted_until,
    r.score,coalesce(r.total,0),s.followers,coalesce(s.synced,0),coalesce(s.total,0),s.oldest
  from public.profiles p join public.accounts a on a.id=p.id
  left join lateral(select round(avg(stars)::numeric,2) score,count(*) total from public.ratings where creator_id=p.id and not hidden) r on true
  left join lateral(select sum(followers)::numeric followers,count(followers) synced,count(*) total,min(synced_at) oldest from public.social_accounts where creator_id=p.id) s on true
  where a.role='creator' and p.published and public.profile_complete(p.id);
$$;

alter table public.accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.social_accounts enable row level security;
alter table public.wallets enable row level security;
alter table public.token_ledger enable row level security;
alter table public.ratings enable row level security;
alter table public.verification_requests enable row level security;
alter table public.platform_admins enable row level security;
alter table public.moderation_log enable row level security;
create policy account_read on public.accounts for select to authenticated using(id=auth.uid() or public.is_platform_admin());
create policy profile_read on public.profiles for select using(published or id=auth.uid() or public.is_platform_admin());
create policy social_read on public.social_accounts for select using(creator_id=auth.uid() or public.is_platform_admin() or exists(select 1 from public.profiles where id=creator_id and published));
create policy wallet_read on public.wallets for select to authenticated using(creator_id=auth.uid());
create policy ledger_read on public.token_ledger for select to authenticated using(creator_id=auth.uid());
create policy rating_read on public.ratings for select using((not hidden and exists(select 1 from public.profiles where id=creator_id and published)) or reviewer_id=auth.uid() or public.is_platform_admin());
create policy verification_read on public.verification_requests for select to authenticated using(creator_id=auth.uid() or public.is_platform_admin());
create policy audit_read on public.moderation_log for select to authenticated using(public.is_platform_admin());

revoke all on all tables in schema public from anon,authenticated;
grant select on public.profiles,public.social_accounts,public.ratings to anon,authenticated;
grant select on public.accounts,public.wallets,public.token_ledger,public.verification_requests,public.moderation_log to authenticated;
revoke execute on all functions in schema public from public,anon,authenticated;
grant execute on function public.is_platform_admin(), public.creator_directory() to anon,authenticated;
grant execute on function public.save_profile(text,text,text,text,text,boolean,text),public.save_social(text,text,text,numeric),public.remove_social(uuid),public.claim_profile_reward(),public.claim_referrals(),public.buy_promotion(),public.request_verification(text),public.review_verification(uuid,boolean,text),public.rate_creator(uuid,integer,text),public.moderate_rating(uuid,boolean,text) to authenticated;
grant execute on function public.begin_youtube_sync() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('avatars','avatars',true,3145728,array['image/jpeg','image/png','image/webp']);
create policy avatar_insert on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy avatar_delete on storage.objects for delete to authenticated using(bucket_id='avatars' and owner_id=auth.uid()::text);
-- Provider snapshots may only be written by the trusted server service role.
grant all on all tables in schema public to service_role;
