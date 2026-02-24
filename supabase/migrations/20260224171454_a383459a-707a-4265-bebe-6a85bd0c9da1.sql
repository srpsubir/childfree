
-- Create safety_reports table
CREATE TABLE public.safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id),
  category text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, reported_user_id, event_id)
);

ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own reports"
  ON public.safety_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can select own reports or admins"
  ON public.safety_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reports"
  ON public.safety_reports FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny delete on safety_reports"
  ON public.safety_reports FOR DELETE TO authenticated
  USING (false);

-- Create connect_requests table
CREATE TABLE public.connect_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  target_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (requester_id, target_id, event_id)
);

ALTER TABLE public.connect_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own requests"
  ON public.connect_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can select own requests or admins"
  ON public.connect_requests FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = target_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny update on connect_requests"
  ON public.connect_requests FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "Deny delete on connect_requests"
  ON public.connect_requests FOR DELETE TO authenticated
  USING (false);
