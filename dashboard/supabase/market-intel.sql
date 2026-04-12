-- Daily market intelligence feed
-- Run after schema.sql

CREATE TABLE IF NOT EXISTS public.market_intel (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  summary          text NOT NULL,
  source_url       text,
  category         text CHECK (category IN ('planning', 'infrastructure', 'market', 'development', 'policy', 'data')),
  relevance_score  integer NOT NULL DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
  post_worthy      boolean NOT NULL DEFAULT false,
  suburbs          text[],
  published_date   date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title, created_at::date)
);

ALTER TABLE public.market_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read market intel"  ON public.market_intel FOR SELECT USING (true);
CREATE POLICY "Agents can insert market intel" ON public.market_intel FOR INSERT WITH CHECK (true);
CREATE POLICY "Agents can update market intel" ON public.market_intel FOR UPDATE USING (true);
