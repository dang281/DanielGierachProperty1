-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Content items table
create table if not exists public.content_items (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  platform         text not null check (platform in ('linkedin', 'instagram', 'facebook')),
  content_type     text,
  caption          text,
  platform_variants jsonb,
  objective        text,
  target_audience  text,
  expected_outcome text,
  cta              text,
  destination_url  text,
  status           text not null default 'idea' check (status in ('idea', 'ready', 'scheduled', 'posted', 'rejected')),
  content_pillar   text check (content_pillar in ('seller', 'authority', 'suburb', 'proof', 'buyer')),
  score            integer check (score >= 1 and score <= 10),
  scheduled_date   date,
  scheduled_time   time,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.content_items;
create trigger set_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.content_items enable row level security;

-- Only authenticated users can read/write
create policy "Authenticated users can select" on public.content_items
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert" on public.content_items
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update" on public.content_items
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete" on public.content_items
  for delete using (auth.role() = 'authenticated');
