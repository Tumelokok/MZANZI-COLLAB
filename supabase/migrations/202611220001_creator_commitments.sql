create table public.creator_commitments (
  id uuid primary key,
  creator_id uuid not null default auth.uid() references public.accounts(id) on delete cascade,
  brand text not null check (length(trim(brand)) between 1 and 100),
  deliverable text not null check (length(trim(deliverable)) between 1 and 200),
  due_date date not null,
  delivered boolean not null default false
);
create index creator_commitments_agenda on public.creator_commitments(creator_id, delivered, due_date);
alter table public.creator_commitments enable row level security;
revoke all on public.creator_commitments from public, anon, authenticated;
grant select, insert (id, brand, deliverable, due_date), update (delivered, due_date, brand, deliverable)
  on public.creator_commitments to authenticated;

create policy creator_owns_commitment on public.creator_commitments to authenticated
  using (creator_id = auth.uid() and exists (
    select 1 from public.accounts where id = auth.uid() and role = 'creator'
  ));
