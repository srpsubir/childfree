
-- Create tables table for IRL meetup groups
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Berlin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'forming',
  max_seats INTEGER NOT NULL DEFAULT 6
);

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Deny public insert on tables" ON public.tables FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update on tables" ON public.tables FOR UPDATE USING (false);
CREATE POLICY "Deny public delete on tables" ON public.tables FOR DELETE USING (false);

-- Add table assignment columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN table_id UUID REFERENCES public.tables(id),
  ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;
