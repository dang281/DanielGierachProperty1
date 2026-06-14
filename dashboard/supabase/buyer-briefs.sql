-- Buyer briefs (private buyer matching list)
-- Run after schema.sql. Safe to re-run — every statement is idempotent.

create table if not exists public.buyer_briefs (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  phone           text,
  email           text,
  monday_link     text,
  suburbs         text[] not null default '{}',
  property_types  text[] not null default '{}',
  price_min       numeric,
  price_max       numeric,
  beds_min        integer not null default 0,
  baths_min       integer not null default 0,
  car_min         integer not null default 0,
  extras          text,
  notes           text,
  status          text not null default 'active' check (status in ('active', 'bought', 'archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at (re-uses set_updated_at() from schema.sql)
drop trigger if exists set_updated_at_buyer_briefs on public.buyer_briefs;
create trigger set_updated_at_buyer_briefs
  before update on public.buyer_briefs
  for each row execute function public.set_updated_at();

-- Row Level Security — authenticated-only.
-- Buyer contacts and notes are private; anon must never see this table.
alter table public.buyer_briefs enable row level security;

drop policy if exists "Authenticated users can select" on public.buyer_briefs;
create policy "Authenticated users can select" on public.buyer_briefs
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.buyer_briefs;
create policy "Authenticated users can insert" on public.buyer_briefs
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.buyer_briefs;
create policy "Authenticated users can update" on public.buyer_briefs
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.buyer_briefs;
create policy "Authenticated users can delete" on public.buyer_briefs
  for delete using (auth.role() = 'authenticated');
