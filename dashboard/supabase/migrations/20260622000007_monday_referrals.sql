-- Monday Referrals board mirror.
-- Faithful 1:1 mirror following the same pattern as the other monday_* tables.

create table if not exists public.monday_referrals (
  id                   uuid primary key default gen_random_uuid(),
  monday_item_id       text not null unique,
  name                 text,
  monday_group_id      text,
  monday_group_title   text,
  raw                  jsonb not null default '{}',
  created_at_monday    timestamptz,
  updated_at_monday    timestamptz,
  imported_at          timestamptz not null default now(),
  user_id              uuid references auth.users (id)
);

create index if not exists monday_referrals_group_idx
  on public.monday_referrals (monday_group_title);
create index if not exists monday_referrals_updated_idx
  on public.monday_referrals (updated_at_monday desc);

alter table public.monday_referrals enable row level security;

drop policy if exists "Authenticated users can select" on public.monday_referrals;
create policy "Authenticated users can select" on public.monday_referrals
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.monday_referrals;
create policy "Authenticated users can insert" on public.monday_referrals
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.monday_referrals;
create policy "Authenticated users can update" on public.monday_referrals
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.monday_referrals;
create policy "Authenticated users can delete" on public.monday_referrals
  for delete using (auth.role() = 'authenticated');
