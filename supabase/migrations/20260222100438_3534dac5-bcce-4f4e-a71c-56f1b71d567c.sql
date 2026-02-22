
-- OTP codes table
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_codes_phone ON public.otp_codes (phone);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Deny direct SELECT (verification via edge function + service role)
CREATE POLICY "Deny direct select on otp_codes"
  ON public.otp_codes FOR SELECT USING (false);

-- Allow public insert (anyone can request an OTP)
CREATE POLICY "Allow public insert on otp_codes"
  ON public.otp_codes FOR INSERT WITH CHECK (true);

-- No updates or deletes
CREATE POLICY "Deny update on otp_codes"
  ON public.otp_codes FOR UPDATE USING (false);

CREATE POLICY "Deny delete on otp_codes"
  ON public.otp_codes FOR DELETE USING (false);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE,
  phone TEXT,
  why TEXT,
  pillar TEXT,
  filters TEXT[] DEFAULT '{}',
  stack TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read for matching engine
CREATE POLICY "Allow public select on profiles"
  ON public.profiles FOR SELECT USING (true);

-- Public insert during beta
CREATE POLICY "Allow public insert on profiles"
  ON public.profiles FOR INSERT WITH CHECK (true);

-- No updates or deletes during beta
CREATE POLICY "Deny update on profiles"
  ON public.profiles FOR UPDATE USING (false);

CREATE POLICY "Deny delete on profiles"
  ON public.profiles FOR DELETE USING (false);
