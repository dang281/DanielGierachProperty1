-- Raw Monday mirror tables.
-- Faithful 1:1 mirror of the four Monday boards + subitems + board-relation links.
-- The dashboard never reads these directly. It reads the v_* views in the next
-- migration. This separation means we can reshape the user-facing schema
-- without re-running the import.
--
-- Every row keeps its monday_item_id so the import is idempotent (re-running
-- the import upserts on monday_item_id, no duplicates).
--
-- HOW TO APPLY:
--   supabase db push

-- ============================================================================
-- Property Pipeline (board 2076186563, 971 items)
-- ============================================================================
create table if not exists public.monday_pipeline_items (
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

create index if not exists monday_pipeline_items_group_idx
  on public.monday_pipeline_items (monday_group_title);
create index if not exists monday_pipeline_items_updated_idx
  on public.monday_pipeline_items (updated_at_monday desc);

-- ============================================================================
-- Contacts (board 2060096425, 1039 items)
-- ============================================================================
create table if not exists public.monday_contacts (
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

create index if not exists monday_contacts_updated_idx
  on public.monday_contacts (updated_at_monday desc);

-- ============================================================================
-- Buyers/Investors/Developers (board 2060874428, 111 items)
-- ============================================================================
create table if not exists public.monday_leads (
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

create index if not exists monday_leads_group_idx
  on public.monday_leads (monday_group_title);
create index if not exists monday_leads_updated_idx
  on public.monday_leads (updated_at_monday desc);

-- ============================================================================
-- Properties (board 2067629054, 66 items, the "active deals" board)
-- ============================================================================
create table if not exists public.monday_properties (
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

create index if not exists monday_properties_group_idx
  on public.monday_properties (monday_group_title);

-- ============================================================================
-- Subitems (touchpoints / appointments across all parent boards)
-- ============================================================================
create table if not exists public.monday_subitems (
  id                       uuid primary key default gen_random_uuid(),
  monday_item_id           text not null unique,
  parent_monday_item_id    text not null,
  parent_board_id          text not null,
  name                     text,
  raw                      jsonb not null default '{}',
  created_at_monday        timestamptz,
  updated_at_monday        timestamptz,
  imported_at              timestamptz not null default now(),
  user_id                  uuid references auth.users (id)
);

create index if not exists monday_subitems_parent_idx
  on public.monday_subitems (parent_monday_item_id);

-- ============================================================================
-- Board-relation links (one row per linked pair)
-- The contact_property column links contacts to properties; the property_contact
-- column links the other way; the board_relation_mktzhwx6 on leads links to
-- contacts. Capturing as a flat join table so views can resolve relationships
-- without parsing jsonb.
-- ============================================================================
create table if not exists public.monday_links (
  id                          uuid primary key default gen_random_uuid(),
  source_monday_item_id       text not null,
  source_board_id             text not null,
  source_column_id            text not null,
  target_monday_item_id       text not null,
  target_board_id             text,
  imported_at                 timestamptz not null default now(),
  user_id                     uuid references auth.users (id),
  unique (source_monday_item_id, source_column_id, target_monday_item_id)
);

create index if not exists monday_links_source_idx
  on public.monday_links (source_monday_item_id);
create index if not exists monday_links_target_idx
  on public.monday_links (target_monday_item_id);

-- ============================================================================
-- Import runs (audit log so the /app/import page can show what landed when)
-- ============================================================================
create table if not exists public.monday_import_runs (
  id                  uuid primary key default gen_random_uuid(),
  started_at          timestamptz not null default now(),
  finished_at         timestamptz,
  status              text not null default 'running'
    check (status in ('running', 'success', 'failed', 'dry_run')),
  pipeline_count      integer,
  contacts_count      integer,
  leads_count         integer,
  properties_count    integer,
  subitems_count      integer,
  links_count         integer,
  error_message       text,
  user_id             uuid references auth.users (id)
);

create index if not exists monday_import_runs_started_idx
  on public.monday_import_runs (started_at desc);

-- ============================================================================
-- RLS: authenticated-only on every mirror table
-- ============================================================================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'monday_pipeline_items',
    'monday_contacts',
    'monday_leads',
    'monday_properties',
    'monday_subitems',
    'monday_links',
    'monday_import_runs'
  ])
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "Authenticated users can select" on public.%I', t);
    execute format('create policy "Authenticated users can select" on public.%I for select using (auth.role() = ''authenticated'')', t);

    execute format('drop policy if exists "Authenticated users can insert" on public.%I', t);
    execute format('create policy "Authenticated users can insert" on public.%I for insert with check (auth.role() = ''authenticated'')', t);

    execute format('drop policy if exists "Authenticated users can update" on public.%I', t);
    execute format('create policy "Authenticated users can update" on public.%I for update using (auth.role() = ''authenticated'')', t);

    execute format('drop policy if exists "Authenticated users can delete" on public.%I', t);
    execute format('create policy "Authenticated users can delete" on public.%I for delete using (auth.role() = ''authenticated'')', t);
  end loop;
end $$;
