
-- Add unique constraint on user_id for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON public.profiles (user_id);
