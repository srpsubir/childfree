
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  address TEXT NOT NULL,
  maps_link TEXT,
  city TEXT NOT NULL DEFAULT 'Berlin',
  max_seats INTEGER NOT NULL DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert events" ON public.events
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update events" ON public.events
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete events" ON public.events
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invitations" ON public.invitations
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own invitation status" ON public.invitations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert invitations" ON public.invitations
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete invitations" ON public.invitations
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add event_id to existing tables table
ALTER TABLE public.tables ADD COLUMN event_id UUID REFERENCES public.events(id);

-- Seed the Berlin event
INSERT INTO public.events (title, date, venue, address, maps_link, city, status)
VALUES (
  'The Berlin Table',
  '2025-03-01T19:00:00+01:00',
  'QBA',
  'Oranienburger Str. 45, 10117 Berlin',
  'https://maps.app.goo.gl/QBA',
  'Berlin',
  'upcoming'
);
