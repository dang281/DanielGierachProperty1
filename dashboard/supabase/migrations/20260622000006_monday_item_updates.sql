-- Per-item updates / comments thread.
-- Stores free-text updates on any board item, similar to Monday's "Updates"
-- tab. Scoped by board slug + Monday item id so the dashboard can render a
-- chronological thread inside the detail panel.

create table if not exists public.monday_item_updates (
  id              uuid primary key default gen_random_uuid(),
  monday_item_id  text not null,
  board_slug      text not null,
  body            text not null,
  created_at      timestamptz not null default now(),
  user_id         uuid references auth.users (id)
);

create index if not exists monday_item_updates_item_idx
  on public.monday_item_updates (monday_item_id, created_at desc);

alter table public.monday_item_updates enable row level security;

drop policy if exists "Authenticated users can select" on public.monday_item_updates;
create policy "Authenticated users can select" on public.monday_item_updates
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.monday_item_updates;
create policy "Authenticated users can insert" on public.monday_item_updates
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.monday_item_updates;
create policy "Authenticated users can update" on public.monday_item_updates
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.monday_item_updates;
create policy "Authenticated users can delete" on public.monday_item_updates
  for delete using (auth.role() = 'authenticated');
