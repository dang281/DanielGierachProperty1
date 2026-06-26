-- Derived views over the Monday mirror tables.
-- The dashboard reads from these. Raw monday_* tables stay untouched so the
-- import can be re-run idempotently and so we can reshape this layer without
-- re-importing.
--
-- HOW TO APPLY:
--   supabase db push

-- ============================================================================
-- Stage label mapping helper
-- Pipeline groups are long-form ("HOTSTOCK - Weekly Touch Point..."). The UI
-- wants short labels matching the existing PropertiesView ordering.
-- ============================================================================
create or replace function public.pipeline_stage_short(group_title text)
returns text language sql immutable as $$
  select case
    when group_title like 'HOTSTOCK%'        then 'Hotstock'
    when group_title like 'WARMSTOCK%'       then 'Warmstock'
    when group_title like 'HAPPY TO CHAT%'   then 'Happy to Chat'
    when group_title like 'UNSURE STOCK%'    then 'Unsure Stock'
    when group_title = 'NOT PICKING UP PHONE' then 'Not Picking Up'
    when group_title = 'Off-Market'          then 'Off-Market'
    when group_title = 'From Open Homes'     then 'From Open Homes'
    when group_title = 'UNFILTERED'          then 'Unfiltered'
    when group_title = 'Scanned QR Code From DL' then 'Scanned QR'
    when group_title like 'Buyers of Properties%' then 'Past Buyers'
    when group_title = 'Not interested'      then 'Not Interested'
    when group_title = 'Lost'                then 'Lost'
    else group_title
  end;
$$;

-- ============================================================================
-- v_pipeline
-- Flat seller-pipeline view. Extracts the columns the UI actually uses.
-- ============================================================================
create or replace view public.v_pipeline as
select
  i.monday_item_id,
  i.name,
  i.monday_group_title                                   as stage_raw,
  public.pipeline_stage_short(i.monday_group_title)      as stage,
  i.raw->'phone_mkvdbvr4'->>'text'                       as phone,
  i.raw->'email_mkwpd6dn'->>'text'                       as email,
  i.raw->'property_address'->>'text'                     as address,
  nullif(i.raw->'date_mkvwk1we'->>'text', '')::date      as follow_up_date,
  nullif(i.raw->'date_mkzjzxnd'->>'text', '')::date      as event_date,
  i.raw->'color_mm0dp0q8'->>'text'                       as appraised,
  i.raw->'color_mm0dpras'->>'text'                       as buy_to_sell,
  i.raw->'color_mkvvc85t'->>'text'                       as owner_type,
  i.raw->'color_mkvv33b4'->>'text'                       as property_type,
  i.raw->'color_mm3jcha2'->>'text'                       as nvml_status,
  i.raw->'text_mm0d1cy2'->>'text'                        as appraisal_range,
  i.raw->'link_mkvdcbdw'->'value'->>'url'                as nurture_cloud_url,
  i.raw->'link_mkvv2dsy'->'value'->>'url'                as price_finder_url,
  i.raw->'long_text_mkza2qtb'->>'text'                   as contact_name_freeform,
  i.raw->'long_text_mm35b58k'->>'text'                   as quick_recap,
  concat_ws(
    E'\n\n---\n\n',
    nullif(i.raw->'long_text_mkvwnqqp'->>'text', ''),
    nullif(i.raw->'long_text_mm35hdg2'->>'text', ''),
    nullif(i.raw->'long_text_mm3xdjdm'->>'text', ''),
    nullif(i.raw->'long_text_mm3xbawf'->>'text', '')
  )                                                      as notes_combined,
  i.raw->'long_text_mkvwnqqp'->>'text'                   as notes_first,
  i.raw->'long_text_mm35hdg2'->>'text'                   as notes_second,
  i.raw->'long_text_mm3xdjdm'->>'text'                   as notes_third,
  i.raw->'long_text_mm3xbawf'->>'text'                   as notes_third_cont,
  i.created_at_monday,
  i.updated_at_monday,
  i.imported_at,
  i.user_id
from public.monday_pipeline_items i;

-- ============================================================================
-- v_contacts
-- ============================================================================
create or replace view public.v_contacts as
select
  c.monday_item_id,
  c.name,
  c.monday_group_title                                   as group_title,
  c.raw->'text_mkwzxx74'->>'text'                        as first_name,
  c.raw->'contact_phone'->>'text'                        as phone,
  c.raw->'contact_email'->>'text'                        as email,
  c.raw->'contact_notes'->>'text'                        as notes,
  c.created_at_monday,
  c.updated_at_monday,
  c.imported_at,
  c.user_id
from public.monday_contacts c;

-- ============================================================================
-- v_leads (Buyers / Investors / Developers / BuyToSell)
-- ============================================================================
create or replace view public.v_leads as
select
  l.monday_item_id,
  l.name,
  l.monday_group_title                                   as lead_type,
  l.raw->'text_mkzvzfft'->>'text'                        as company_name,
  l.raw->'dropdown_mktze7rg'->>'text'                    as suburbs,
  l.raw->'long_text_mkv4gyn8'->>'text'                   as notes,
  l.raw->'status'->>'text'                               as status,
  nullif(l.raw->'date4'->>'text', '')::date              as event_date,
  nullif(l.raw->'date_mktztctz'->>'text', '')::date      as follow_up_date,
  l.raw->'lookup_mkwq1n91'->>'text'                      as contact_phone_mirror,
  l.raw->'lookup_mkv1bshd'->>'text'                      as contact_address_mirror,
  l.created_at_monday,
  l.updated_at_monday,
  l.imported_at,
  l.user_id
