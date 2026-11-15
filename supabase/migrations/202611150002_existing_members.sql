-- Provision accounts created before the initial signup trigger was installed.
-- Idempotent: existing profiles, roles, wallet balances and rewards are preserved.
insert into public.accounts(id,role)
select id,case when raw_user_meta_data->>'role'='business' then 'business' else 'creator' end
from auth.users
on conflict(id) do nothing;

insert into public.profiles(id,display_name)
select u.id,case
  when length(trim(coalesce(u.raw_user_meta_data->>'display_name','')))>=2
  then left(trim(u.raw_user_meta_data->>'display_name'),80)
  else 'New member' end
from auth.users u join public.accounts a on a.id=u.id
on conflict(id) do nothing;

insert into public.wallets(creator_id)
select id from public.accounts where role='creator'
on conflict(creator_id) do nothing;
