-- Unified per-item activity timeline.
-- Every interaction with a contact — call, note, status change, follow-up,
-- appraisal booked — lands here as one chronological feed instead of being
-- scattered across First/Second/Third Notes columns.
--
-- Replaces the simpler monday_item_updates table (which we keep for now to
-- avoid data loss; future cleanup migrates old updates → activity).

create table if not exists public.contact_activity (
  id              uuid primary key default gen_random_uuid(),
  monday_item_id  text not null,
  board_slug      text not null,
  activity_type   text not null
    check (activity_type in (
      'call_connected',
      'call_nvml',
      'note',
      'status_change',
      'follow_up_set',
      'appraisal_booked',
      'meeting_scheduled',
      'email_sent',
      'sms_sent',
      'import_note'
    )),
  payload         jsonb not null default '{}',
  body            text,
  created_at      timestamptz not null default now(),
  user_id         uuid references auth.users (id)
);

create index if not exists contact_activity_item_idx
  on public.contact_activity (board_slug, monday_item_id, created_at desc);
create index if not exists contact_activity_created_idx
  on public.contact_activity (created_at desc);

alter table public.contact_activity enable row level security;

drop policy if exists "Authenticated users can select" on public.contact_activity;
create policy "Authenticated users can select" on public.contact_activity
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert" on public.contact_activity;
create policy "Authenticated users can insert" on public.contact_activity
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update" on public.contact_activity;
create policy "Authenticated users can update" on public.contact_activity
  for update using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete" on public.contact_activity;
create policy "Authenticated users can delete" on public.contact_activity
  for delete using (auth.role() = 'authenticated');