from public.monday_leads l;

-- ============================================================================
-- v_active_properties (the curated 66-item Properties board)
-- ============================================================================
create or replace view public.v_active_properties as
select
  p.monday_item_id,
  p.name,
  p.monday_group_title                                   as group_title,
  p.raw->'property_address'->>'text'                     as address,
  p.raw->'phone_mkvdbvr4'->>'text'                       as phone,
  p.raw->'property_type'->>'text'                        as stage,
  p.raw->'contract_type'->>'text'                        as contract_type,
  p.raw->'color_mktzz7vq'->>'text'                       as property_type,
  p.raw->'color_mkv49h2d'->>'text'                       as use_type,
  p.raw->'color_mktyz4be'->>'text'                       as appraised,
  nullif(p.raw->'property_price'->>'text', '')::numeric  as price,
  nullif(p.raw->'property_sqft'->>'text', '')::numeric   as sqm,
  p.raw->'property_bedrooms'->>'text'                    as bedrooms,
  p.raw->'property_bathrooms'->>'text'                   as bathrooms,
  p.raw->'dropdown_mktzmwbz'->>'text'                    as car_spaces,
  nullif(p.raw->'numeric_mkv2497c'->>'text', '')::numeric as council_rates,
  nullif(p.raw->'numeric_mkv2a9b5'->>'text', '')::numeric as body_corp_pa,
  nullif(p.raw->'numeric_mkv2zksv'->>'text', '')::numeric as rent_pw,
  nullif(p.raw->'date_mkv2hk7w'->>'text', '')::date      as end_of_lease,
  nullif(p.raw->'date_mkv4na4h'->>'text', '')::date      as auction_date,
  nullif(p.raw->'date_mkvd8wke'->>'text', '')::date      as follow_up_date,
  nullif(p.raw->'numeric_mktz1450'->>'text', '')::numeric as purchased_price,
  p.raw->'link_mkvdcbdw'->'value'->>'url'                as nurture_cloud_url,
  p.created_at_monday,
  p.updated_at_monday,
  p.imported_at,
  p.user_id
from public.monday_properties p;

-- ============================================================================
-- v_notes_timeline
-- One row per note across pipeline + contacts + leads. Sort by entered_at to
-- get a chronological feed per contact in the UI.
-- ============================================================================
create or replace view public.v_notes_timeline as
  select
    i.monday_item_id                                     as source_id,
    'pipeline'                                           as source_type,
    'First notes'                                        as label,
    i.raw->'long_text_mkvwnqqp'->>'text'                 as body,
    i.created_at_monday                                  as entered_at,
    i.user_id
  from public.monday_pipeline_items i
  where nullif(i.raw->'long_text_mkvwnqqp'->>'text', '') is not null
  union all
  select
    i.monday_item_id, 'pipeline', 'Second notes',
    i.raw->'long_text_mm35hdg2'->>'text',
    i.updated_at_monday,
    i.user_id
  from public.monday_pipeline_items i
  where nullif(i.raw->'long_text_mm35hdg2'->>'text', '') is not null
  union all
  select
    i.monday_item_id, 'pipeline', 'Third notes',
    concat_ws(E'\n', nullif(i.raw->'long_text_mm3xdjdm'->>'text', ''), nullif(i.raw->'long_text_mm3xbawf'->>'text', '')),
    i.updated_at_monday,
    i.user_id
  from public.monday_pipeline_items i
  where nullif(i.raw->'long_text_mm3xdjdm'->>'text', '') is not null
     or nullif(i.raw->'long_text_mm3xbawf'->>'text', '') is not null
  union all
  select
    c.monday_item_id, 'contact', 'Contact notes',
    c.raw->'contact_notes'->>'text',
    c.updated_at_monday,
    c.user_id
  from public.monday_contacts c
  where nullif(c.raw->'contact_notes'->>'text', '') is not null
  union all
  select
    l.monday_item_id, 'lead', 'Lead notes',
    l.raw->'long_text_mkv4gyn8'->>'text',
    l.updated_at_monday,
    l.user_id
  from public.monday_leads l
  where nullif(l.raw->'long_text_mkv4gyn8'->>'text', '') is not null;

-- ============================================================================
-- v_subitem_appointments
-- ============================================================================
create or replace view public.v_subitem_appointments as
select
  s.monday_item_id,
  s.parent_monday_item_id,
  s.parent_board_id,
  s.name,
  s.raw->'status'->>'text'                               as status,
  nullif(s.raw->'date0'->>'text', '')::date              as date_booked_for,
  s.raw->'text_mktz26yh'->>'text'                        as notes,
  s.created_at_monday,
  s.updated_at_monday,
  s.user_id
from public.monday_subitems s;
