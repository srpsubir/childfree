
-- Fix the overly permissive otp_codes insert policy (require authenticated)
DROP POLICY IF EXISTS "Allow public insert on otp_codes" ON public.otp_codes;
CREATE POLICY "Allow authenticated insert on otp_codes"
ON public.otp_codes FOR INSERT TO authenticated WITH CHECK (true);
