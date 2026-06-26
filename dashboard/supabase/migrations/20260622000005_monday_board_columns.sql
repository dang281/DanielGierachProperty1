-- Monday board column metadata.
-- Stores every column from each board including its title, type, position, and
-- raw settings JSON. Status/dropdown columns include the option labels and
-- Monday's exact colours in settings, so the dashboard can render the same
-- pills with the same colours.

create table if not exists public.monday_board_columns (
  id              uuid primary key default gen_random_uuid(),
  board_id        text not null,
  column_id       text not null,
  title           text,
  column_type     text not null,
  position        integer,
  settings        jsonb not null default '{}',
  imported_at     timestamptz not null default now(),
  user_id         uuid references auth.users (id),
  unique (board_id, column_id)
);

create index if not exists monday_board_columns_board_idx
  on public.monday_board_columns (board_id, position);

alter table public.monday_board_columns enable row level security;

drop policy if exists "Authenticated users can select" on public.monday_board_columns;
create policy "Authenticated users can select" on public.monday_board_columns
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.monday_board_columns;
create policy "Authenticated users can insert" on public.monday_board_columns
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.monday_board_columns;
create policy "Authenticated users can update" on public.monday_board_columns
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.monday_board_columns;
create policy "Authenticated users can delete" on public.monday_board_columns
  for delete using (auth.role() = 'authenticated');
