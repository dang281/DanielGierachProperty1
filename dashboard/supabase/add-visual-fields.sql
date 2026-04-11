-- Migration: add visual/Canva fields to content_items
-- Run this in your Supabase SQL editor

alter table public.content_items
  add column if not exists visual_brief     text,
  add column if not exists canva_url        text,
  add column if not exists visual_thumbnail text,
  add column if not exists visual_feedback  text,
  add column if not exists visual_status    text not null default 'needed'
    check (visual_status in ('needed', 'draft', 'needs_revision', 'approved'));
