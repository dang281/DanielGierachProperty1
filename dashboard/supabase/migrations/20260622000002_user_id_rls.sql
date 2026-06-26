-- user_id + RLS hardening.
-- Two goals:
--   1. Add user_id to every table now, so team mode later is a config flip
--      not a rewrite. All existing rows backfill to Daniel's user id.
--   2. Close the holes flagged in the platform memory: tracked_properties
--      and property_alerts currently have RLS DISABLED. The anon key can read
--      every contact. Enable RLS + authenticated-only policies, matching
--      buyer_briefs.
--
-- HOW TO APPLY:
--   supabase db push
--
-- Safe to re-run: every statement is guarded.

-- ============================================================================
-- Add user_id columns (nullable; backfilled below)
-- ============================================================================
alter table public.content_items    add column if not exists user_id uuid references auth.users (id);
alter table public.buyer_briefs     add column if not exists user_id uuid references auth.users (id);
alter table public.opportunities    add column if not exists user_id uuid references auth.users (id);
alter table public.market_intel     add column if not exists user_id uuid references auth.users (id);
alter table public.agent_reports    add column if not exists user_id uuid references auth.users (id);

do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'tracked_properties') then
    execute 'alter table public.tracked_properties add column if not exists user_id uuid references auth.users (id)';
  end if;
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'property_alerts') then
    execute 'alter table public.property_alerts add column if not exists user_id uuid references auth.users (id)';
  end if;
end $$;

-- ============================================================================
-- Backfill user_id with Daniel's auth user
-- ============================================================================
do $$
declare
  daniel_id uuid;
begin
  select id into daniel_id from auth.users where email = 'dangierach@gmail.com' limit 1;

  if daniel_id is null then
    raise notice 'No auth.users row for dangierach@gmail.com. Backfill skipped. Set user_id manually then re-run.';
    return;
  end if;

  update public.content_items   set user_id = daniel_id where user_id is null;
  update public.buyer_briefs    set user_id = daniel_id where user_id is null;
  update public.opportunities   set user_id = daniel_id where user_id is null;
  update public.market_intel    set user_id = daniel_id where user_id is null;
  update public.agent_reports   set user_id = daniel_id where user_id is null;

  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'tracked_properties') then
    execute format('update public.tracked_properties set user_id = %L where user_id is null', daniel_id);
  end if;
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'property_alerts') then
    execute format('update public.property_alerts set user_id = %L where user_id is null', daniel_id);
  end if;
end $$;

-- ============================================================================
-- tracked_properties: enable RLS, add authenticated-only policies
-- Currently RLS is DISABLED, meaning the anon key can read every contact.
-- ============================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'tracked_properties') then
    execute 'alter table public.tracked_properties enable row level security';

    execute 'drop policy if exists "Authenticated users can select" on public.tracked_properties';
    execute 'create policy "Authenticated users can select" on public.tracked_properties for select using (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can insert" on public.tracked_properties';
    execute 'create policy "Authenticated users can insert" on public.tracked_properties for insert with check (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can update" on public.tracked_properties';
    execute 'create policy "Authenticated users can update" on public.tracked_properties for update using (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can delete" on public.tracked_properties';
    execute 'create policy "Authenticated users can delete" on public.tracked_properties for delete using (auth.role() = ''authenticated'')';
  end if;
end $$;

-- ============================================================================
-- property_alerts: enable RLS, add authenticated-only policies
-- ============================================================================
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'property_alerts') then
    execute 'alter table public.property_alerts enable row level security';

    execute 'drop policy if exists "Authenticated users can select" on public.property_alerts';
    execute 'create policy "Authenticated users can select" on public.property_alerts for select using (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can insert" on public.property_alerts';
    execute 'create policy "Authenticated users can insert" on public.property_alerts for insert with check (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can update" on public.property_alerts';
    execute 'create policy "Authenticated users can update" on public.property_alerts for update using (auth.role() = ''authenticated'')';

    execute 'drop policy if exists "Authenticated users can delete" on public.property_alerts';
    execute 'create policy "Authenticated users can delete" on public.property_alerts for delete using (auth.role() = ''authenticated'')';
  end if;
end $$;
