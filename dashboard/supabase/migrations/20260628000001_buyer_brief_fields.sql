-- Extend buyer_briefs so it can be linked 1:1 with a monday_leads row and
-- captures full search criteria (ranges + extras) for incoming-property
-- matching.

alter table public.buyer_briefs add column if not exists monday_lead_id text;
alter table public.buyer_briefs add column if not exists beds_max  integer;
alter table public.buyer_briefs add column if not exists baths_max integer;
alter table public.buyer_briefs add column if not exists car_max   integer;
alter table public.buyer_briefs add column if not exists block_min integer;  -- m²
alter table public.buyer_briefs add column if not exists block_max integer;

create unique index if not exists buyer_briefs_monday_lead_idx
  on public.buyer_briefs (monday_lead_id)
  where monday_lead_id is not null;
