-- Baseline migration: consolidates the loose SQL files in supabase/legacy/.
-- Captures the schema-from-code as of 2026-06-22. Tables that were created
-- directly in the Supabase dashboard (tracked_properties, property_alerts,
-- profiles) are NOT in this baseline. Capture them later via:
--   supabase db pull --linked
--
-- HOW TO APPLY:
--   This baseline already matches what's on prod. Do NOT push it.
--   Instead, tell the CLI it's already applied:
--     supabase migration repair --status applied 20260622000001
--   Then future migrations run via `supabase db push`.
--
-- Every statement is idempotent so re-running against prod is also safe.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";

-- ============================================================================
-- Shared trigger function
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- content_items
-- Social posts (LinkedIn, Facebook, Instagram, SEO).
-- Status check was widened in add-queued-status.sql.
-- Visual columns were added in add-visual-fields.sql.
-- ============================================================================
create table if not exists public.content_items (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  platform          text not null check (platform in ('linkedin', 'instagram', 'facebook')),
  content_type      text,
  caption           text,
  platform_variants jsonb,
  objective         text,
  target_audience   text,
  expected_outcome  text,
  cta               text,
  destination_url   text,
  status            text not null default 'idea',
  content_pillar    text check (content_pillar in ('seller', 'authority', 'suburb', 'proof', 'buyer')),
  score             integer check (score >= 1 and score <= 10),
  scheduled_date    date,
  scheduled_time    time,
  notes             text,
  visual_brief      text,
  canva_url         text,
  visual_thumbnail  text,
  visual_feedback   text,
  visual_status     text not null default 'needed'
    check (visual_status in ('needed', 'draft', 'needs_revision', 'approved')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Status check is dropped and recreated to capture the widened set.
alter table public.content_items drop constraint if exists content_items_status_check;
alter table public.content_items add constraint content_items_status_check
  check (status in ('idea', 'draft', 'ready', 'scheduled', 'queued', 'posted', 'rejected', 'archived'));

drop trigger if exists set_updated_at on public.content_items;
create trigger set_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();

alter table public.content_items enable row level security;

drop policy if exists "Authenticated users can select" on public.content_items;
create policy "Authenticated users can select" on public.content_items
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.content_items;
create policy "Authenticated users can insert" on public.content_items
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.content_items;
create policy "Authenticated users can update" on public.content_items
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.content_items;
create policy "Authenticated users can delete" on public.content_items
  for delete using (auth.role() = 'authenticated');

drop policy if exists "Agents can insert content items" on public.content_items;
create policy "Agents can insert content items" on public.content_items
  for insert with check (true);

drop policy if exists "Agents can update content items" on public.content_items;
create policy "Agents can update content items" on public.content_items
  for update using (true);

-- ============================================================================
-- buyer_briefs
-- Private buyer matching list. Strict authenticated-only access.
-- ============================================================================
create table if not exists public.buyer_briefs (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  phone          text,
  email          text,
  monday_link    text,
  suburbs        text[] not null default '{}',
  property_types text[] not null default '{}',
  price_min      numeric,
  price_max      numeric,
  beds_min       integer not null default 0,
  baths_min      integer not null default 0,
  car_min        integer not null default 0,
  extras         text,
  notes          text,
  status         text not null default 'active' check (status in ('active', 'bought', 'archived')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists set_updated_at_buyer_briefs on public.buyer_briefs;
create trigger set_updated_at_buyer_briefs
  before update on public.buyer_briefs
  for each row execute function public.set_updated_at();

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

-- ============================================================================
-- opportunities (CEO growth opportunity pipeline)
-- Open read + agent-write. Paperclip / agents read & write via anon or service.
-- ============================================================================
create table if not exists public.opportunities (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  category        text check (category in ('lead-gen', 'website', 'content', 'positioning', 'seo')),
  why_it_matters  text not null,
  expected_impact text not null,
  next_action     text not null,
  priority        integer not null default 2 check (priority between 1 and 3),
  status          text not null default 'open' check (status in ('open', 'in_progress', 'done', 'dismissed')),
  week_generated  date not null,
  created_at      timestamptz not null default now(),
  unique (title, week_generated)
);

alter table public.opportunities enable row level security;

drop policy if exists "Anyone can read opportunities" on public.opportunities;
create policy "Anyone can read opportunities" on public.opportunities
  for select using (true);

drop policy if exists "Agents can insert opportunities" on public.opportunities;
create policy "Agents can insert opportunities" on public.opportunities
  for insert with check (true);

drop policy if exists "Agents can update opportunities" on public.opportunities;
create policy "Agents can update opportunities" on public.opportunities
  for update using (true);

-- ============================================================================
-- market_intel (daily market intelligence feed)
-- ============================================================================
create table if not exists public.market_intel (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  summary         text not null,
  source_url      text,
  category        text check (category in ('planning', 'infrastructure', 'market', 'development', 'policy', 'data')),
  relevance_score integer not null default 5 check (relevance_score between 1 and 10),
  post_worthy     boolean not null default false,
  suburbs         text[],
  published_date  date,
  created_at      timestamptz not null default now()
);

create unique index if not exists market_intel_title_idx on public.market_intel (title);

alter table public.market_intel enable row level security;

drop policy if exists "Anyone can read market intel" on public.market_intel;
create policy "Anyone can read market intel" on public.market_intel
  for select using (true);

drop policy if exists "Agents can insert market intel" on public.market_intel;
create policy "Agents can insert market intel" on public.market_intel
  for insert with check (true);

drop policy if exists "Agents can update market intel" on public.market_intel;
create policy "Agents can update market intel" on public.market_intel
  for update using (true);

-- ============================================================================
-- agent_reports (weekly output reports per agent)
-- ============================================================================
create table if not exists public.agent_reports (
  id              uuid primary key default uuid_generate_v4(),
  agent_name      text not null check (agent_name in ('social-media', 'seo', 'ceo')),
  week_start      date not null,
  posts_created   integer not null default 0,
  posts_published integer not null default 0,
  posts_scheduled integer not null default 0,
  posts_rejected  integer not null default 0,
  key_themes      text[],
  what_worked     text,
  what_didnt_work text,
  next_week_focus text,
  created_at      timestamptz not null default now(),
  unique (agent_name, week_start)
);

alter table public.agent_reports enable row level security;

drop policy if exists "Anyone can read agent reports" on public.agent_reports;
create policy "Anyone can read agent reports" on public.agent_reports
  for select using (true);

drop policy if exists "Agents can insert agent reports" on public.agent_reports;
create policy "Agents can insert agent reports" on public.agent_reports
  for insert with check (true);

drop policy if exists "Agents can update agent reports" on public.agent_reports;
create policy "Agents can update agent reports" on public.agent_reports
  for update using (true);

-- ============================================================================
-- NOT IN BASELINE (capture via `supabase db pull --linked` later):
--   - tracked_properties (created in dashboard UI; RLS currently DISABLED, see 00002)
--   - property_alerts (created in dashboard UI; RLS currently DISABLED, see 00002)
--   - profiles (referenced in code but no schema in repo)
-- ============================================================================
