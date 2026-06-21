-- Add 'queued' status value to content_items
-- 'queued' means the post has been entered into LinkedIn's native scheduler
-- Run this once in the Supabase SQL editor: https://supabase.com/dashboard/project/hmwulvvwsksuyqozuxvw/sql

ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_status_check;

ALTER TABLE content_items ADD CONSTRAINT content_items_status_check
  CHECK (status IN ('idea', 'draft', 'ready', 'scheduled', 'queued', 'posted', 'rejected', 'archived'));
