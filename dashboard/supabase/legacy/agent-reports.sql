-- Agent weekly output reports
-- Run after schema.sql

CREATE TABLE IF NOT EXISTS public.agent_reports (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name       text NOT NULL CHECK (agent_name IN ('social-media', 'seo', 'ceo')),
  week_start       date NOT NULL,          -- Monday of the week
  posts_created    integer NOT NULL DEFAULT 0,
  posts_published  integer NOT NULL DEFAULT 0,
  posts_scheduled  integer NOT NULL DEFAULT 0,
  posts_rejected   integer NOT NULL DEFAULT 0,
  key_themes       text[],                 -- array of theme strings
  what_worked      text,
  what_didnt_work  text,
  next_week_focus  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_name, week_start)
);

ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read agent reports"  ON public.agent_reports FOR SELECT USING (true);
CREATE POLICY "Agents can insert agent reports" ON public.agent_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Agents can update agent reports" ON public.agent_reports FOR UPDATE USING (true);
