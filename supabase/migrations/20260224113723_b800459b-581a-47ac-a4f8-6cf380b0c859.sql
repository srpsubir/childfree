
-- Add verified columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

-- Create private storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-photos', 'verification-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: users upload their own photo
CREATE POLICY "Users can upload own verification photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-photos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS: users read their own photo
CREATE POLICY "Users can read own verification photo"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-photos'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);
