-- CEO growth opportunity pipeline
-- Run after schema.sql

CREATE TABLE IF NOT EXISTS public.opportunities (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  category         text CHECK (category IN ('lead-gen', 'website', 'content', 'positioning', 'seo')),
  why_it_matters   text NOT NULL,
  expected_impact  text NOT NULL,
  next_action      text NOT NULL,
  priority         integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),  -- 1=high
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'dismissed')),
  week_generated   date NOT NULL,           -- Monday of generation week
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title, week_generated)
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read opportunities"  ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Agents can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Agents can update opportunities" ON public.opportunities FOR UPDATE USING (true);
