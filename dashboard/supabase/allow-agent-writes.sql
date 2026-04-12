-- Allow unauthenticated (anon) inserts and updates to content_items
-- Safe to run: agents are trusted local processes, this table has no sensitive data

create policy "Agents can insert content items" on public.content_items
  for insert with check (true);

create policy "Agents can update content items" on public.content_items
  for update using (true);
